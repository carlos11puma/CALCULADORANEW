# Team-Level Rules

> This team's affirmed practices and corrections. Loaded after `org.md` as
> strict-additive guidance; contradictions with broader policy are rejected.
> Populated by the practices-discovery affirmation gate. Edit at the gate,
> not directly.

## Way of Working

Heredado sin cambios de `team.md` — ver esa sección para el detalle completo
(trunk-based, ramas cortas por función integradas a `main` en 1-2 días). No
se re-discute en este intent.

## Walking Skeleton

No aplica a este intent. `260909` no es una etapa de Construction: no genera
Bolts nuevos ni código de aplicación, y no construye ninguna versión mínima
de punta a punta — despliega a infraestructura real lo que la walking
skeleton y el resto de Construction ya construyeron y probaron en `260908`.

## Testing Posture

Heredado sin cambios de `team.md` — ver esa sección para el detalle completo.
No se re-discute en este intent.

- **Methodology**: test-after
- **Ordering**: implementar cada capa aplicable (backend NestJS, frontend
  React Native) y luego escribir y correr las pruebas de esa capa, antes de
  integrar a `main`.

## Deployment

**Heredado, ya afirmado en `memory/team.md` (no se re-discute):** despliegue
automático a un ambiente de pruebas en cada integración a `main`; aprobación
manual del supervisor (Carlos) requerida antes de desplegar a producción.
Diseño técnico ya confirmado en Construction (`260908`): Render + Neon para
`backend-api`, EAS Build/Update para `mobile-app`, 4 workflows de GitHub
Actions con GitHub Environment `production` y required reviewer = Carlos.

Lo que sigue es la resolución concreta y accionable de las cinco preguntas
genuinamente abiertas de este intent (DEP-1 a DEP-5), decidida por Carlos en
la entrevista de Step 4, más las adiciones de los agentes de soporte que no
entran en conflicto con esas decisiones.

### 1. Prerequisitos técnicos — resolver ANTES de tocar producción (primer paso de este intent)

Antes de crear ninguna cuenta o ejecutar ningún despliegue real, deben
cerrarse los dos bloqueantes técnicos ya identificados en Construction:

- **Cliente Prisma real (cierra R-01 de `code-generation-plan.md`)**:
  ejecutar `npx prisma generate` contra `prisma/schema.prisma` en un entorno
  con salida de red real hacia `binaries.prisma.sh` (la máquina del
  desarrollador o un runner de GitHub Actions con egress confirmado — nunca
  el sandbox de Construction, que está bloqueado). Confirmar que
  `npm run build` de `backend-api` pasa con el cliente generado real, no con
  el stub manual comiteado. Correr la suite de integración de `backend-api`
  contra este cliente real y una Neon real (staging) antes de continuar.
- **Vulnerabilidades de dependencias (cierra T-10 de `build-and-test-summary.md`)**:
  actualizar las dependencias con vulnerabilidades críticas/altas en
  producción (`backend-api`: 1 crítica `tar` DoS + 5 altas incl. `lodash`
  code injection; `mobile-app`: 1 crítica + 11 altas), reportadas por
  `dependency-audit.yml`. Confirmar que la suite de 336 pruebas sigue en
  verde después de la actualización.

Ningún aprovisionamiento de cuentas ni despliegue real avanza hasta que
ambos puntos estén cerrados. Esta es la primera acción concreta del trabajo
de este intent, no una tarea paralela.

### 2. Titularidad y aprovisionamiento de cuentas (DEP-1 / DEP-2)

Carlos crea personalmente las cuentas de Neon, Render y Expo/EAS, con su
propio correo, siguiendo una guía paso a paso preparada por este intent.
Las cuentas quedan a su nombre — él controla la rotación de credenciales, la
facturación si se excede el free tier, y la recuperación de acceso.

**Tabla de mapeo de nombres de ambiente** (cada proveedor usa su propia
convención nativa para "staging" y "producción"; se documenta explícitamente
para evitar error humano durante el aprovisionamiento manual — punto
señalado por el agente de desarrollo):

