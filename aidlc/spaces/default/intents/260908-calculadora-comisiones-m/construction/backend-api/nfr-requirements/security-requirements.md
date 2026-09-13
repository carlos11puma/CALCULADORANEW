# NFR Requirements — backend-api — Security Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:rules] `construction/backend-api/functional-design/rules.md`
- [upstream:entities] `construction/backend-api/functional-design/entities.md`
- [upstream:api-contract-security] `construction/api-contract/nfr-requirements/security-requirements.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`
- [upstream:project-rules] `aidlc/spaces/default/memory/project.md`

`api-contract` ya fijó NFR3.1-NFR3.8 y NFR4.1 como los requisitos de seguridad exigidos **al contrato** (forma del token, qué nunca se expone, control de acceso por rol resuelto server-side). Este archivo continúa esa misma numeración con **cómo `backend-api` los implementa** internamente, más lo que quedó explícitamente pendiente para esta unidad: almacenamiento cifrado de credenciales (nota de continuidad #1 de la revisión de `api-contract`) y la duración de sesión del supervisor (ya resuelta en Functional Design de esta unidad — Q1, BR1.5).

## NFR3 — Seguridad (continuación de api-contract)

- **NFR3.9**: `User.passwordHash` y `User.pin` se almacenan con `bcrypt` (salt automático, nunca un hash sin salt) — implementa el "credenciales cifradas" de NFR3 que `api-contract` dejó pendiente para esta unidad (Q1 de `nfr-requirements-questions.md`).
- **NFR3.10**: la sesión (`Session.id` o campo de token dedicado) es un valor opaco de alta entropía, nunca un JWT ni un valor predecible (ej. incremental) — cada petición a un endpoint protegido resuelve el token con una consulta indexada a `Session` (índice `token` de `entities.md`), confirma `revokedAt` nulo, y solo entonces continúa (Q2).
- **NFR3.11**: el rol (`vendedor`/`supervisor`) usado para autorizar cada petición se resuelve exclusivamente server-side, siguiendo `Session.userId → User.role` — implementado como un guard de NestJS que se ejecuta antes del handler de cada endpoint protegido, nunca leyendo un campo de rol del body o de un header enviado por el cliente (continúa NFR3.6/NFR3.7 de `api-contract`, ahora como mecanismo concreto).
- **NFR3.12**: la cadena de conexión de Neon y cualquier secreto de configuración del servicio se leen exclusivamente de variables de entorno, nunca hardcodeados ni comiteados al repositorio — mandato ya vigente en `project.md` § Forbidden, reafirmado aquí como el requisito de seguridad que lo origina (NFR3 + protección de datos de comisión/salario).
- **NFR3.13**: los logs de la aplicación (`observability-requirements.md`) nunca incluyen `passwordHash`, `pin`, ni el valor completo de un token de sesión — a lo sumo un identificador truncado/hasheado para correlación de incidentes, extendiendo NFR3.2 de `api-contract` (nunca se expone en response) a "nunca se expone en logs".

## NFR4 — Disponibilidad offline (continuación de api-contract)

- **NFR4.2**: la idempotencia de sincronización por `(vendorId, saleDate)` que `api-contract` garantiza contractualmente (NFR4.1, BR3.3) se implementa con una restricción `UNIQUE` a nivel de base de datos sobre `(vendorId, saleDate)` en la tabla `DailySale` (`entities.md` § index_hints), no solo con una verificación de aplicación — así la garantía de "nunca duplica" se sostiene incluso ante una condición de carrera entre dos peticiones concurrentes (ej. reintento de red del mismo dispositivo), que una verificación de solo aplicación (leer-luego-escribir) no cerraría por sí sola.

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR3.9 | Hash bcrypt para passwordHash y pin | NFR3 (texto literal) / Q1 |
| NFR3.10 | Token opaco de alta entropía, validado por lookup indexado | NFR3.1 de api-contract / Q2 |
| NFR3.11 | Rol resuelto server-side vía guard de NestJS, nunca del cliente | NFR3.6/3.7 de api-contract |
| NFR3.12 | Secretos solo por variable de entorno | project.md § Forbidden |
| NFR3.13 | Credenciales y token nunca en logs | NFR3.2 de api-contract, extendido a logging |
| NFR4.2 | Restricción UNIQUE de base de datos en (vendorId, saleDate) | NFR4.1 de api-contract / BR3.3 |

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T15:53:30Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | `security-requirements.md` NFR3.9 / W2 de `functional-spec.md` | El PIN del supervisor tiene un espacio de valores mucho más chico que una contraseña de vendedor; `bcrypt` protege el hash ante una fuga de base de datos, pero ningún requisito de esta unidad ni `rules.md` define un límite de intentos fallidos (rate limiting/lockout) en `POST /api/v1/auth/login/supervisor` — un atacante con acceso de red al endpoint podría intentar fuerza bruta online sin ser bloqueado | No bloquea para el MVP (un solo supervisor, dispositivo físico controlado por Carlos, sin exposición pública amplia): agregar un límite de intentos fallidos por IP/ventana de tiempo en Code Generation, documentado aquí como riesgo aceptado explícitamente en vez de un hueco silencioso | New |
| R-02 | Minor | `security-requirements.md` NFR3.10 / `entities.md` User.active | Ningún requisito de esta unidad especifica qué pasa con una `Session` ya emitida de un `User` que pasa a `active=false` después — NFR3.10 valida `revokedAt` nulo, pero no cruza `User.active` en el mismo lookup, dejando abierta la ventana entre desactivar un usuario y que su sesión existente deje de autenticar | No bloquea: en Code Generation, el lookup de sesión (NFR3.10) debe unir `Session` con `User` y rechazar también cuando `User.active=false`, no solo cuando `revokedAt` no es nulo | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `bun .claude/tools/aidlc-sensor-traceability.ts --output-path .../nfr-requirements/traceability.json --stage-slug nfr-requirements` | PASS: `{"pass":true,"gaps":[],"orphans":[],...}` | Los 7 NFR de inception (NFR1-NFR7) están cubiertos (OK o N/A justificado); NFR2 y NFR5 correctamente marcados N/A por ser responsabilidad de negocio/mobile-app fuera de esta unidad |
| Verificación cruzada NFRx.y vs. `tech-stack-decisions.md` | PASS (manual) | Cada decisión de `tech-stack-decisions.md` (bcrypt, token opaco, `@nestjs/schedule`, Prisma, logging a stdout, sin SLA 24/7) tiene su NFR de respaldo correspondiente en `security-requirements.md`/`reliability-requirements.md`/`observability-requirements.md`/`scalability-requirements.md`, sin decisión huérfana ni NFR sin decisión de implementación asociada |
| Verificación de continuidad de numeración NFR con `api-contract` | PASS (manual) | NFR3.9-NFR3.13 continúan tras NFR3.1-NFR3.8 de `api-contract` sin colisión; NFR4.2 continúa tras NFR4.1 |

### Summary

Los requisitos de seguridad, rendimiento, escalabilidad, confiabilidad y observabilidad de `backend-api` están completos, correctamente heredados de los NFR de inception con sub-numeración, y consistentes entre sí y con `functional-design/rules.md`. Los dos hallazgos (rate limiting de PIN, cruce de `User.active` en la validación de sesión) son mejoras de endurecimiento razonables para un MVP de un solo supervisor con acceso físico controlado — ninguno bloquea, ambos quedan documentados como trabajo explícito de Code Generation en vez de huecos silenciosos.
