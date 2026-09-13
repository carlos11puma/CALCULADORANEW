**Collaborator:** aidlc-developer-agent

## Contribution

Revisión ciega del draft del lead desde la perspectiva de implementación:
naming, límites de capa, organización de archivos y convenciones de código
relevantes para levantar infraestructura real (Render/Neon/EAS) por primera
vez. No repito el análisis de titularidad/aprobación/rollback (DEP-1 a DEP-4,
DEP-5) porque son juicios operativos correctos para la entrevista y no
conciernen a naming/convenciones. Foco de esta revisión:

### 1. Convención de nombres de ambiente — inconsistente entre los 3 paquetes

Verificado en `infrastructure-specification.md` de ambas unidades:

- **Render** (`backend-api`): dos servicios nombrados `backend-api-staging` /
  `backend-api-production` — usa el par `staging`/`production` explícitamente.
- **Neon** (base de datos de `backend-api`): dos ramas nombradas `staging` /
  `main` — el ambiente de producción se llama `main`, no `production`.
- **EAS** (`mobile-app`): tres perfiles `development` / `preview` /
  `production` — el ambiente pre-producción se llama `preview`, no `staging`.

El mismo concepto ("ambiente de pruebas antes de producción", mandato de
`team.md` [Q4]) tiene tres nombres distintos según el proveedor: `staging`
(Render), `staging` como rama pero `main` como nombre real (Neon), y
`preview` (EAS). Esto no es un defecto de diseño — cada proveedor tiene su
propia convención nativa y no vale la pena forzar un nombre uniforme contra
la convención de la plataforma — pero si no se documenta explícitamente en
algún lugar accesible al desarrollador que hace el primer despliegue, es una
fuente real de error humano (ej. apuntar el backend-api-staging accidentalmente
a la rama Neon `main` en vez de `staging` durante el aprovisionamiento manual).
Recomiendo agregar una nota de mapeo explícita (tabla de una fila por
concepto → nombre en cada proveedor) al material de la puesta en marcha que
resulte de este intent, no una re-arquitectura.

### 2. Naming de variables de entorno — consistente, sin objeción

`DATABASE_URL` (Render/backend), `EXPO_TOKEN` y `API_BASE_URL` (EAS/mobile)
siguen convención `SCREAMING_SNAKE_CASE` estándar en los tres casos, sin
colisión de nombres entre paquetes. `API_BASE_URL` correctamente NO se trata
como secreto pero se gestiona con el mismo mecanismo (`eas.json` por
perfil) que si lo fuera, por consistencia — decisión razonable ya tomada en
`cicd-pipeline.md` de `mobile-app`, sin objeción.

### 3. Gap del stub de Prisma Client — SÍ bloquea el despliegue real, debe ser prerequisito explícito de este intent

Confirmado en `construction/backend-api/code-generation/code-summary.md` y
`code-generation-plan.md` (hallazgo R-01, ya formalizado por el lead de esa
etapa): `node_modules/.prisma/client/*` es un stub escrito a mano porque
`binaries.prisma.sh` estaba bloqueado (403) en el entorno sandbox de
Code Generation. `prisma/schema.prisma` es la fuente de verdad real y
versionada, pero el cliente generado nunca fue validado contra el generador
real de Prisma. El propio hallazgo R-01 dice explícitamente: "Bloquea el
despliegue, no la finalización de esta etapa" y exige ejecutar
`npx prisma generate` con acceso de red real ANTES de cualquier build de
producción o merge a `main`.

