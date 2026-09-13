# CI Pipeline — Quality Gates

## Sources

- [upstream:test-results] `construction/build-and-test/test-results.md`
- [upstream:build-and-test-summary] `construction/build-and-test/build-and-test-summary.md`
- [upstream:team] `aidlc/spaces/default/memory/team.md` § Testing Posture, § Deployment
- [Q1, Q2] `ci-pipeline-questions.md`

## Gates bloqueantes (required checks de branch protection sobre `main`)

| Gate | Unidad | Umbral | Enforced por |
|---|---|---|---|
| Build sin error | api-contract | `tsc` exit 0 | `api-contract-ci.yml` |
| Suite de pruebas en verde | api-contract | 15/15 | `api-contract-ci.yml` |
| Build sin error | backend-api | `nest build` exit 0 (vía `prisma generate` + `nest build`) | `backend-api-ci.yml` |
| Suite de pruebas en verde | backend-api | 134/134 | `backend-api-ci.yml` |
| Cobertura mínima | backend-api | 80% líneas / 70% branches / 80% funciones (`team.md`) | Verificado en Build and Test (91.87%/84.64%/90.84%) — **no medido automáticamente en CI todavía** (ver Gaps abajo) |
| Typecheck sin error | mobile-app | `tsc --noEmit` exit 0 | `mobile-app-ci.yml` |
| Suite de pruebas en verde | mobile-app | 187/187 | `mobile-app-ci.yml` |
| Cobertura mínima | mobile-app | 80% líneas / 70% branches / 80% funciones / 80% statements (`team.md`) | Verificado en Build and Test (95.66%/87.36%/91.61%/94.14%) — **no medido automáticamente en CI todavía** (ver Gaps abajo) |
| Aprobación manual antes de producción | backend-api, mobile-app | Required reviewer = Carlos Puma | GitHub Environment `production` en cada workflow (`team.md` § Deployment) |

## Gates no bloqueantes (aviso)

| Gate | Unidad | Umbral | Enforced por |
|---|---|---|---|
| Vulnerabilidades de dependencias de producción | las 3 | `npm audit --omit=dev --audit-level=high` | `dependency-audit.yml` — `continue-on-error: true`, no es required check (Q2) |

## Gate de nivel de proyecto (ya verificado, no repetido en CI)

**Cross-Unit Final Coverage Gate** (`construction/build-and-test/cross-unit-traceability.md`): PASS — los 23 FR/NFR y 38 AC de `inception/requirements-analysis/requirements.md` y `inception/user-stories/stories.md` están cubiertos (`OK` o `N/A` genuinamente justificado) en al menos una unidad. Este gate no es re-ejecutable automáticamente en CI (requiere el análisis cruzado de traceabilidad de las 3 unidades) — se re-verifica manualmente en cada Construction futura, no en cada push.

## Gaps identificados (no bloquean el avance de esta etapa)

1. **Umbral de cobertura no enforced automáticamente en CI**: los workflows de `backend-api` y `mobile-app` corren las pruebas con `--coverage` pero no fallan el build si la cobertura cae debajo del piso de `team.md` (80%/70%/80%) — el piso se verificó manualmente en Build and Test, no vía un flag `--coverage.thresholds` (Vitest) o `coverageThreshold` (Jest) en la configuración de cada paquete. Queda como mejora futura, no bloqueante para esta etapa (no fue parte de las preguntas afirmadas a Carlos).
2. **Falta `eslint.config.js` en `mobile-app`** (ya documentado desde `code-generation`) — sin paso de lint en ningún workflow del monorepo. No bloquea (mismo criterio que Build and Test).
3. **Vulnerabilidades de dependencias ya conocidas** (T-10 de Build and Test) — el nuevo `dependency-audit.yml` las seguirá reportando en cada corrida hasta que se resuelvan; aceptado como riesgo conocido por Carlos, con acción pendiente antes de producción.
