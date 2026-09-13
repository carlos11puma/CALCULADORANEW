# CI Pipeline — Configuration

Confirmado por Carlos Puma tras la Consolidated Summary Confirmation ("Looks correct").

## Sources

- [upstream:cicd-pipeline] `construction/backend-api/infrastructure-design/cicd-pipeline.md`
- [upstream:cicd-pipeline] `construction/mobile-app/infrastructure-design/cicd-pipeline.md`
- [upstream:code-summary] `construction/{api-contract,backend-api,mobile-app}/code-generation/code-summary.md`
- [Q1, Q2] `ci-pipeline-questions.md`

## Vista consolidada — 4 workflows de GitHub Actions

| Workflow | Dispara en | Unidad(es) | Qué hace |
|---|---|---|---|
| `.github/workflows/api-contract-ci.yml` (**nuevo**, Q1) | push a `main` / PR que toque `packages/api-contract/**` | api-contract | `npm test` (15 pruebas) + `npm run build` |
| `.github/workflows/backend-api-ci.yml` (ya existente) | push a `main` / PR que toque `packages/backend-api/**` o `packages/api-contract/**` | backend-api (+ api-contract como dependencia) | build de api-contract, `prisma generate`, `npm test` (134 pruebas), `nest build` |
| `.github/workflows/mobile-app-ci.yml` (ya existente) | push a `main` / PR que toque `packages/mobile-app/**` o `packages/api-contract/**` | mobile-app (+ api-contract como dependencia) | build de api-contract, `tsc --noEmit`, `npm test --coverage` (187 pruebas); en push a `main`: clasificación de cambio + publicación a EAS (preview/staging), con `required reviewer` (Carlos) antes de producción |
| `.github/workflows/dependency-audit.yml` (**nuevo**, Q2) | push a `main` + cron semanal (lunes 09:00 UTC) + manual | las 3 unidades (matriz) | `npm audit --omit=dev --audit-level=high` por workspace, **no bloqueante** (`continue-on-error: true`) |

## Estrategia de ramas

Trunk-based (`org.md`/`team.md` § Way of Working): ramas cortas por función, integradas a `main` en 1-2 días, squash-merge. Cada uno de los 3 workflows de test corre tanto en `pull_request` (bloqueante, required check) como en `push` a `main` (dispara además el despliegue automático a staging donde aplica).

## Despliegue

- **backend-api**: auto-deploy de Render escuchando `main`, gateado por el status check de GitHub Actions (cierra R-01 de la revisión de `cicd-pipeline.md`) — aprobación manual de Carlos (GitHub Environment con required reviewer) antes de producción.
- **mobile-app**: `eas update`/`eas build` según clasificación de cambio (nativo vs. JS-only) tras push exitoso a `main` — mismo patrón de aprobación manual antes de `production`.
- **api-contract**: no se despliega (paquete de contrato consumido solo dentro del monorepo) — su CI es puramente de verificación.

## Repositorios de artefactos

Ninguno adicional: Render despliega directo desde el build de GitHub Actions (sin registry de contenedores intermedio); EAS es el registro propio de Expo para builds/updates de `mobile-app`; `api-contract` no publica a ningún registro npm.
