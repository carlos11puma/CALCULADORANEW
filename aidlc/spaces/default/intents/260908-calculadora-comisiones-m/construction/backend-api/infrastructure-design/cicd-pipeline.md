# Infrastructure Design — backend-api — CI/CD Pipeline

## Sources

- [upstream:infrastructure-specification] `construction/backend-api/infrastructure-design/infrastructure-specification.md`
- [upstream:team-rules] `aidlc/spaces/default/memory/team.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`

Implementa el mandato de `team.md` § Deployment ("despliegue automático a un ambiente de pruebas en cada integración a `main`; aprobación manual del supervisor requerida antes de desplegar a producción") y el piso de cobertura del 80% de `team.md` § Testing Posture, sobre GitHub Actions + Render (Q4, Q5).

## Etapas del pipeline (GitHub Actions, `.github/workflows/backend-api.yml`)

1. **Trigger**: cualquier push a `main` que toque `packages/backend-api/**` o los paquetes de los que depende (`packages/api-contract/**`), y cualquier pull request contra `main` con el mismo filtro de paths.
2. **Build**: `npm ci` en la raíz del monorepo (instala todos los workspaces); `npm run build --workspace=packages/api-contract` primero (genera los tipos que `backend-api` consume como dependencia de workspace), luego `npm run build --workspace=packages/backend-api`.
3. **Lint**: ESLint sobre `packages/backend-api` (mandato de `team.md` § Code Style) — falla el pipeline si hay errores (no solo advertencias).
4. **Test**: `npm test --workspace=packages/backend-api` con el reporte de cobertura; el paso falla explícitamente si la cobertura de líneas cae por debajo del 80% (piso de `team.md` § Testing Posture) — el mismo mecanismo de umbral que ya se usó en `api-contract` (`vitest.config.ts` coverage thresholds).
5. **Gate de pull request**: los pasos 2-4 son un check requerido de GitHub para poder mergear a `main` — un PR no se puede mergear si build, lint o pruebas fallan.
6. **Despliegue automático a staging**: un push a `main` que pasó los pasos 2-4 dispara el auto-deploy nativo de Render (`render.yaml`, servicio `backend-api-staging`) — sin paso manual, cumple "despliegue automático a un ambiente de pruebas en cada integración a `main`".
7. **Aprobación manual antes de producción**: el despliegue a `backend-api-production` usa un GitHub Actions **Environment** con un "required reviewer" configurado a Carlos — el workflow de despliegue a producción queda pausado esperando su aprobación explícita en la interfaz de GitHub antes de ejecutar el paso de deploy a Render (vía la CLI de Render o un deploy hook), cumpliendo literalmente el mandato de `team.md`.
8. **Rollback**: Render conserva los últimos despliegues exitosos por servicio — un rollback es "Redeploy" del despliegue anterior desde el dashboard de Render (o su API), sin un paso de pipeline dedicado dado el volumen y la simplicidad operativa aceptada para el MVP.

## Tabla de etapas → gate

| Etapa | Gate | Bloquea |
|---|---|---|
| Build + Lint + Test | Check requerido de GitHub en cada PR | Merge a `main` si falla |
| Despliegue a staging | Ninguno — automático tras merge exitoso | N/A |
| Despliegue a producción | Aprobación manual de Carlos (GitHub Environment "required reviewer") | El deploy a `backend-api-production` no corre sin esa aprobación |

## Gestión de secretos en el pipeline

- **GitHub Actions Secrets** (a nivel de repositorio): usados solo por los pasos de build/test si las pruebas de integración requieren una base de datos Neon efímera — nunca se imprimen en logs (GitHub Actions enmascara automáticamente cualquier valor registrado como secret).
- **Variables de entorno de los servicios en ejecución** (`DATABASE_URL` de staging/producción, y cualquier otro secreto de configuración): se configuran directamente en el dashboard de Render, marcadas como `sync: false` en `render.yaml` — nunca viajan a través de GitHub Actions ni quedan en el archivo versionado (Q5).
- Consistente con NFR3.12 (`security-design.md`): `@nestjs/config` con validación de esquema falla rápido al arrancar si Render no inyectó una variable requerida.

