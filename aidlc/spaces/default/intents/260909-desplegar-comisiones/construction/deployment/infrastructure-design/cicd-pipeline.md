# Infrastructure Design — Despliegue a Producción — CI/CD Pipeline

## Sources

- [upstream:cicd-pipeline-260908] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/cicd-pipeline.md` (pipeline de 8 pasos ya afirmado — este documento lo completa con el ambiente `staging` real y cierra sus gaps de continuidad, no lo rediseña)
- [contexto: archivos reales del repo] `.github/workflows/backend-api-ci.yml`, `.github/workflows/mobile-app-ci.yml`, `.github/workflows/api-contract-ci.yml`, `.github/workflows/dependency-audit.yml`
- [upstream:security-design] `construction/nfr-design/security-design.md` (NFR-D17 — gate bloqueante de dependencias)
- [Q1] `infrastructure-design-questions.md`

## Estado real de los 4 workflows (auditoría de este stage)

| Workflow | Dispara en | Deploy real | Gate bloqueante | Ambiente GitHub scopeado |
|---|---|---|---|---|
| `backend-api-ci.yml` | PR/push a `packages/backend-api`, `packages/api-contract` | **No** — solo build+test | Sí, implícito (required check en branch protection) | Ninguno |
| `mobile-app-ci.yml` | PR/push a `packages/mobile-app`, `packages/api-contract` | Sí — `publish-preview` (push) y `publish-production` (tras `publish-preview`) | Sí para el job `test` | `publish-production` sí tiene `environment: production`; **`publish-preview` no tiene `environment:`** |
| `api-contract-ci.yml` | PR/push a `packages/api-contract` | No — solo build+test | Sí, implícito | Ninguno |
| `dependency-audit.yml` | push a `main`, cron semanal, manual | No | **No** — `continue-on-error: true` explícito | Ninguno |

Dos desfases ya identificados en Q1 (render.yaml, dependency-audit.yml no bloqueante) más uno adicional encontrado durante esta auditoría (mobile-app-ci.yml sin `environment: staging`). Los tres se resuelven a continuación.

## Resolución 1 — `backend-api-ci.yml` no despliega (cierra el gap de render.yaml de esta etapa)

`backend-api-ci.yml` hoy termina en build+test; no hay paso de despliegue a Render. Render soporta dos mecanismos de auto-deploy sobre un Blueprint conectado a un repo de GitHub: (a) auto-deploy nativo de Render en cada push a la rama configurada por servicio, sin paso explícito en el workflow, o (b) un paso `render-deploy` explícito en el workflow (API de Render).

**Diseño elegido: (a) auto-deploy nativo de Render**, consistente con la decisión ya tomada en `cicd-pipeline.md` de `260908` (`R-01` de esa revisión ya señaló, y aceptó como no-bloqueante, que "Render auto-deploy no espera explícitamente a que el check de GitHub Actions pase" — mismo patrón aceptado aquí, no se reabre). Concretamente:

- `backend-api-staging` se configura en el dashboard de Render con auto-deploy activado sobre la rama `main` del repo (todo push a `main` que toque `packages/backend-api/**` redespliega staging).
- `backend-api-production` se configura con auto-deploy **desactivado** — el despliegue a producción de `backend-api` requiere que Carlos presione "Manual Deploy" en el dashboard de Render después de validar que `backend-api-staging` funciona. Esto es análogo al required reviewer que ya protege `publish-production` en `mobile-app-ci.yml`, adaptado al mecanismo nativo de Render (que no tiene el concepto de GitHub Environment).
- Esta asimetría (staging automático, producción manual) es intencional y ya está en el espíritu de `org.md` § Deployment ("Production deploys gate on a separate manual approval").

Ningún cambio de código en `backend-api-ci.yml` es necesario para esto — es configuración del dashboard de Render, documentada aquí para que Carlos la ejecute en Environment Provisioning (la etapa siguiente).

## Resolución 2 — `dependency-audit.yml` pasa a ser required check (cierra NFR-D17)

`dependency-audit.yml` mantiene `continue-on-error: true` en el paso de `npm audit` (el job en sí no cambia — sigue corriendo y reportando, sin bloquear la ejecución del propio workflow). El cambio es **externo al archivo**: Carlos activa, en Settings → Branch protection rules de `main`, el job `audit` de `dependency-audit.yml` como **required status check**.

Esto reconcilia una aparente contradicción: `continue-on-error: true` sigue existiendo (el workflow no falla internamente por una vulnerabilidad — solo reporta), pero al ser un required status check, GitHub sí bloquea el merge de un PR si ese check no ha corrido o corrió con error de ejecución (no de vulnerabilidad encontrada, que es un resultado válido y visible, no un fallo del job). La revisión bloqueante real de vulnerabilidad crítica/alta sigue siendo la decisión humana de Carlos al ver el reporte — consistente con NFR-D17.3 (combinación de status check + required reviewer, ya diseñada en `nfr-design/security-design.md`).

`project.md` § Forbidden ya registra que ningún despliegue a producción avanza con las vulnerabilidades críticas/altas conocidas de `260908` sin resolver — ese es el primer paso operativo de este intent (`team.md` §1), anterior e independiente de este gate de CI.

## Resolución 3 — `mobile-app-ci.yml`: `publish-preview` sin `environment: staging` (hallazgo nuevo de esta etapa)

El job `publish-preview` no declara `environment:`, a diferencia de `publish-production` que sí declara `environment: production`. Esto significa que, tal como está hoy, `publish-preview` no puede leer un secreto `EXPO_TOKEN` scopeado al Environment `staging` diseñado en `nfr-design/security-design.md` — solo tendría acceso a un secret de repositorio, lo que `project.md` § Forbidden prohíbe explícitamente para secretos de producción y que `team.md` §3 diseña como "nunca compartido" también para staging.

**Resolución**: agregar `environment: staging` al job `publish-preview` en `mobile-app-ci.yml`. A diferencia del Environment `production` (que tiene required reviewer = Carlos), el Environment `staging` se configura **sin required reviewer** — mantiene el despliegue automático a staging en cada push a `main`, consistente con `org.md` § Deployment ("deploy on merge to staging"); el Environment aquí sirve únicamente para scopear el secreto `EXPO_TOKEN` de staging, no para gatear aprobación.

Este es un cambio de una línea en `.github/workflows/mobile-app-ci.yml` (agregar `environment: staging` bajo el job `publish-preview`, mismo patrón que `publish-production`) — ejecutable en esta misma etapa dado que Q1 confirmó que editar workflows está dentro de alcance.

## Pipeline resultante — flujo completo por componente

**`backend-api`** (por push a `main` tocando `packages/backend-api` o `packages/api-contract`):
1. `backend-api-ci.yml` → build + `prisma generate` + test + build. Required check.
2. `dependency-audit.yml` (matrix incluye `backend-api`) → required check (Resolución 2).
3. Render auto-deploy → `backend-api-staging` se redespliega automáticamente (Resolución 1).
4. Carlos ejecuta el smoke test (`nfr-design/reliability-design.md`) contra `backend-api-staging`.
5. Si el smoke test pasa, Carlos presiona "Manual Deploy" en Render para `backend-api-production` (Resolución 1).
6. Carlos repite el smoke test contra `backend-api-production` — esta es la confirmación final de éxito del despliegue (`project.md` § Mandated).

**`mobile-app`** (por push a `main` tocando `packages/mobile-app` o `packages/api-contract`):
1. `mobile-app-ci.yml` job `test` → build + typecheck + test. Required check.
2. `dependency-audit.yml` (matrix incluye `mobile-app`) → required check (Resolución 2).
3. Job `publish-preview` (ahora con `environment: staging`, Resolución 3) → clasifica nativo vs. JS/TS, publica a canal/perfil `preview`.
4. Job `publish-production` (`environment: production`, required reviewer = Carlos, sin cambio) → tras aprobación de Carlos, publica a canal/perfil `production`.

## Puente hacia Environment Provisioning

Este documento deja tres acciones concretas para la siguiente etapa (no ejecutadas aquí, que es solo diseño): (1) editar `render.yaml` con la segunda entrada de servicio (`infrastructure-specification.md`), (2) editar `mobile-app-ci.yml` agregando `environment: staging` al job `publish-preview`, (3) configuración de dashboard: auto-deploy on/off por servicio de Render, required status check de `dependency-audit.yml` en branch protection, y creación de los dos GitHub Environments con sus secretos (`team.md` §3).

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-09T12:40:00Z
**Iteration:** 1

### Findings

Ninguno bloqueante. Los tres desfases identificados (render.yaml de un solo servicio, dependency-audit.yml no bloqueante, mobile-app-ci.yml sin `environment: staging`) quedan resueltos con acciones concretas y trazables a la infraestructura real del repo, sin reabrir ninguna decisión de arquitectura ya afirmada en `260908` ni introducir recursos fuera del free tier.

### Validation Tool Results

| Tool | Result | Interpretación |
|---|---|---|
| Verificación cruzada manual contra los 4 workflows reales y `render.yaml` real | PASS | Cada resolución referencia el archivo/job real exacto, no una descripción genérica; el hallazgo nuevo (`publish-preview` sin `environment:`) se verificó leyendo el YAML completo, no solo su comentario descriptivo |
| Verificación de disciplina de alcance | PASS | Todos los cambios propuestos son configuración de despliegue/pipeline (Q1, confirmado por Carlos) — ningún cambio toca `backend-api/src/**` ni `mobile-app/src/**` |
| Verificación de consistencia con `project.md` § Forbidden/Mandated | PASS | La separación de secretos por Environment (Resolución 3) y el orden staging-antes-que-producción (Resolución 1) son consistentes con las reglas ya afirmadas |

### Summary

El pipeline de CI/CD queda completamente especificado para los dos componentes desplegables, con las tres brechas encontradas entre el diseño ya afirmado en `260908`/`nfr-design` y el estado real del repo cerradas mediante acciones concretas (dos ediciones de archivo, tres configuraciones de dashboard). Ninguna requiere código de aplicación nuevo. Listo para Environment Provisioning.
