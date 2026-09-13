# Infrastructure Design — backend-api — Infrastructure Specification

## Sources

- [upstream:performance-design] `construction/backend-api/nfr-design/performance-design.md`
- [upstream:security-design] `construction/backend-api/nfr-design/security-design.md`
- [upstream:scalability-design] `construction/backend-api/nfr-design/scalability-design.md`
- [upstream:reliability-design] `construction/backend-api/nfr-design/reliability-design.md`
- [upstream:logical-components] `construction/backend-api/nfr-design/logical-components.md`
- [upstream:infrastructure-design-questions] `construction/backend-api/infrastructure-design/infrastructure-design-questions.md`

## Deployment

| Facet | Choice | Rationale |
|---|---|---|
| Compute model | Contenedor gestionado por Render ("Web Service" free tier), build desde el `Dockerfile`/buildpack de Node del monorepo | Proceso de larga duración necesario para el cron in-process de `@nestjs/schedule` (`reliability-design.md`) — una función serverless-on-demand no mantendría el proceso vivo entre invocaciones (Q1) |
| Networking topology | HTTPS público gestionado por Render (TLS terminado por la plataforma) — sin VPC propia, el único vecino de red es Neon (conexión saliente TLS) | Sin componentes internos adicionales que aislar en una red privada; cumple NFR3.4 de `api-contract` (TLS obligatorio) sin infraestructura propia |
| Storage strategy | Sin almacenamiento de archivos — toda persistencia vive en PostgreSQL (Neon); el proceso es stateless a nivel de disco local | Consistente con `scalability-design.md` (servicio stateless) |
| Environments | Dos servicios Render separados: `backend-api-staging` y `backend-api-production`, cada uno con su propia rama de base de datos Neon (`staging` y `main`, vía el branching nativo de Neon) (Q2) | Aísla completamente los datos de prueba de los datos reales de comisión/salario — mandato de `project.md` |
| IaC approach | `render.yaml` (Render Blueprint) comiteado en la raíz del monorepo, define ambos servicios | Versionado, reproducible, revisable en pull request (Q3) — en vez de configuración manual del dashboard |
| Resource sizing | Plan free tier de Render (512MB RAM, CPU compartida) para ambos ambientes | Suficiente al volumen esperado (~26 vendedores, ver `scalability-design.md` NFR7.2); coherente con NFR6 (priorizar capas gratuitas) |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---|---|---|---|
| Neon PostgreSQL | database | Tier gratuito, conexión "pooled" (pgBouncer, modo `transaction`) — ver `scalability-design.md` NFR6.1; dos ramas (`main` para producción, `staging` para pruebas) del mismo proyecto Neon | La rama `staging` se puede resetear/recrear desde `main` sin afectar datos reales — el branching nativo de Neon es justamente para este caso de uso |
| Render Web Service (staging) | compute | `render.yaml`, auto-deploy en cada push a `main` (mandato de `team.md`) | Consume la rama `staging` de Neon vía `DATABASE_URL` propia |
| Render Web Service (producción) | compute | `render.yaml`, deploy manual (o auto-deploy pausado, activado solo tras aprobación) | Consume la rama `main` de Neon; el gate de aprobación manual del supervisor vive en el pipeline de CI/CD (`cicd-pipeline.md`), no en Render |
| GitHub Actions | CI/CD | Workflow en `.github/workflows/backend-api.yml` | Ver `cicd-pipeline.md` para las etapas completas |

## Shared Infraestructura

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| Proyecto Neon (cuenta) | backend-api | backend-api (única unidad `service` con persistencia propia — `api-contract` es `spec` sin base de datos, `mobile-app` consume el contrato de `backend-api`, no la base de datos directamente) | Ninguna otra unidad tiene credenciales de conexión directa a Neon — `mobile-app` y cualquier otro consumidor externo solo acceden vía la API HTTP de `backend-api`, nunca a la base de datos |
