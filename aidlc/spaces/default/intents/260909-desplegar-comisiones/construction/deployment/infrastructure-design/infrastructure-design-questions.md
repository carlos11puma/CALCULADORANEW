# Infrastructure Design — Preguntas (260909-desplegar-comisiones)

## Sources

- [upstream:nfr-design] `construction/nfr-design/*.md`
- [upstream:infrastructure-design-260908-backend] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/` (diseño ya afirmado — dos servicios Render, IaC vía `render.yaml`)
- [upstream:infrastructure-design-260908-mobile] `260908-calculadora-comisiones-m/construction/mobile-app/infrastructure-design/` (3 perfiles EAS ya afirmados)
- [contexto: archivos reales del repo] `packages/backend-api/render.yaml`, `.github/workflows/*.yml`, `packages/mobile-app/eas.json`

## Preguntas planteadas a Carlos Puma

Casi todo el diseño de infraestructura ya está fijado por `260908` (dos servicios Render, dos ramas Neon, 3 perfiles EAS, 4 workflows de GitHub Actions) y por lo que ya decidiste en `nfr-requirements`/`nfr-design` de este intent. Revisando los archivos reales del repo encontré dos desfases entre lo ya diseñado y lo que existe hoy — necesito tu confirmación de alcance antes de documentar cómo se cierran.

### Q1 — `packages/backend-api/render.yaml` hoy solo declara un servicio de Render (no los dos, staging/producción, que `260908` ya diseñó), y `dependency-audit.yml` hoy es explícitamente no-bloqueante (`continue-on-error: true`) aunque `security-requirements.md`/`security-design.md` de este intent ya decidieron que debe ser un gate bloqueante. Cerrar ambos desfases significa editar `render.yaml` y los workflows de `.github/workflows/` — archivos de configuración de infraestructura/pipeline, no código de aplicación de `backend-api`/`mobile-app`. ¿Confirmas que esto está dentro del alcance de este intent (a diferencia de cambiar lógica de negocio o endpoints)?

A. Sí, editar `render.yaml` y los workflows de GitHub Actions está dentro de alcance — es configuración de despliegue, no código de producto
B. No, prefiero que estos cambios de configuración pasen por un intent de Construction separado, igual que la protección de fuerza bruta
X. Other (please specify)

**[Answer]: A. Sí, está dentro de alcance** — editar `render.yaml` y los workflows de GitHub Actions es configuración de despliegue, no código de producto.

## Assumptions & Open Questions

- [assumption] El IaC (`render.yaml` versionado) sigue siendo el enfoque preferido para declarar los dos servicios de Render, consistente con la decisión ya tomada en `infrastructure-specification.md` de `260908` ("versionado, reproducible, revisable en pull request... en vez de configuración manual del dashboard") — no se reabre esa decisión, solo se completa su implementación.
- [assumption] Los 4 workflows de GitHub Actions ya existentes (`backend-api-ci.yml`, `mobile-app-ci.yml`, `api-contract-ci.yml`, `dependency-audit.yml`) no se reescriben desde cero — se extienden con los pasos de despliegue real y el gate bloqueante que faltan, preservando su estructura y comentarios ya afirmados en `260908`.
- [assumption] Los 3 perfiles de EAS (`development`, `preview`, `production`) ya definidos en `eas.json` no cambian — la tabla de mapeo de ambientes de `team.md` (`preview`/`production`) se refiere a los dos perfiles relevantes para este despliegue; `development` sigue siendo de uso interno del desarrollador, sin acción de este intent.

A. Accept assumptions
B. Convert to follow-up questions

**[Answer]: A. Accept assumptions**

## Consolidated Summary Confirmation

- `render.yaml` pasa de un servicio a dos (`backend-api-staging`, `backend-api-production`), cada uno con su propio `DATABASE_URL`/JWT secret (`sync: false`), sin depender de aprovisionamiento manual desde el dashboard — resuelve el desfase señalado por el agente de plataforma en `nfr-design`.
- Render: auto-deploy activado en `backend-api-staging` (cada push a `main`), desactivado en `backend-api-production` (Carlos presiona "Manual Deploy" tras validar el smoke test en staging) — es el equivalente del required reviewer que ya protege `mobile-app`.
- `dependency-audit.yml` se mantiene `continue-on-error: true` en el paso (sigue siendo un aviso no alarmista), pero pasa a ser required status check de branch protection — cierra NFR-D17 sin reescribir el workflow.
- Hallazgo nuevo de esta etapa: `mobile-app-ci.yml`'s job `publish-preview` no tenía `environment: staging` (a diferencia de `publish-production`, que sí tiene `environment: production`) — se agrega esa línea para que el secreto `EXPO_TOKEN` de staging esté correctamente scopeado, sin required reviewer (staging sigue siendo automático).
- Ningún cambio toca código de aplicación (`backend-api/src`, `mobile-app/src`) — solo `render.yaml` y `mobile-app-ci.yml`, confirmado dentro de alcance en Q1.
- Sin plataforma de monitoreo nueva: notificaciones nativas de Render (deploy failed) y GitHub Actions (check failed), paneles de logs de Render/EAS ya existentes, acceso limitado a Carlos.
- Vulnerabilidades críticas/altas ya conocidas de `260908` NO se resuelven en esta etapa de diseño — siguen siendo el primer paso operativo del intent, antes de cualquier aprovisionamiento real.

Does this all look correct before I generate the design artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