## Promoción entre ambientes

No hay "promoción" de un build de staging a producción en el sentido de mover un artefacto — cada servicio Render construye su propia imagen desde el mismo commit de `main` en el momento de su propio despliegue (staging automático, producción tras aprobación) — ambos ambientes corren exactamente el mismo código fuente, difiriendo solo en la base de datos (rama Neon) a la que se conectan.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T21:27:00Z
**Iteration:** 2
**Request Challenge:** review:31cffcaa00fc6a39f5cdb628021fc58b

### Nota de esta iteración (2)

Reapertura administrativa del gate: el único cambio de contenido desde la iteración 1 fue mecánico — completar la columna Status (antes vacía) de la tabla de Findings con el valor de enum válido `New`, requerido por el validador de `aidlc-review-brief.ts`. No hay cambio de sustancia en ningún hallazgo, en el veredicto, ni en el resto del documento. El veredicto READY y los hallazgos de la iteración 1 se confirman sin cambios — ver la tabla debajo.

### Historial — iteración 1

Date: 2026-09-08T16:09:53Z (revisión original, contenido sin cambios de sustancia)

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | `cicd-pipeline.md` § Etapas del pipeline, paso 6 | El auto-deploy nativo de Render escucha directamente el push a la rama `main`, independiente del resultado del workflow de GitHub Actions — el texto actual asume que el deploy a staging solo ocurre "tras pasar" build/lint/test, pero por defecto Render no espera un status check externo antes de desplegar | No bloquea: en Code Generation, configurar explícitamente en Render (o en `render.yaml`) que el auto-deploy espere el status check de GitHub Actions ("Wait for CI to pass before deploy"), o documentar que el gate real es el branch-protection de `main` (que ya exige el check verde para poder mergear) — cualquiera de las dos cierra la ambigüedad | New |
| R-02 | Minor | `cicd-pipeline.md` § Rollback | El rollback documentado ("Redeploy" del despliegue anterior desde Render) solo revierte el código, no una migración de base de datos que ese despliegue haya aplicado — si el despliegue revertido incluía una migración de Prisma incompatible con el código anterior, el rollback de código por sí solo dejaría el servicio corriendo contra un esquema que ya no coincide | No bloquea para el MVP (volumen de migraciones bajo, un solo desarrollador que puede intervenir manualmente): documentar en Code Generation la práctica de migraciones aditivas/retrocompatibles (nunca eliminar una columna en el mismo despliegue que dejó de usarla) para que un rollback de código nunca quede desalineado con el esquema | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `bun .claude/tools/aidlc-sensor-traceability.ts --output-path .../infrastructure-design/traceability.json --stage-slug infrastructure-design` | PASS: `{"pass":true,"gaps":[],"orphans":[],...}` | Los 17 NFRx.y mencionados en los 5 artefactos de `nfr-design` escaneados por el sensor están cubiertos (OK con recurso concreto, o N/A justificado por ser una decisión de código sin recurso de infraestructura propio) |
| Verificación cruzada `infrastructure-specification.md` vs. `cicd-pipeline.md` | PASS (manual) | Los dos servicios Render (staging/producción) y sus variables de entorno declaradas en `infrastructure-specification.md` son exactamente los que `cicd-pipeline.md` despliega; ningún recurso mencionado en un archivo queda sin referencia en el otro |
| Verificación de cumplimiento del mandato de `team.md` § Deployment | PASS (manual) | El pipeline implementa literalmente "despliegue automático a un ambiente de pruebas en cada integración a `main`" (paso 6) y "aprobación manual del supervisor antes de producción" (paso 7, GitHub Environment con required reviewer) |

### Summary

La especificación de infraestructura, el diseño de monitoreo y el pipeline de CI/CD de `backend-api` son completos, consistentes entre sí, y cumplen el mandato de `team.md` de despliegue automático a staging con aprobación manual antes de producción. Los dos hallazgos (R-01: gate de CI no explícitamente enlazado al auto-deploy de Render, R-02: rollback de código sin considerar migraciones) son endurecimientos razonables para un pipeline de un solo desarrollador — ninguno bloquea, ambos quedan documentados como trabajo explícito de Code Generation.