| Concepto            | Render                     | Neon               | EAS                  |
|----------------------|-----------------------------|---------------------|-----------------------|
| Ambiente de pruebas   | `backend-api-staging`       | rama `staging`      | perfil/canal `preview` |
| Ambiente de producción| `backend-api-production`    | rama `main`         | perfil/canal `production` |

Al aprovisionar cada servicio a mano, verificar explícitamente contra esta
tabla que cada componente apunta al par correcto (p. ej. no conectar
`backend-api-staging` a la rama Neon `main` por error).

### 3. Secretos en GitHub Actions (DEP-3)

Separados por ambiente, nunca compartidos: dos GitHub Environments,
`staging` y `production`, cada uno con sus propios secretos.

- **Environment `production`**: `DATABASE_URL` de Neon `main`, `EXPO_TOKEN`
  de producción y cualquier credencial de despliegue de
  `backend-api-production`. Protegido por el required reviewer (Carlos).
- **Environment `staging`**: contrapartes de `backend-api-staging`, Neon
  rama `staging` y canal/perfil `preview` de EAS.
- Ningún secreto de producción vive a nivel de repositorio ni se comparte
  con `staging` — en particular, nunca el mismo `EXPO_TOKEN` cubre ambos
  ambientes; si Expo/EAS no permite tokens scoped por canal, la mitigación
  es un token por Environment con rotación documentada, no un token
  compartido.
- Solo el titular de las cuentas (Carlos) genera y carga los secretos de
  `production` directamente en GitHub — nunca por chat, código o un canal
  no auditado. El desarrollador solo tiene acceso a los secretos de
  `staging`.

### 4. Verificación del primer despliegue y rollback (DEP-4 / DEP-5)

El primer despliegue a producción se considera exitoso únicamente si, tras
el deploy, se confirman ambas condiciones contra la infraestructura real:

1. El login funciona.
2. Una venta de prueba calcula la comisión correctamente contra la base de
   datos real (Neon `main`).

Este es el smoke test mínimo que resuelve la ausencia de gate post-despliegue
señalada por el agente de calidad — el "éxito" del despliegue deja de
definirse solo por el exit code de Render/EAS y pasa a depender de este
flujo funcional real.

Si cualquiera de las dos condiciones falla: revertir manualmente al build
anterior (Redeploy en Render / `eas update:republish` en EAS, según el
componente) y notificar a Carlos. No hay rollback automático para este
primer despliegue — es una decisión y ejecución manual.

### 5. RBAC a nivel de infraestructura, no solo de aplicación

El mandato de `project.md` ("proteger los datos de comisión/salario con
control de acceso por rol") ya cubre la capa de aplicación (JWT + roles en
NestJS). Para esta primera puesta en producción real con datos de los ~26
vendedores, el control de acceso humano a la infraestructura misma queda
así:

- **Neon**: la rama `main` (producción) usa un rol de Postgres distinto al
  de `staging`, con permisos mínimos para el backend (nunca el rol
  superusuario/owner del proyecto Neon en runtime). El acceso a la consola
  de Neon (que permite leer datos crudos de comisión/salario vía SQL
  directo) queda limitado al titular de la cuenta (Carlos).
- **Render**: las variables de entorno del servicio
  `backend-api-production` (incluyen `DATABASE_URL` real y el JWT secret)
  quedan visibles solo a quien tenga acceso de Member/Admin al servicio —
  scopeado al mismo titular, no a todo el equipo.
- **Logs**: verificar como parte del smoke test que ningún log de
  aplicación (Render logs, EAS crash/telemetry) registre en texto plano
  montos de comisión/salario por vendedor ni credenciales (`JWT`,
  `DATABASE_URL`).

## Code Style

Heredado sin cambios de `team.md` — ver esa sección para el detalle completo
(Prettier + ESLint para TypeScript). No aplica en sustancia a un intent de
infraestructura sin generación de código nuevo.
## Forbidden

<!-- Team-specific forbidden patterns -->

## Mandated

<!-- Team-specific mandates -->

## Corrections

<!-- Self-learning loop appends here. -->
