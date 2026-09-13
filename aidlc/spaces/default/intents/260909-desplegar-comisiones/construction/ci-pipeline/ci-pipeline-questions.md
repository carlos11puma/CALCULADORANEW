# CI Pipeline — Preguntas (260909-desplegar-comisiones)

## Sources

- [upstream:build-and-test-summary] `260908-calculadora-comisiones-m/construction/build-and-test/build-and-test-summary.md`
- [upstream:infrastructure-design] `construction/infrastructure-design/cicd-pipeline.md` (ya resolvió el gate de `dependency-audit.yml` y el `environment: staging` faltante — no se reabre aquí)
- [contexto: archivos reales del repo] `.github/workflows/backend-api-ci.yml`, `.github/workflows/api-contract-ci.yml`, `.github/workflows/mobile-app-ci.yml`, `packages/{backend-api,api-contract}/vitest.config.ts`, `packages/mobile-app/jest.config.js`, `packages/{backend-api,api-contract}/package.json`

## Preguntas planteadas a Carlos Puma

El alcance de esta etapa (a diferencia de Infrastructure Design, que resolvió el despliegue en sí) es el pipeline de build/test/calidad — qué bloquea un merge a `main`. Auditando los 3 workflows de test reales contra sus configuraciones de cobertura encontré un desfase concreto y genuino que no estaba documentado antes.

### Q1 — El piso de cobertura 80% líneas / 70% branches / 80% funciones (`team.md` § Testing Posture, "NUNCA relajar este umbral") está configurado en `vitest.config.ts` de `backend-api` y `api-contract`, pero **no se está aplicando en CI**: el paso de test en `backend-api-ci.yml` y `api-contract-ci.yml` corre `npm test` (que ejecuta `vitest run` sin el flag `--coverage`) — Vitest solo verifica los umbrales de cobertura cuando la recolección de cobertura está activa. En la práctica, hoy un PR que baje la cobertura de `backend-api` o `api-contract` por debajo del piso **pasaría el CI de todos modos**. `mobile-app-ci.yml` sí lo hace bien (su paso de test ya incluye `-- --coverage`, y `jest.config.js` tiene `coverageThreshold` configurado). ¿Quieres que esta etapa cierre esa brecha?

A. Sí, agregar `--coverage` al paso de test de `backend-api-ci.yml` y `api-contract-ci.yml` (mismo patrón que `mobile-app-ci.yml`) — así el piso de cobertura ya decidido se aplica de verdad como gate de CI, no solo como configuración sin efecto
B. No, dejarlo como está por ahora — abrir un intent de Construction separado para esto
X. Other (please specify)

**[Answer]: A. Sí, agregar `--coverage` al paso de test de `backend-api-ci.yml` y `api-contract-ci.yml`** — mismo patrón que `mobile-app-ci.yml`, así el piso de cobertura ya decidido se aplica de verdad como gate de CI.

## Assumptions & Open Questions

- [assumption] La herramienta de CI sigue siendo GitHub Actions (ya en uso en los 3 workflows de test) — no se introduce Jenkins, CodeBuild ni CodePipeline.
- [assumption] La estrategia de ramas sigue siendo trunk-based con ramas cortas por función (`org.md` § Way of Working, ya afirmado) — no se reabre.
- [assumption] No se necesita un repositorio de artefactos nuevo (ECR, CodeArtifact, S3): Render construye la imagen Docker directamente del repositorio conectado, y EAS gestiona sus propios artefactos de build — ninguno pasa por un registro intermedio de este proyecto.
- [assumption] El gate de `dependency-audit.yml` como required status check y el `environment: staging` faltante en `mobile-app-ci.yml` ya quedaron resueltos en `infrastructure-design/cicd-pipeline.md` — esta etapa no los repite, solo los referencia como ya decididos.

A. Accept assumptions
B. Convert to follow-up questions

**[Answer]: A. Accept assumptions**

## Consolidated Summary Confirmation

- Los 3 workflows de test (`backend-api-ci.yml`, `api-contract-ci.yml`, `mobile-app-ci.yml`) siguen siendo required checks de branch protection sobre `main` — sin cambio ahí.
- Nuevo: se agrega `--coverage` al comando de test de `backend-api-ci.yml` y `api-contract-ci.yml`, para que el piso de cobertura 80/70/80/80 ya configurado en sus `vitest.config.ts` realmente bloquee un PR que lo incumpla — cerrando un desfase real encontrado en esta etapa (hoy ese piso existe en configuración pero no se aplica en CI).
- `dependency-audit.yml` como required status check y el `environment: staging` de `mobile-app-ci.yml` quedan tal como ya se resolvieron en Infrastructure Design — sin cambios adicionales aquí.
- T-11 (prueba de integración HTTP real backend-api↔mobile-app, diferida en `build-and-test-summary.md` de `260908`) queda formalmente documentada como responsabilidad del smoke test manual post-despliegue (`nfr-design/reliability-design.md`), no de un paso automatizado nuevo en CI — no hay backend real desplegado en el momento del PR, solo después del merge.
- No se introduce ninguna herramienta de CI nueva ni repositorio de artefactos nuevo.

Does this all look correct before I generate the design artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
