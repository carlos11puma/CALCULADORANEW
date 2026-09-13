# NFR Design — backend-api — Security Design

## Sources

- [upstream:security-requirements] `construction/backend-api/nfr-requirements/security-requirements.md`
- [upstream:functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:rules] `construction/backend-api/functional-design/rules.md`
- [upstream:nfr-design-questions] `construction/backend-api/nfr-design/nfr-design-questions.md`

## Diseño: rate limiting de login (cierra R-01, Q1)

`@nestjs/throttler` protege `POST /api/v1/auth/login/vendedor` y `POST /api/v1/auth/login/supervisor` con una regla dedicada, más estricta que el límite global de la API: 5 intentos fallidos por minuto por combinación (IP, identificador de credencial — `username` o el hecho de intentar el endpoint de PIN), con backoff exponencial de bloqueo temporal tras exceder el límite (ej. 1 min → 5 min → 15 min en intentos sucesivos). Un intento exitoso resetea el contador. Implementado como un `Guard` dedicado (`LoginThrottlerGuard`) aplicado solo a los dos endpoints de login, no al resto de la API (que ya tiene su propio límite global, más laxo, de abuso general).

```
// Pseudocódigo ilustrativo
@UseGuards(LoginThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60_000 } })
@Post('auth/login/supervisor')
async loginSupervisor(@Body() dto: LoginSupervisorDto) { ... }
```

## Diseño: guard de autenticación (cierra R-02, Q2)

Un único `AuthGuard` global (aplicado a todo endpoint salvo `/api/v1/auth/login/*`) resuelve el token del header `Authorization: Bearer`, y ejecuta una sola consulta Prisma con `include` para traer `Session` y su `User` relacionado en un solo round-trip:

```
// Pseudocódigo ilustrativo
const session = await prisma.session.findUnique({
  where: { token },
  include: { user: true },
});
if (!session || session.revokedAt || !session.user.active) {
  throw new UnauthorizedException(); // 401 — cierra R-02: revokedAt Y active en una sola consulta
}
```

El guard adjunta `{ userId, role }` al request (`request.user`) para que los controllers/services resuelvan autorización (NFR3.11) sin volver a consultar `Session`.

## Diseño: autorización por rol

Un `RolesGuard` complementario (decorador `@Roles('supervisor')`) se aplica a los endpoints de administración (roster, presupuesto, tramos, notificación manual — BR1.2/BR1.3 de `api-contract`) y lee `request.user.role` (ya resuelto por `AuthGuard`, nunca de un campo del body o header) — implementación concreta de NFR3.11.

## Diseño: hash de credenciales

`bcrypt.hash(value, 10)` (factor de costo 10, balance estándar entre seguridad y latencia para este volumen) al crear/actualizar `User.passwordHash` y `User.pin`; `bcrypt.compare` en W1/W2 de login — nunca se reconstruye ni se compara el valor en texto plano fuera de esa comparación (NFR3.9).

## Diseño: validación de entrada

Cada endpoint usa un DTO de `class-validator`/`class-transformer` con `ValidationPipe` global (`whitelist: true, forbidNonWhitelisted: true`) — rechaza automáticamente cualquier campo no declarado en el DTO además de validar tipo/rango (BR2.1, BR3.1 de `api-contract`, ya cubiertos en su propio contrato; aquí se especifica el mecanismo concreto de aplicación server-side).

## Diseño: gestión de secretos (Q5)

`@nestjs/config` con un esquema de validación (`class-validator` sobre una clase `EnvironmentVariables`, o `zod`) registrado en `ConfigModule.forRoot({ validate })` — el proceso NestJS falla al arrancar (antes de aceptar tráfico) si falta `DATABASE_URL` u otra variable requerida, en vez de fallar en el primer request que la necesite (NFR3.12).

## Resumen

