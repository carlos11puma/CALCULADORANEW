# CI Pipeline — Quality Gates

## Sources

- [contexto] `ci-config.md` (esta etapa)
- [upstream:infrastructure-design] `construction/infrastructure-design/cicd-pipeline.md`
- [upstream:build-and-test-summary] `260908-calculadora-comisiones-m/construction/build-and-test/build-and-test-summary.md`
- [upstream:team-practices] `team.md` § Testing Posture

## Gates requeridos antes de un merge a `main`

| Gate | Mecanismo | Bloquea el merge si... |
|---|---|---|
| Build + test de `backend-api` | Required check: job `test` de `backend-api-ci.yml` | Falla el build, `prisma generate`, o cualquier prueba; o (tras esta etapa) la cobertura cae por debajo de 80%/70%/80%/80% |
| Build + test de `api-contract` | Required check: job `test` de `api-contract-ci.yml` | Falla el build, cualquier prueba, o (tras esta etapa) la cobertura cae por debajo del piso |
| Build + typecheck + test de `mobile-app` | Required check: job `test` de `mobile-app-ci.yml` | Falla el build, el typecheck, cualquier prueba, o la cobertura cae por debajo del piso (ya aplicado hoy) |
| Auditoría de dependencias | Required check: job `audit` de `dependency-audit.yml` (ya resuelto en Infrastructure Design) | El propio job no corrió o falló en ejecutarse — una vulnerabilidad encontrada se reporta pero no bloquea automáticamente el check en sí; la decisión de actuar sobre ella sigue siendo de Carlos |
| Aprobación humana en producción | GitHub Environment `production`, required reviewer = Carlos (ya afirmado en `260908`) | Nadie aprueba manualmente el despliegue a producción |

## Piso de cobertura — ahora aplicado en los 3 workspaces

| Workspace | Piso configurado (`vitest.config.ts` / `jest.config.js`) | ¿Se aplicaba en CI antes de esta etapa? | ¿Se aplica después? |
|---|---|---|---|
| `backend-api` | 80% líneas/statements/funciones, 70% branches | No — faltaba `--coverage` | Sí (Q1, `ci-config.md`) |
| `api-contract` | 80% líneas/statements/funciones, 70% branches | No — faltaba `--coverage` | Sí (Q1, `ci-config.md`) |
| `mobile-app` | 80% líneas/statements/funciones, 70% branches | Sí, ya correcto | Sí (sin cambio) |

Este piso es el mismo ya decidido en `team.md` § Testing Posture ("NUNCA relajar este umbral para hacer pasar un paso") — esta etapa no cambia el número, solo cierra la brecha entre lo declarado y lo realmente aplicado en CI.

## Lint

`mobile-app` no tiene `eslint.config.js` configurado (brecha preexistente, ya documentada en `build-and-test-summary.md` de `260908` como desviación aceptada, no nueva) — no se agrega un gate de lint bloqueante para `mobile-app` en esta etapa porque no hay configuración de ESLint real contra la cual correrlo; agregar un gate sin configuración real fallaría siempre y bloquearía todo merge sin dar información útil. `backend-api` y `api-contract` tampoco tienen un paso de lint explícito en su workflow — mismo motivo, ya documentado, no se resuelve aquí (fuera del alcance de infraestructura/pipeline: requeriría configurar ESLint en el código de aplicación, que es trabajo de Construction sobre el código, no de este intent de despliegue).

## Vulnerabilidades de dependencias conocidas — no se resuelven aquí

Las vulnerabilidades críticas/altas ya conocidas de `260908` (`project.md` § Mandated, primer paso operativo de este intent) siguen siendo una acción pendiente separada, anterior a cualquier despliegue real — este gate de `dependency-audit.yml` solo asegura que *futuras* vulnerabilidades nuevas no pasen desapercibidas; no resuelve retroactivamente las ya conocidas.

## Qué queda fuera de esta etapa (ya resuelto en otra)

- `dependency-audit.yml` como required status check de branch protection: resuelto en `infrastructure-design/cicd-pipeline.md` § Resolución 2.
- `environment: staging` en `mobile-app-ci.yml`: resuelto en `infrastructure-design/cicd-pipeline.md` § Resolución 3.
- Auto-deploy asimétrico de Render (staging automático, producción manual): resuelto en `infrastructure-design/cicd-pipeline.md` § Resolución 1.

## Resumen de gates finales

Un pull request a `main` que toque cualquiera de los 3 workspaces con lógica de negocio no puede fusionarse a menos que: (1) su build y sus pruebas pasen, (2) su cobertura no caiga por debajo del piso ya decidido (ahora aplicado en los 3, no solo en `mobile-app`), y (3) el chequeo de auditoría de dependencias haya corrido. La aprobación humana de Carlos sigue siendo el único gate adicional para llegar a producción, sin cambios.