Esto es exactamente el tipo de gap que este intent (`260909`, alcance
`infra`) existe para cerrar — no es una pregunta operativa de "quién aprueba
qué" sino un **prerequisito técnico verificable** que hoy no aparece como
paso explícito en `team-practices.md` § Deployment (DEP-1 a DEP-5). Ninguno
de los cinco DEP cubre "regenerar el cliente Prisma real contra `schema.prisma`
antes del primer build". Si el primer `git push` a `main` dispara el
auto-deploy a `backend-api-staging` (Render) sin que alguien haya corrido
`npx prisma generate` con red real primero, el build de producción hereda
el mismo stub no validado — el pipeline de CI tal como está diseñado hoy
(`ci-pipeline/ci-config.md`) no incluye un paso que regenere el cliente
Prisma desde cero en un entorno con egress real, solo reinstala
`node_modules` (lo que preservaría el stub comiteado si el stub llegó a
comitearse, o fallaría si no se comiteó y el CI runner tampoco tiene egress
al mismo host bloqueado). Recomiendo agregar un DEP-6 explícito: **"Regenerar
el cliente Prisma real (`npx prisma generate`) en un entorno con acceso de
red completo (CI de GitHub Actions o la máquina del desarrollador) como
primer paso de este intent, antes de cualquier otro paso de aprovisionamiento
o primer deploy, y confirmar que `binaries.prisma.sh` es alcanzable desde el
runner de GitHub Actions elegido"** — sin esto, DEP-2 (quién ejecuta la puesta
en marcha) y DEP-5 (smoke test post-despliegue) se ejecutarían sobre una base
no confiable.

### 4. Límites de capa y organización de archivos — sin objeciones

El monorepo mantiene separación clara entre `packages/backend-api` (NestJS)
y el paquete de mobile-app (React Native/Expo), cada uno con su propio
`infrastructure-design/` y `cicd-pipeline.md`. `render.yaml` en la raíz del
monorepo definiendo ambos servicios Render es coherente con el patrón IaC
versionado ya afirmado. No hay mezcla de responsabilidades entre unidades
(`mobile-app` no tiene credenciales directas a Neon, consistente con el
`Shared Infraestructura` documentado). Sin hallazgos aquí.

## Positions

AGREE: Baseline heredado sin cambios (Way of Working, Walking Skeleton,
Testing Posture, Code Style) — correcto no re-discutirlos en un intent de
alcance `infra` sin generación de código nuevo.

AGREE: DEP-1 (titularidad de cuentas), DEP-2 (ejecución de la puesta en
marcha), DEP-3 (scope de secretos), DEP-4 (rollback del primer despliegue) y
DEP-5 (smoke test post-despliegue) — todos son juicios operativos genuinos
que la evidencia de diseño no resuelve por construcción; correctamente
listados para entrevista humana.

OBJECT: El draft actual no incluye un ítem que capture el gap del stub de
Prisma Client (hallazgo R-01, ya formalizado en
`construction/backend-api/code-generation/code-generation-plan.md`) como
prerequisito técnico explícito de este intent. Es un bloqueador real y
verificado del primer despliegue de producción, distinto en naturaleza de
DEP-1 a DEP-5 (esos son decisiones de "quién/cómo"; este es un "qué debe
estar cierto técnicamente antes de desplegar"). Propongo agregarlo como
DEP-6 en `team-practices.md` § Deployment: regenerar `npx prisma generate`
con acceso de red real como primer paso de este intent, y verificar que el
runner de CI elegido tiene egress a `binaries.prisma.sh` (o al mirror que
corresponda) antes de depender de ese paso en el pipeline automatizado.

AGREE (con nota, no objeción): la convención de nombres de ambiente difiere
entre Render (`staging`/`production`), Neon (`staging`/`main`) y EAS
(`preview`/`production`) — no amerita re-arquitectura porque cada nombre
sigue la convención nativa de su proveedor, pero sí amerita una tabla de
mapeo explícita en el material de puesta en marcha para reducir el riesgo de
error humano durante el aprovisionamiento manual (DEP-2). No propongo esto
como un DEP nuevo, sino como una nota a incorporar en la ejecución de
cualquier DEP-2 que resulte de la entrevista.

AGREE: naming de variables de entorno (`DATABASE_URL`, `EXPO_TOKEN`,
`API_BASE_URL`) es consistente y no requiere cambios.
