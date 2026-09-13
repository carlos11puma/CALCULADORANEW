# Infrastructure Design — Despliegue a Producción — Infrastructure Specification

## Sources

- [upstream:logical-components] `construction/nfr-design/logical-components.md`
- [upstream:infrastructure-specification-260908-backend] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/infrastructure-specification.md` (diseño ya afirmado — dos servicios Render, dos ramas Neon, IaC vía `render.yaml`)
- [upstream:infrastructure-specification-260908-mobile] `260908-calculadora-comisiones-m/construction/mobile-app/infrastructure-design/infrastructure-specification.md` (EAS Build/Update, 3 perfiles, distribución interna)
- [contexto: archivos reales del repo] `packages/backend-api/render.yaml`, `packages/mobile-app/eas.json`
- [Q1] `infrastructure-design-questions.md` — confirmado dentro de alcance editar `render.yaml` y workflows de GitHub Actions

## Resolución concreta del desfase de `render.yaml` (cierra R-01 de la revisión de `nfr-design/security-design.md`)

`packages/backend-api/render.yaml` hoy declara un único servicio (`calculadora-comisiones-backend-api`). El diseño ya afirmado en `260908` y en `team.md` §2 de este intent requiere dos servicios separados. La resolución elegida es **IaC actualizado** (no aprovisionamiento manual desde el dashboard), consistente con la decisión ya tomada en `260908` ("versionado, reproducible, revisable en pull request").

`render.yaml` pasa de una entrada `services:` a dos, una por ambiente:

| Campo | `backend-api-staging` | `backend-api-production` |
|---|---|---|
| `name` | `backend-api-staging` | `backend-api-production` |
| `runtime` | `docker` (sin cambio) | `docker` (sin cambio) |
| `dockerfilePath` / `dockerContext` | `./packages/backend-api/Dockerfile` / `.` (sin cambio) | `./packages/backend-api/Dockerfile` / `.` (sin cambio) |
| `plan` | `free` | `free` |
| `healthCheckPath` | `/api/v1/health` (sin cambio) | `/api/v1/health` (sin cambio) |
| `envVars` → `NODE_ENV` | `production` (el runtime de Node es `production` en ambos ambientes — no confundir con el ambiente de despliegue) | `production` |
| `envVars` → `PORT` | `3000` | `3000` |
| `envVars` → `DATABASE_URL` | `sync: false` — apunta a la rama Neon `staging` (cargado manualmente por Carlos en el dashboard de Render, nunca commiteado) | `sync: false` — apunta a la rama Neon `main` (cargado manualmente por Carlos, nunca commiteado) |
| `envVars` → JWT secret | `sync: false` — valor propio de staging | `sync: false` — valor propio de producción, distinto al de staging (deriva de NFR-D4, `nfr-design/security-design.md`) |

Ambos servicios se declaran en el mismo `render.yaml` (un Blueprint puede declarar múltiples servicios); Render los aprovisiona juntos la primera vez que Carlos conecta el Blueprint al repositorio, y cada uno se redespliega de forma independiente en pushes subsiguientes (ver `cicd-pipeline.md` para el disparo por ambiente).

## Deployment

| Aspecto | Diseño |
|---|---|
| Compute | Contenedor Docker en Render Web Service — heredado sin cambios de `260908`, ahora materializado en dos instancias (`backend-api-staging`, `backend-api-production`) |
| Networking | Sin VPC — cada servicio de Render expone su propia URL pública HTTPS por defecto; sin red compartida entre staging y producción |
| Almacenamiento | Sin estado en el propio servicio — toda persistencia vive en Neon (Postgres administrado), fuera del ciclo de vida del contenedor |
| Ambientes | Dos: `backend-api-staging` (rama Neon `staging`) y `backend-api-production` (rama Neon `main`) — mapeo formalizado en `team.md` §2 de este intent |
| IaC | `render.yaml` (Blueprint), con dos entradas de servicio — ver resolución arriba. Revisable en pull request, consistente con la decisión de `260908` |
| Sizing | Free tier en ambos servicios — confirmado sin recursos de pago por el agente de plataforma (`nfr-design/contributions/aidlc-aws-platform-agent.md`) |

## Infrastructure Services

| Servicio | Provisto por | Detalle |
|---|---|---|
| Base de datos | Neon (Postgres administrado) | Dos ramas: `staging` y `main`; conexión vía endpoint *pooled* explícito en `DATABASE_URL` (deriva de `nfr-design/performance-design.md`); `sslmode=require` por defecto |
| Cómputo backend | Render Web Service (Docker) | Dos servicios — ver tabla de Deployment arriba |
| Distribución móvil | Expo Application Services (EAS) | Build (perfiles `preview`/`production`) + Update (OTA para cambios JS/TS); distribución interna, sin App Store/Play Store (heredado de `260908`) |
| CI/CD | GitHub Actions | 4 workflows existentes, extendidos en `cicd-pipeline.md` de esta etapa — no se introduce una plataforma nueva |
| Secretos | GitHub Environments (`staging`, `production`) + variables de entorno de Render (`sync: false`) | Sin secrets manager externo — free tier, consistente con `project.md` § Mandated |

## Shared Infrastructure

- El proyecto Neon es propiedad exclusiva de la unidad `backend-api` — ninguna otra unidad (`mobile-app`, `api-contract`) tiene acceso directo a la base de datos; `mobile-app` solo consume la API HTTP de `backend-api` (heredado de `260908`).
- No hay recursos de infraestructura compartidos entre `staging` y `production` en ningún proveedor: ramas Neon distintas, servicios Render distintos, canales/perfiles EAS distintos, GitHub Environments distintos. Esta separación total es intencional — evita que un error en `staging` afecte datos reales de comisión de los ~26 vendedores.
- El repositorio Git (monorepo) y GitHub Actions son la única infraestructura compartida entre unidades, consistente con `logical-components.md` de la etapa anterior.

## Puente hacia CI/CD Pipeline

Esta especificación resuelve *qué* infraestructura existe y cómo se declara (IaC). La siguiente sección de esta misma etapa (`cicd-pipeline.md`) resuelve *cómo* el pipeline de GitHub Actions dispara el aprovisionamiento/despliegue de estos dos servicios y cierra el segundo desfase encontrado (`dependency-audit.yml` no bloqueante).
