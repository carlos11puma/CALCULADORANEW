# CI Pipeline — Questions

## Sources

- [upstream:cicd-pipeline] `construction/backend-api/infrastructure-design/cicd-pipeline.md`
- [upstream:cicd-pipeline] `construction/mobile-app/infrastructure-design/cicd-pipeline.md`
- [upstream:test-results] `construction/build-and-test/test-results.md`
- [upstream:team] `aidlc/spaces/default/memory/team.md` § Deployment

## Contexto ya decidido (no se vuelve a preguntar)

- **Herramienta de CI**: GitHub Actions — ya decidida y en uso (`infrastructure-design` de backend-api y mobile-app, workflows reales ya creados: `.github/workflows/backend-api-ci.yml`, `.github/workflows/mobile-app-ci.yml`).
- **Estrategia de ramas**: trunk-based, ramas cortas integradas a `main` en 1-2 días (`org.md`/`team.md` § Way of Working).
- **Quality gates de merge**: build + pruebas verdes como required check de branch protection sobre `main`, ya configurado en los 2 workflows existentes.
- **Repositorios de artefactos**: ninguno adicional requerido — `backend-api` despliega directo a Render desde el propio workflow (sin registry de contenedores); `mobile-app` publica vía EAS (registry propio de Expo); `api-contract` no se publica a ningún registro (consumido solo dentro del monorepo).

## Preguntas planteadas a Carlos Puma (2026-09-08T21:40Z)

### Q1 — ¿api-contract necesita su propio workflow de CI?

`api-contract` no tiene `infrastructure-design/cicd-pipeline.md` propio (es una unidad `spec`, excluida de esa etapa) y hasta ahora solo se validaba indirectamente al fallar el build de `backend-api` o `mobile-app` (ambos workflows corren `npm run build --workspace=packages/api-contract` como primer paso).

**[Answer]: A. Sí, su propio workflow** — crear `.github/workflows/api-contract-ci.yml` que corre build + sus 15 pruebas en cada push/PR que toque `packages/api-contract/**`, igual que las otras dos unidades. Razón: un cambio roto en el contrato debe fallar en su propio workflow, no solo como efecto colateral en otra unidad.

### Q2 — ¿El pipeline de CI debe incluir un chequeo de `npm audit`?

Build and Test (etapa anterior) encontró vulnerabilidades reales en dependencias de producción — 1 crítica + 5 altas en `backend-api`, 1 crítica + 11 altas en `mobile-app` — aceptadas como riesgo conocido por Carlos, sin bloquear el proyecto en este punto (ver `construction/build-and-test/test-results.md` § Human decision).

**[Answer]: A. Sí, agregar como aviso no bloqueante** — nuevo workflow `.github/workflows/dependency-audit.yml`, corre `npm audit --omit=dev --audit-level=high` por workspace en cada push a `main` y semanalmente (cron lunes 09:00 UTC), con `continue-on-error: true` (no bloquea merges, no es un required check). Mantiene visibilidad de nuevas vulnerabilidades sin frenar el trabajo diario.

## Assumptions & Open Questions

None.

## Consolidated Summary Confirmation

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
