# Deployment Pipeline — CD Configuration

## Sources

- [upstream:cicd-pipeline] `construction/infrastructure-design/cicd-pipeline.md`
- [upstream:infrastructure-specification] `construction/infrastructure-design/infrastructure-specification.md`
- [Q1] `deployment-pipeline-questions.md`

## No hay un pipeline de CD separado del de CI

Este proyecto no usa una herramienta de CD dedicada (Argo CD, Spinnaker, CodePipeline): el mismo push
a `main` que dispara los workflows de CI (`backend-api-ci.yml`, `mobile-app-ci.yml`,
`api-contract-ci.yml`) es también el evento que dispara el despliegue, a través de dos mecanismos
nativos de plataforma ya diseñados en `cicd-pipeline.md`:

| Componente | Disparador | Mecanismo de despliegue | Gate antes de correr |
|---|---|---|---|
| `backend-api` → staging | Push a `main` tocando `packages/backend-api/**` o `packages/api-contract/**` | Auto-deploy nativo de Render sobre `backend-api-staging` | Ninguno explícito — el auto-deploy de Render no espera a que termine `backend-api-ci.yml` (ya aceptado como no-bloqueante desde `260908`) |
| `backend-api` → producción | Manual | Botón "Manual Deploy" en el dashboard de Render, presionado por Carlos | Smoke test en verde contra staging (`reliability-design.md`) |
| `mobile-app` → `preview` (staging) | Push a `main` tocando `packages/mobile-app/**` o `packages/api-contract/**` | Job `publish-preview` de `mobile-app-ci.yml` (`environment: staging`, sin required reviewer) | Job `test` en verde (required check) |
| `mobile-app` → `production` | Manual (aprobación) | Job `publish-production` de `mobile-app-ci.yml` (`environment: production`, required reviewer = Carlos) | Aprobación de Carlos en el Environment `production` de GitHub |

No se introduce ninguna herramienta de CD nueva — es una decisión ya tomada implícitamente por
`infrastructure-specification.md` (free tier, sin presupuesto para una plataforma de CD adicional) y
reafirmada aquí explícitamente porque el stage template de esta etapa la pide como pregunta abierta.

## Ambientes y su configuración de despliegue

| Ambiente | Backend (Render) | Mobile (EAS) | Base de datos (Neon) |
|---|---|---|---|
| Staging | `backend-api-staging`, auto-deploy on | Canal/perfil `preview` | Rama `staging` |
| Producción | `backend-api-production`, auto-deploy off (manual) | Canal/perfil `production` | Rama `main` |

No existe un tercer ambiente desplegado. El perfil `development` de `eas.json` construye únicamente
un Dev Client local (`developmentClient: true`) — nunca se publica a un canal ni se conecta a un
servicio de Render; queda fuera de esta matriz de CD.

## Configuración pendiente de actualizar en Environment Provisioning (Q1)

`packages/mobile-app/eas.json` declara hoy, en los perfiles `preview` y `production`, valores
placeholder de `API_BASE_URL` (`https://api-staging.calculadora-comisiones.internal` y
`https://api.calculadora-comisiones.internal`) que datan de Construction, antes de que existiera
backend real desplegado. Environment Provisioning debe reemplazarlos por las URLs reales que Render
asigna a `backend-api-staging` y `backend-api-production` en el momento en que Carlos conecta el
Blueprint (`render.yaml`) por primera vez — mismo paquete de trabajo que editar `render.yaml` y crear
los GitHub Environments (`cicd-pipeline.md` § Puente hacia Environment Provisioning). No se puede
resolver antes porque las URLs no existen hasta que los servicios se aprovisionan.

## Qué no cambia en esta etapa

Ningún archivo de workflow (`.github/workflows/*.yml`) se edita en Deployment Pipeline — las dos
ediciones pendientes (`render.yaml`, `mobile-app-ci.yml` `environment: staging`) ya quedaron
documentadas como trabajo de Environment Provisioning en `cicd-pipeline.md`; esta etapa no las repite
ni las adelanta, solo confirma que el mecanismo de disparo descrito arriba es correcto contra el
estado real del repo.
