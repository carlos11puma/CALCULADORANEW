# Environment Provisioning — Guía de Aprovisionamiento (ejecuta Carlos)

## Sources

- [upstream:infrastructure-specification] `construction/infrastructure-design/infrastructure-specification.md`
- [upstream:cd-config] `operation/deployment-pipeline/cd-config.md`
- [upstream:reliability-design] `construction/nfr-design/reliability-design.md`
- [Q1, Q2] `environment-provisioning-questions.md`
- [contexto: archivos reales del repo, editados en esta etapa] `packages/backend-api/render.yaml`, `.github/workflows/mobile-app-ci.yml`

Esta guía es para que la sigas vos, Carlos, fuera de este chat — ninguna de estas acciones se puede
ejecutar desde esta sesión (ni cuentas de terceros, ni tu computadora tienen acceso desde acá).
Seguila en orden; cada paso indica cuándo podés saltarlo si ya lo hiciste.

## Paso 0 — Prerequisitos bloqueantes (team.md §1) — antes de tocar cualquier cuenta

No avances al Paso 1 hasta cerrar esto. Ejecutalo en tu computadora (o en un runner de GitHub
Actions una vez el repo esté en GitHub) — nunca en este chat, que no tiene salida de red hacia
`binaries.prisma.sh`.

1. **Cliente Prisma real** (cierra R-01):
   ```
   cd packages/backend-api
   npx prisma generate
   npm run build
   ```
   Criterio de éxito: ambos comandos terminan sin error, y el cliente generado reemplaza al stub
   manual comiteado.

2. **Dependencias vulnerables** (cierra T-10 — 1 crítica + 16 altas conocidas hoy):
   ```
   npm audit
   npm audit fix
   npm audit fix --force   # revisa el resumen que imprime antes de aceptar — incluye breaking changes
   npm test --workspace=packages/backend-api -- --coverage
   npm test --workspace=packages/mobile-app -- --coverage
   npm test --workspace=packages/api-contract -- --coverage
   ```
   Criterio de éxito: `npm audit` ya no reporta vulnerabilidades críticas/altas, y las 336 pruebas
   (más las que hayas agregado) siguen en verde con la cobertura ya exigida (80%/70%).

3. Commitear y pushear ambos cambios (cliente Prisma real + `package-lock.json` actualizado) a
   `main` antes de continuar.

## Paso 1 — Crear las cuentas (team.md §2, a tu nombre)

Con tu propio correo, en este orden:

1. **Neon** (neon.tech) → crear proyecto → crear dos ramas: `staging` y `main` (la rama `main` suele
   ser la default del proyecto; renombrala si Neon la crea con otro nombre). Guardá el connection
   string *pooled* de cada rama — lo vas a necesitar en el Paso 2.
2. **Render** (render.com) → conectar tu cuenta de GitHub al repositorio de este proyecto.
3. **Expo/EAS** (expo.dev) → crear cuenta, instalar `eas-cli` si vas a correr comandos localmente
   (`npm install -g eas-cli`), `eas login`.

Verificá contra esta tabla que no mezclás ambientes al aprovisionar (`team.md` §2):

| Concepto | Render | Neon | EAS |
|---|---|---|---|
| Ambiente de pruebas | `backend-api-staging` | rama `staging` | perfil/canal `preview` |
| Ambiente de producción | `backend-api-production` | rama `main` | perfil/canal `production` |

## Paso 2 — Conectar el Blueprint de Render

`render.yaml` ya fue editado en esta etapa: declara los dos servicios (`backend-api-staging`,
`backend-api-production`), cada uno con plan `free` y `DATABASE_URL` como único secreto
(`sync: false` — no se sube al repo). No hay un `JWT_SECRET` que provisionar: el backend real usa
sesiones opacas en base de datos, no JWT (Q1 de esta etapa).

1. En Render → New → Blueprint → seleccioná este repositorio. Render lee `render.yaml` y propone
   los dos servicios.
2. Para cada servicio, antes de confirmar el deploy inicial, cargá manualmente `DATABASE_URL` con
   el connection string pooled correspondiente (staging → rama Neon `staging`; producción → rama
   Neon `main`) — nunca lo pegues en un archivo del repo ni en el chat.
3. En `backend-api-staging`: dejá el auto-deploy **activado** (default).
4. En `backend-api-production`: Settings → Build & Deploy → **desactivá** el auto-deploy. Los
   despliegues a producción son manuales (`operation/infrastructure-design/cicd-pipeline.md` §
   Resolución 1) — vos presionás "Manual Deploy" después de validar staging.
5. Anotá la URL pública que Render asigna a cada servicio (algo como
   `https://backend-api-staging.onrender.com`) — la necesitás en el Paso 3.
6. En cada uno de los dos servicios: Settings → activá el checkbox **"Notify on failed deploys"**
   (deploy failed → email nativo de Render, ya diseñado en
   `construction/infrastructure-design/monitoring-design.md` § Alerts — es la única alerta activa de
   este intent, sin plataforma de monitoreo nueva).

## Paso 3 — Actualizar `eas.json` con las URLs reales

`packages/mobile-app/eas.json` todavía tiene las URLs placeholder de Construction. Con las URLs del
Paso 2 en mano, editá manualmente (o pedime que lo haga si volvés a esta sesión con las URLs reales)
los perfiles `preview` y `production`:

```json
"preview": {
  "env": { "API_BASE_URL": "<URL real de backend-api-staging>" }
},
"production": {
  "env": { "API_BASE_URL": "<URL real de backend-api-production>" }
}
```

El perfil `development` no se toca — sigue siendo solo para tu Dev Client local.

## Paso 4 — Crear los dos GitHub Environments (team.md §3)

En GitHub → tu repositorio → Settings → Environments:

1. Crear Environment **`staging`**: sin required reviewer. Secreto: `EXPO_TOKEN` de un token de
   Expo válido para publicar al canal `preview` (podés generar uno en expo.dev → Access Tokens).
2. Crear Environment **`production`**: required reviewer = vos (Carlos). Secreto: `EXPO_TOKEN` de
   producción, **distinto** al de staging (`project.md` § Forbidden — nunca el mismo token cubre
   ambos ambientes; si Expo no ofrece tokens scoped por canal, generá dos tokens de cuenta
   separados y documentá cuál es cuál).

Ninguno de los dos `EXPO_TOKEN` ni ningún secreto de producción va como "repository secret" — solo
dentro de su Environment correspondiente.

## Paso 5 — Branch protection (cierra Resolución 2 de `cicd-pipeline.md`)

GitHub → Settings → Branches → regla sobre `main` → Require status checks to pass → agregá como
required: los jobs `test` de los 3 workflows de CI, y el job `audit` de `dependency-audit.yml`.

## Paso 6 — RBAC de infraestructura (team.md §5)

1. En Neon: confirmá que el rol de Postgres que usa `DATABASE_URL` de producción no es el
   superusuario/owner del proyecto (creá un rol con permisos mínimos si Neon te dio el owner por
   defecto). El acceso a la consola de Neon queda limitado a tu cuenta — no invites colaboradores
   en este primer despliegue.
2. En Render: confirmá que solo tu cuenta tiene acceso Member/Admin al servicio
   `backend-api-production` (donde `DATABASE_URL` real queda visible).

## Qué queda para la siguiente etapa (Deployment Execution)

Una vez completados los 6 pasos de arriba, el primer despliegue real sigue la secuencia de 6 pasos
ya diseñada en `reliability-design.md` y el runbook de `operation/deployment-pipeline/rollback-runbook.md` si algo falla — eso es
contenido de la etapa Deployment Execution, no de esta.
