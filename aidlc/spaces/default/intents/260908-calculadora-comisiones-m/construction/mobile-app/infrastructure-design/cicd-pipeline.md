# Infrastructure Design — mobile-app — Pipeline de CI/CD

## Sources

- [upstream:infrastructure-specification] `construction/mobile-app/infrastructure-design/infrastructure-specification.md`
- [upstream:team-rules] `aidlc/spaces/default/memory/team.md`
- [Q3] [Q4] `infrastructure-design-questions.md`

Implementa el mismo mandato de `team.md` § Deployment que `backend-api` ("despliegue automático a un ambiente de pruebas en cada integración a `main`; aprobación manual del supervisor requerida antes de producción"), adaptado al modelo de distribución de una app móvil vía EAS en vez de un servicio HTTP desplegable.

## Etapas del pipeline (GitHub Actions, `.github/workflows/mobile-app-ci.yml`)

1. **Trigger**: cualquier push a `main` que toque `packages/mobile-app/**` o `packages/api-contract/**`, y cualquier pull request contra `main` con el mismo filtro.
2. **Build**: `npm ci` en la raíz del monorepo; `npm run build --workspace=packages/api-contract` (tipos que `mobile-app` consume); lint/type-check de `packages/mobile-app` (sin paso de "build" nativo propio en este paso — Expo compila en EAS, no en CI).
3. **Test**: `npm test --workspace=packages/mobile-app` con reporte de cobertura, mismo mecanismo de piso 80% que `backend-api` (`team.md` § Testing Posture).
4. **Gate de pull request**: los pasos 2-3 son un check requerido de GitHub para poder mergear a `main`.
5. **Clasificación del cambio** (tras merge exitoso a `main`): el workflow determina si el diff toca solo `packages/mobile-app/src/**` (JS/TS puro, sin dependencias nativas nuevas ni cambios en `app.json`/`app.config.ts`) o si toca configuración nativa/dependencias — determina el siguiente paso automáticamente.
6. **Publicación automática a staging/preview** (equivalente móvil de "ambiente de pruebas"): si el cambio es solo JS/TS, `eas update --branch preview --auto` publica la actualización OTA al canal `preview` sin acción manual; si el cambio toca configuración nativa, `eas build --profile preview --non-interactive` genera un nuevo build interno — ambos casos cumplen "despliegue automático a un ambiente de pruebas en cada integración a `main`".
7. **Aprobación manual antes de producción**: igual que `backend-api`, un GitHub Actions **Environment** con "required reviewer" (Carlos) pausa el workflow de publicación al canal/perfil `production` (`eas update --branch production` o `eas build --profile production`) hasta su aprobación explícita.
8. **Rollback**: EAS Update conserva el historial de publicaciones por canal — un rollback de una actualización OTA es republicar la versión anterior (`eas update:republish`) desde el canal `production`; un rollback de un build nativo requiere que los vendedores permanezcan en el build anterior (no hay "desinstalación forzada" posible vía EAS Internal Distribution), aceptado como limitación operativa del MVP dado el bajo volumen de builds nativos esperado.

## Tabla de etapas → gate

| Etapa | Gate | Bloquea |
|---|---|---|
| Build + Lint + Test | Check requerido de GitHub en cada PR | Merge a `main` si falla |
| Publicación a `preview` (OTA o build) | Ninguno — automático tras merge exitoso | N/A |
| Publicación a `production` (OTA o build) | Aprobación manual de Carlos (GitHub Environment "required reviewer") | La publicación a `production` no corre sin esa aprobación |

## Gestión de secretos en el pipeline

- **GitHub Actions Secrets**: `EXPO_TOKEN` (autenticación de `eas` CLI en CI) — nunca se imprime en logs.
- **Variables de entorno de la app** (`API_BASE_URL` de staging/producción): configuradas vía `eas.json` por perfil de build/canal de update, no hardcodeadas en el código fuente — consistente con NFR3.12 de `backend-api` y con el mandato de `project.md` de nunca commitear secretos (aunque `API_BASE_URL` no es un secreto en sí, se gestiona con el mismo mecanismo por consistencia).

