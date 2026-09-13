# CI Pipeline — CI Configuration

## Sources

- [contexto: archivos reales del repo] `.github/workflows/backend-api-ci.yml`, `.github/workflows/api-contract-ci.yml`, `.github/workflows/mobile-app-ci.yml`, `.github/workflows/dependency-audit.yml`
- [upstream:infrastructure-design] `construction/infrastructure-design/cicd-pipeline.md`
- [Q1] `ci-pipeline-questions.md`

## Herramienta de CI

GitHub Actions — ya en uso, no se introduce ninguna herramienta nueva.

## Estrategia de ramas

Trunk-based (`org.md` § Way of Working, ya afirmado): ramas cortas por función que se integran a `main` en 1-2 días. Cada uno de los 4 workflows dispara por `pull_request` (contra `main`) y por `push` a `main`, consistente con esa estrategia — sin ramas de release de larga vida.

## Los 4 workflows — configuración final de esta etapa

| Workflow | Dispara en | Qué corre | Cambio de esta etapa |
|---|---|---|---|
| `backend-api-ci.yml` | PR/push a `packages/backend-api`, `packages/api-contract` | build api-contract → `prisma generate` → test → build backend-api | Agregar `--coverage` al paso de test (Q1) |
| `api-contract-ci.yml` | PR/push a `packages/api-contract` | build + test | Agregar `--coverage` al paso de test (Q1) |
| `mobile-app-ci.yml` | PR/push a `packages/mobile-app`, `packages/api-contract` | build + typecheck + test (`--coverage` ya presente) + publicación (resuelta en Infrastructure Design) | Ninguno — ya correcto |
| `dependency-audit.yml` | push a `main`, cron semanal, manual | `npm audit` por workspace, `continue-on-error: true` | Ninguno aquí — su promoción a required check ya se resolvió en `infrastructure-design/cicd-pipeline.md` |

## Cambio concreto: agregar `--coverage`

**`backend-api-ci.yml`**, paso de test:
```
- run: npm test --workspace=packages/backend-api -- --coverage
```
(antes: `npm test --workspace=packages/backend-api`, sin el flag)

**`api-contract-ci.yml`**, paso de test:
```
- run: npm test --workspace=packages/api-contract -- --coverage
```
(antes: `npm test --workspace=packages/api-contract`, sin el flag)

Con `--coverage`, Vitest recolecta cobertura y aplica los `thresholds` ya declarados en cada `vitest.config.ts` (80% líneas/statements/funciones, 70% branches) — un PR que baje la cobertura por debajo de ese piso hace fallar el paso de test, igual que ya ocurre en `mobile-app-ci.yml`. Ningún archivo de configuración de umbrales cambia — el piso ya estaba bien declarado, solo faltaba aplicarse.

## Repositorio de artefactos

Ninguno nuevo. Render construye la imagen Docker directamente desde el repositorio conectado (sin pasar por un registro intermedio como ECR); EAS gestiona sus propios artefactos de build/update internamente. Ninguna de las dos plataformas requiere que este proyecto mantenga un registro de artefactos propio.

## Frontera con Build and Test (`260908`)

Esta etapa no repite las pruebas unitarias ya generadas y verificadas en `260908` (336 pruebas, 91.87%/95.66% de cobertura medida) — solo formaliza cómo el pipeline de CI real del repositorio las ejecuta y qué las bloquea. T-11 (integración HTTP real backend-api↔mobile-app), diferida en `build-and-test-summary.md`, no se convierte en un paso automatizado de CI en este PR-gate porque no hay backend real desplegado en el momento de un pull request — su verificación real ocurre en el smoke test manual post-despliegue (`nfr-design/reliability-design.md`), no antes del merge.