| ID | Diseño |
|---|---|
| NFR3.9 | `bcrypt.hash`/`compare`, factor de costo 10 |
| NFR3.10 | `AuthGuard` global, token opaco, consulta indexada por token |
| NFR3.11 | `RolesGuard` + decorador `@Roles`, lee `request.user.role` ya resuelto por `AuthGuard` |
| NFR3.12 | `@nestjs/config` con validación de esquema, fail-fast al arrancar (Q5) |
| NFR3.13 | Interceptor de logging (ver `observability-design.md`) excluye explícitamente campos de credencial y el token completo |
| NFR4.2 | Restricción `UNIQUE(vendorId, saleDate)` a nivel de esquema Prisma/PostgreSQL sobre `DailySale` |
| R-01 (cierre) | `LoginThrottlerGuard` vía `@nestjs/throttler`, 5 intentos/min por IP+credencial, backoff exponencial (Q1) |
| R-02 (cierre) | `AuthGuard` rechaza por `revokedAt` no nulo O `User.active=false`, en una sola consulta con `include` (Q2) |

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T16:02:43Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-03 | Minor | `security-design.md` § Diseño: guard de autenticación | El diseño del `AuthGuard` (cierre de R-02) valida `revokedAt` y `User.active`, pero `entities.md` también modela `Vendor.active` como un campo independiente — un supervisor podría desactivar un `Vendor` del roster (dejando `User.active=true`, ya que la entidad que se desactiva administrativamente es `Vendor`, no `User` directamente) sin que eso bloquee el login/uso de ese vendedor, porque el guard no cruza `Vendor.active` cuando el rol es `vendedor` | No bloquea para el MVP (el flujo de "desactivar vendedor" no es una historia asignada explícitamente en `unit-of-work-story-map.md` — US2.1 solo cubre agregar/editar, no desactivar): documentar en Code Generation que, si se implementa una acción de desactivación de `Vendor`, el `AuthGuard` debe extender su `include` para también unir `Vendor` cuando `User.role=vendedor` y rechazar si `Vendor.active=false` | New |
| R-04 | Minor | `security-design.md` § Diseño: rate limiting de login | El almacenamiento por defecto de `@nestjs/throttler` es en memoria del proceso — correcto para el despliegue de instancia única que `scalability-design.md` confirma para el MVP, pero dejaría de contar intentos correctamente si el servicio alguna vez escalara horizontalmente (cada instancia tendría su propio contador) | No bloquea: documentado como continuidad — si `scalability-design.md` cambia a múltiples instancias en el futuro, el storage del throttler debe migrar a uno compartido (ej. Redis) | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `bun .claude/tools/aidlc-sensor-traceability.ts --output-path .../nfr-design/traceability.json --stage-slug nfr-design` | PASS: `{"pass":true,"gaps":[],"orphans":[],...}` | Los 21 NFRx.y propios de `backend-api` están cubiertos con una solución de diseño concreta; los 6 ids de continuidad de `api-contract` mencionados en el texto de `security-requirements.md` quedan correctamente marcados N/A |
| Verificación cruzada de los 7 artefactos entre sí | PASS (manual) | Cada decisión de `tech-stack-decisions.md` (NFR Requirements) tiene su diseño concreto correspondiente; `logical-components.md` es consistente con los 6 componentes de `components.md`; ningún NFRx.y queda sin diseño ni un diseño sin NFR que lo origine |
| Verificación de cierre de R-01/R-02 (hallazgos de NFR Requirements) | PASS (manual) | `LoginThrottlerGuard` (R-01) y el `include` único Session→User con chequeo de `active` (R-02) están diseñados explícitamente, con pseudocódigo ilustrativo, cerrando ambos hallazgos |

### Summary

El diseño de rendimiento, seguridad, escalabilidad, confiabilidad, observabilidad y los límites de componente lógico de `backend-api` son completos, consistentes entre sí, y cierran explícitamente los dos hallazgos abiertos de NFR Requirements (R-01, R-02). Los dos hallazgos nuevos (R-03, R-04) son continuidad hacia una funcionalidad no asignada a esta unidad (desactivación de vendedor) y hacia un escenario de escala futura (múltiples instancias) respectivamente — ninguno bloquea: un desarrollador podría implementar `backend-api` a partir de este diseño sin preguntarle al arquitecto.
