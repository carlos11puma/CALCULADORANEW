# Build and Test — Results

## Sources

- [upstream:build-and-test-summary] `construction/build-and-test/build-and-test-summary.md`

## Build status

- api-contract: ✅ success (`npm run build --workspace=packages/api-contract`, exit 0)
- backend-api: ⚠️ `npm run build` fails at the `prisma generate` prestep (sandbox network policy blocks `binaries.prisma.sh`, 403 — reproduced independently in this stage); the real compilation (`npx nest build`, bypassing the blocked prestep) succeeded: exit 0, `dist/` generated.
- mobile-app: ✅ success (`npm run typecheck --workspace=packages/mobile-app`, exit 0)

## Test results (re-executed and verified independently in this stage, not only reported)

| Unidad | Suites | Tests | Passed | Failed | Skipped |
|---|---|---|---|---|---|
| api-contract | 2 | 15 | 15 | 0 | 0 |
| backend-api | 25 | 134 | 134 | 0 | 0 |
| mobile-app | 43 | 187 | 187 | 0 | 0 |
| **Total** | **70** | **336** | **336** | **0** | **0** |

No failure details — all 336 tests passed on re-execution.

## Coverage report

| Unidad | Líneas | Branches | Funciones | Statements |
|---|---|---|---|---|
| backend-api | 91.87% | 84.64% | 90.84% | 91.87% |
| mobile-app | 95.66% | 87.36% | 91.61% | 94.14% |

(api-contract has no coverage threshold configured — see `build-and-test-summary.md` note.)

## Target Verification Matrix (final)

See `build-and-test-summary.md` § Target Verification Matrix for the full table with sources and evidence. Final verdicts:

| Target ID | Verdict |
|---|---|
| T-01 | Met |
| T-02 | Met |
| T-03 | Met |
| T-04 | Met |
| T-05 | Met (con desviación documentada) |
| T-06 | Met |
| T-07 | Met |
| T-08 | Unverified (diferido a `performance-validation`) |
| T-09 | Met (verificación estructural) |
| T-10 | **Not Met** |
| T-11 | Unverified (diferido a `ci-pipeline`) |
| T-12 | Met |

## Failure predicate assessment

Per `build-and-test.md`: "Build and Test has failed when any build or test command fails OR any applicable target is Not Met or Unverified." T-10 is `Not Met` and T-08/T-11 are `Unverified` (legitimately deferred per the stage's own deferral rule, T-08 to a scheduled owning stage; T-11 informally, no strict owning validation stage exists for it). This triggers the stage's failure-escalation ladder.

## Failure-escalation ladder applied

1. **In-stage fix attempted (rung 1)**: `npm audit fix` (non-breaking) run for all 3 workspaces — no fixes available without `--force` (major version bumps: `@nestjs/cli`, `vitest`/`vite`, `xcode`/`uuid` chain). No safe in-stage fix exists.
2. **Classify and estimate impact (rung 2)**: root cause is NOT in this project's own generated source/test code — it is in third-party dependency versions pulled in by the chosen frameworks (NestJS tooling, Vitest, Expo/React Native tooling). An identifiable fix exists (`npm audit fix --force`, upgrading `@nestjs/cli` to a new major, `vitest`/`vite` to a new major, etc.) but carries **estimated impact**: real risk of breaking the already-verified, 336-passing-test codebase (major version bumps to core build/test tooling), non-trivial re-verification effort, and no network-isolated way in this sandbox to test the upgrade path safely before committing to it. Effort/cost: moderate-to-high (re-run full suites, likely code adjustments for breaking API changes in NestJS CLI v12 / Vitest 3 / etc.); this is not an unestimated-effort dismissal — the impact is real and non-trivial for a solo-maintained MVP with a non-technical stakeholder.
3. **Autonomous bounded loop-back (rung 3)**: not applicable — `Construction Autonomy Mode` is unset (gated) in `aidlc-state.md`.
4. **Halt-and-ask (rung 4)**: mode is gated/unset → halt and present the impact-estimated question to the human, listing the candidate fix WITH its estimated impact, per `stage-protocol-construction.md` § "Build-and-Test failure loop-back".

## Human decision (halt-and-ask resolution)

Presented to Carlos Puma (2026-09-08T21:37Z), genuine confirmation via structured question:

1. **T-10 (vulnerabilidades de dependencias, Not Met)**: opciones presentadas — "Aceptar como riesgo conocido por ahora" vs. "Intentar la actualización ahora (`npm audit fix --force`)". **Decisión: Aceptar como riesgo conocido por ahora.** Razón dada: no arriesgar romper 336 pruebas ya verificadas en este punto del proyecto (MVP aún sin desplegar a producción). Queda como acción pendiente antes de cualquier despliegue de producción real — documentada en `build-and-test-summary.md` y aquí, no silenciada.
2. **T-08/T-11 (objetivos diferidos por falta de entorno desplegado, Unverified)**: opciones presentadas — "Aceptar y continuar" vs. "Detener y revisar primero". **Decisión: Aceptar y continuar.** T-08 queda formalmente diferido a `performance-validation`; T-11 al primer despliegue real vía `ci-pipeline`.

**Accepted-failure exit**: Build and Test se completa con T-10 formalmente `Not Met` y T-08/T-11 formalmente `Unverified`, ambos con decisión humana explícita de aceptar y continuar en lugar de bloquear esta etapa — per `build-and-test.md` Step 9, este es un "accepted failure" exit path, registrado en su totalidad en este documento y en `build-and-test-summary.md` antes de cerrar la etapa.

## Loop-Back Log

(none — no loop-back to code-generation was triggered; this is a dependency-version risk-acceptance decision, not a generated-code defect, resolved by human acceptance instead)
