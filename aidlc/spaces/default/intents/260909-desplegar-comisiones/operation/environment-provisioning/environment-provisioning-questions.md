# Environment Provisioning — Preguntas de Clarificación

## Sources

- [upstream:infrastructure-specification] `construction/infrastructure-design/infrastructure-specification.md`
- [upstream:cd-config] `construction/deployment-pipeline/cd-config.md` — nota: ruta real `operation/deployment-pipeline/cd-config.md`
- [upstream:security-design] `construction/nfr-design/security-design.md`
- [upstream:team-practices] `team.md` §1-§3
- [contexto: archivos reales del repo] `packages/backend-api/render.yaml`, `packages/backend-api/src/common/guards/auth.guard.ts`, `packages/backend-api/src/auth/auth.service.ts`, `packages/backend-api/src/config/env.validation.ts`

## Q1 — El "JWT secret" que varios documentos dan por hecho no existe en el código real

`security-design.md` (NFR-D4, ya aprobado en esta misma sesión de este intent) e
`infrastructure-specification.md` asumen que `backend-api` firma y valida JSON Web Tokens, y por
eso diseñan un secreto JWT que debe separarse por ambiente (staging vs. producción) igual que
`DATABASE_URL`.

Al auditar el código real de `260908` para preparar esta guía, no aparece ningún uso de JWT en
ningún lado: `env.validation.ts` no declara ninguna variable de secreto además de `DATABASE_URL`;
`auth.guard.ts` no verifica ni decodifica un token firmado — busca el token literal recibido en el
header `Authorization: Bearer` directamente contra una tabla de sesiones en la base de datos
(`where: { token }`); `auth.service.ts` genera y revoca esas mismas sesiones opacas, sin ninguna
librería de JWT (`jsonwebtoken`, `@nestjs/jwt`) en el código ni en `package.json`. La autenticación
real es de sesión opaca respaldada por Postgres, no JWT firmado con secreto.

Esto no es una brecha de seguridad — de hecho, una sesión opaca revocable en base de datos es al
menos tan segura como un JWT, y evita el problema clásico de invalidar tokens JWT ya emitidos. Es
una discrepancia de documentación heredada de una asunción de arquitectura que nunca se implementó
así.

**¿Cómo se resuelve esta discrepancia para efectos de aprovisionamiento?**

A. `render.yaml` y los secretos de los GitHub Environments (`staging`/`production`) declaran
   únicamente `DATABASE_URL` como secreto real a separar por ambiente — no se crea ningún
   `JWT_SECRET` ficticio porque no hay código que lo consuma. Esta etapa deja constancia de la
   discrepancia para que quede documentada, sin reabrir ni reescribir `security-design.md` (que
   sigue siendo válido en su intención — separar secretos por ambiente — aunque su inventario de
   "cuáles" secretos existen estaba equivocado en este punto).
B. Agregar un `JWT_SECRET` de todas formas, por si se usa en el futuro.
C. Otra resolución (especificar).

[Answer]: A. `render.yaml` y los secretos de los GitHub Environments (`staging`/`production`) declaran únicamente `DATABASE_URL` como secreto real a separar por ambiente — no se crea ningún `JWT_SECRET` ficticio porque no hay código que lo consuma. Esta etapa deja constancia de la discrepancia para que quede documentada, sin reabrir ni reescribir `security-design.md` (que sigue siendo válido en su intención — separar secretos por ambiente — aunque su inventario de "cuáles" secretos existen estaba equivocado en este punto).

## Q2 — Los dos prerequisitos bloqueantes de `team.md` §1 tampoco se pueden cerrar desde esta sesión

`team.md` §1 exige, como primer paso de este intent y antes de cualquier aprovisionamiento real: (1)
generar el cliente Prisma real contra `binaries.prisma.sh`, y (2) actualizar las dependencias con
vulnerabilidades críticas/altas conocidas. Se intentaron ambos desde este sandbox de esta sesión:

- `npx prisma generate` real: falla con `403 Forbidden` al intentar descargar el checksum del motor
  desde `binaries.prisma.sh` — el mismo tipo de restricción de red que ya bloqueó el hook de
  auditoría (el proxy de este entorno no permite ese host). No es un problema del proyecto, es una
  limitación de este entorno de sandbox de Cowork.