## Assumptions & Open Questions

None.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T21:27:15Z
**Iteration:** 2
**Request Challenge:** review:12a9c8dbd59a0da4c477bb7e263fbc8f

### Nota de esta iteración (2)

Reapertura administrativa del gate: el único cambio de contenido desde la iteración 1 fue mecánico — completar la columna Status (antes vacía) de la tabla de Findings con el valor de enum válido `New`, requerido por el validador de `aidlc-review-brief.ts`. No hay cambio de sustancia en ningún hallazgo, en el veredicto, ni en el resto del documento. El veredicto READY y los hallazgos de la iteración 1 se confirman sin cambios — ver la tabla debajo.

### Historial — iteración 1

Date: 2026-09-08T17:10:46Z (revisión original, contenido sin cambios de sustancia)

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | § Etapas del pipeline, paso 5 | La "clasificación del cambio" (JS-only vs. cambio nativo) se describe a nivel de intención pero no especifica la lógica exacta de detección (qué paths — `app.json`, `package.json` de dependencias nativas, cambios de permisos — cuentan como "nativo") | No bloquea: Code Generation debe definir la lista exacta de paths/patrones que disparan `eas build` en vez de `eas update`, y verificar la sintaxis real de los comandos de EAS CLI contra la versión pinneada en `package.json` (el pseudocódigo de este documento es de diseño, no literal) | New |
| R-02 | Minor | § Etapas del pipeline, paso 8 (Rollback) | El rollback de un build nativo roto solo revierte lo que EAS Update puede alcanzar (cambios JS/TS); si el build nativo en sí tiene un defecto, los vendedores quedan en ese build hasta que se distribuya uno nuevo — no hay mecanismo de "forzar reinstalación" vía EAS Internal Distribution | No bloquea para el MVP (volumen bajo de builds nativos esperado dado el flujo OTA): documentar explícitamente esta limitación operativa y el procedimiento manual (recontactar a los vendedores con el nuevo link/QR) como parte de la documentación de Code Generation | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `bun .claude/tools/aidlc-sensor-traceability.ts --output-path .../infrastructure-design/traceability.json --stage-slug infrastructure-design` | PASS: `{"pass":true,"gaps":[],"orphans":[],"missing_from_upstream_ids":[],"invalid_entries":[],"invalid_targets":[],"findings_count":0}` | Las 9 NFRx.y mencionadas en los 3 artefactos de `nfr-design` escaneados por el sensor están cubiertas (`NFR3.14` `OK` con recurso concreto — EAS Build; el resto `N/A` justificado por ser decisiones de código sin recurso de infraestructura propio) |
| Verificación cruzada `infrastructure-specification.md` vs. `cicd-pipeline.md` | PASS (manual) | Los perfiles de EAS Build y los canales de EAS Update declarados en `infrastructure-specification.md` son exactamente los que `cicd-pipeline.md` publica; ningún recurso mencionado en un archivo queda sin referencia en el otro |
| Verificación de cumplimiento del mandato de `team.md` § Deployment | PASS (manual) | El pipeline implementa "despliegue automático a un ambiente de pruebas en cada integración a `main`" (paso 6, canal/perfil `preview`) y "aprobación manual del supervisor antes de producción" (paso 7, GitHub Environment con required reviewer) — mismo patrón que `backend-api`, adaptado al modelo de distribución móvil |

### Summary

La especificación de infraestructura, el diseño de monitoreo y el pipeline de CI/CD de `mobile-app` son completos, consistentes entre sí, y adaptan correctamente el mandato de `team.md` de despliegue automático a staging con aprobación manual antes de producción al modelo de distribución EAS (OTA vs. build nativo) en vez de un servicio HTTP desplegable. Los dos hallazgos son endurecimientos razonables de detalle operativo para un pipeline de bajo volumen — ninguno bloquea, ambos quedan documentados como trabajo explícito de Code Generation.