- `npm audit` real (sí funciona, el registro de npm es alcanzable): confirma 53 vulnerabilidades (1
  crítica, 16 altas, 34 moderadas, 2 bajas). `npm audit fix --force` resolvería la mayoría pero
  incluye cambios de versión con breaking changes (ej. `@nestjs/schedule` a una major distinta) que
  requieren correr y revisar la suite de 336 pruebas después — no es seguro ejecutarlo a ciegas sin
  poder validar con un cliente Prisma real generado (bloqueado por el punto anterior) en el mismo
  entorno.

**¿Cómo se procede con estos dos prerequisitos, dado que no se pueden cerrar desde este chat?**

A. Documentar en esta etapa, como primera acción concreta de la guía de aprovisionamiento, que Carlos
   (o un runner de GitHub Actions con egress real, una vez el repo esté en GitHub) ejecuta
   `npx prisma generate` y `npm audit fix`/`npm audit fix --force` + la suite completa de pruebas en
   un entorno con red real — no en este chat — antes de tocar cualquier cuenta o infraestructura de
   producción. Esta etapa da los comandos exactos y el criterio de éxito, pero no los ejecuta.
B. Ignorar estos prerequisitos por ahora y continuar con el aprovisionamiento igual.
C. Otra resolución (especificar).

[Answer]: A. Documentar en esta etapa, como primera acción concreta de la guía de aprovisionamiento, que Carlos (o un runner de GitHub Actions con egress real, una vez el repo esté en GitHub) ejecuta `npx prisma generate` y `npm audit fix`/`npm audit fix --force` + la suite completa de pruebas en un entorno con red real — no en este chat — antes de tocar cualquier cuenta o infraestructura de producción. Esta etapa da los comandos exactos y el criterio de éxito, pero no los ejecuta.

## Assumptions & Open Questions

- Esta sesión no tiene acceso al navegador ni a la computadora de Carlos con shell (confirmado en
  turnos previos de este intent) — toda la creación de cuentas (Neon, Render, Expo/EAS) y carga de
  secretos la ejecuta Carlos siguiendo la guía de `environment-inventory.md`, no esta sesión.
- Las dos ediciones de archivo ya diseñadas y aprobadas en Infrastructure Design
  (`render.yaml` con dos servicios, `environment: staging` en `mobile-app-ci.yml`) sí se aplican en
  esta etapa con el Edit tool, igual que se hizo en CI Pipeline — no requieren que las cuentas ya
  existan, son cambios de código puro.
- El reemplazo de las URLs placeholder de `eas.json` (Q1 de `deployment-pipeline-questions.md`) sí
  requiere que las cuentas de Render ya existan — se documenta como paso manual de Carlos dentro de
  esta misma guía, no se puede completar por adelantado.

**Confirmación de asunciones:**

A. Accept assumptions
B. Convert to follow-up questions

[Answer]: A. Accept assumptions

## Consolidated Summary Confirmation

- **Q1**: `security-design.md` asumía JWT; el código real usa sesiones opacas en base de datos — no
  se crea un `JWT_SECRET` ficticio, solo `DATABASE_URL` se separa por ambiente.
- **Q2**: los dos prerequisitos bloqueantes de `team.md` §1 (Prisma real, dependencias vulnerables)
  no se pueden cerrar desde este chat por la misma limitación de red de este entorno de sandbox —
  quedan documentados como la primera acción concreta que Carlos ejecuta en su propia máquina o vía
  GitHub Actions, con comandos exactos y criterio de éxito, antes de continuar con cualquier
  aprovisionamiento real.
- Esta etapa aplica de verdad las dos ediciones de archivo ya aprobadas (`render.yaml`,
  `mobile-app-ci.yml`) y produce una guía paso a paso (`environment-inventory.md`) más un checklist
  de validación (`validation-report.md`) para que Carlos ejecute el resto fuera de este chat.

**¿Es correcto este resumen?**

[Answer]: Looks correct
