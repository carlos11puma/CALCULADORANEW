# Code Generation Plan — api-contract

## Sources

- [upstream:functional-spec] `construction/api-contract/functional-design/functional-spec.md`
- [upstream:rules] `construction/api-contract/functional-design/rules.md`
- [upstream:entities] `construction/api-contract/functional-design/entities.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:security-design] `construction/api-contract/nfr-design/security-design.md`
- [upstream:tech-stack-decisions] `construction/api-contract/nfr-requirements/tech-stack-decisions.md`

## Adaptación del alcance a esta unidad

`api-contract` es una unidad `spec`: no ejecuta lógica de negocio ni persiste datos — su "código" es el spec OpenAPI en sí y el paquete de tipos generados a partir de él (decisión de NFR Requirements: workspace de monorepo, sin registro npm externo). Por eso varias capas del perfil estándar de pruebas (modelo de datos, repositorio, lógica de negocio) no aplican — se omiten explícitamente abajo, no se saltan en silencio.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "implementar cada capa aplicable (backend NestJS, frontend React Native) y luego escribir y correr las pruebas de esa capa, antes de integrar a `main`.",
  "scope": "mvp",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Ordering**: implementar cada capa aplicable (backend NestJS, frontend React Native) y luego escribir y correr las pruebas de esa capa, antes de integrar a `main`.\n- Piso de cobertura: 80% de líneas, con ejecución en CI antes de merge (heredado del default de `org.md` para alcance `mvp`, afirmado sin cambios). [Q3]"
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Meet an 80% line-coverage floor.",
      "Run the selected tests in CI before merge."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:cff6928ad131a80acfc365804f9e8862498ef78ce02437ea09ccd65a6cda6af3",
  "contract_sha256": "sha256:5f121b6dc678fe841aa3d00eeb5d16353b0db084dc2be228754e5e309d26bba9"
}
```

## Plan

- [ ] **Step 1**: Estructura del proyecto — crear el workspace `packages/api-contract/` dentro del monorepo (`package.json` de workspace, `tsconfig.json`, carpeta `openapi/`)
- [ ] **Step 2**: Bootstrap del test runner — instalar y configurar `vitest` para este workspace; comando exacto: `npm test --workspace=packages/api-contract` (registrar en `unit-test-instructions.md`)
- [ ] **Step 3**: Data model / database behavior — **N/A**: `api-contract` no persiste datos; no hay modelo de base de datos que implementar en esta unidad (las entidades de `entities.md` son forma de contrato, no un esquema de base de datos — eso es `backend-api`)
- [ ] **Step 4**: Repository / data access — **N/A**: sin persistencia, no hay capa de repositorio
- [ ] **Step 5**: Lógica de negocio — **N/A**: `rules.md` de esta unidad solo cubre validación/autorización de forma, sin cálculo — no hay lógica de negocio propia que codificar (US4.1 Business logic para cálculo de comisión vive en `backend-api`)
- [ ] **Step 6**: API/endpoint (adaptado a "spec") — escribir el archivo `openapi.yaml` consolidando los 6 contratos de `contract-summary.md` (Auth, VendorDirectory, CommissionTier, SalesEntry, CommissionLedger, Notification) en un único documento OpenAPI 3.0.3 válido, con los esquemas de `entities.md` como `components.schemas` compartidos
- [ ] **Step 7**: Pruebas de la Step 6 — validar que `openapi.yaml` es un documento OpenAPI válido (parseable, sin referencias rotas) — traceability: NFR3.1 (forma del contrato de autenticación), BR1.1–BR9.1 (cada regla de validación se refleja en el schema correspondiente)
- [ ] **Step 8**: Generación de tipos — script `generate-types.ts`/comando npm que ejecuta `openapi-typescript openapi.yaml -o types.ts`, produciendo el paquete de tipos TypeScript consumido por `backend-api` y `mobile-app` (decisión de NFR Requirements)
- [ ] **Step 9**: Pruebas de la Step 8 — verificar que la generación produce los tipos esperados para las 7 entidades (`User`, `Session`, `Vendor`, `CommissionTier`, `DailySale`, `CommissionPeriod`, `Notification`) y para cada endpoint declarado
- [ ] **Step 10**: Frontend behavior — **N/A**: `api-contract` no tiene UI
- [ ] **Step 11**: Configuración de entorno/build — script `build` del workspace (valida + genera tipos + compila a `dist/`), sin variables de entorno propias (no hay secretos en esta unidad — mandato de `project.md` de nunca commitear secretos no aplica aquí porque no hay ninguno)
- [ ] **Step 12**: Documentación y trazabilidad — `README.md` del workspace explicando cómo regenerar tipos tras un cambio al YAML, y cómo versionar (`/api/v1` → `/api/v2` en cambios rotos, ADR de Contract Design)

## Trazabilidad historia → paso del plan

`api-contract` no tiene historias propias asignadas (unidad `spec`, ver `unit-of-work-story-map.md`) — su trazabilidad es contra los criterios de aceptación de forma de contrato ya registrados en `functional-design/traceability.json` (AC2.2.2, AC2.3.2, AC3.3.4, FR1-auth, FR2.2-authz, FR3.2, FR3.3, FR9.1, FR2.3-validation), todos cubiertos por el Step 6 (el YAML que codifica esa forma) y heredados sin cambio a este plan.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T21:28:00Z
**Iteration:** 2
**Request Challenge:** review:87f7ef2a2042da29027e2a991bfb600d

### Nota de esta iteración (2)

Reapertura administrativa del gate: el único cambio de contenido desde la iteración 1 fue mecánico — completar la columna Status (antes vacía) de la tabla de Findings con el valor de enum válido `New`, requerido por el validador de `aidlc-review-brief.ts`. No hay cambio de sustancia en ningún hallazgo, en el veredicto, ni en el resto del documento. El veredicto READY y los hallazgos de la iteración 1 se confirman sin cambios — ver la tabla debajo.

### Historial — iteración 1

Date: 2026-09-08T15:27:36Z (revisión original, contenido sin cambios de sustancia)

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | `packages/api-contract/scripts/generate-types.ts` líneas 32-40 (bloque `if (import.meta.url === ...)`) | El bloque de entrada por CLI queda fuera de cobertura de pruebas por diseño (nunca se ejecuta bajo vitest) — explica por qué `generate-types.ts` reporta 70.96% de líneas frente al 90.9% del conjunto | No bloquea: documentar explícitamente en `unit-test-instructions.md` que ese bloque queda fuera del piso de cobertura por ser un entrypoint de proceso, no lógica de negocio, para que `backend-api`/`mobile-app` no copien el patrón sin la misma justificación | New |
| R-02 | Minor | `packages/api-contract/openapi/openapi.yaml` (documento completo) | El documento no declara un bloque `tags:` de nivel superior con descripción por tag (Auth, VendorDirectory, etc.) — los tags se usan consistentemente en cada operación pero no están documentados como conjunto | No bloquea: agregar un bloque `tags:` con descripciones cuando se audite el contrato de cara a documentación pública (ej. Swagger UI); no afecta correctitud ni a `backend-api`/`mobile-app` | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `npm test --workspace=packages/api-contract` | PASS: 15/15 pruebas, 2 archivos | Cubre Step 7 (validez del contrato, incluidos los 2 fixtures inválidos deliberados) y Step 9 (generación de tipos, incluida compilación `tsc --noEmit`) |
| `npx vitest run --coverage` | PASS: 90.9% líneas / 90.9% statements / 100% funciones / 77.27% branches | Por encima del piso 80/80/80/70 definido en `vitest.config.ts` (heredado del Testing Contract, mvp) — ver R-01 para el único archivo bajo el promedio general |
| `npm run build --workspace=packages/api-contract` | PASS | `generate-types` + `tsc -p tsconfig.json` compilan sin error |
| `npm audit --omit=dev` | PASS: 0 vulnerabilidades | Las vulnerabilidades reportadas sin `--omit=dev` son todas de herramientas de desarrollo (cadena de `vitest`/`esbuild`), no de código distribuido |
| Verificación de `source-manifest.json` | PASS | Las 15 rutas reclamadas existen en el workspace; ninguna ruta de aplicación sin reclamar |

### Summary

El plan y el código generado son consistentes entre sí y con los artefactos de diseño previos (`entities.md`, `rules.md`, `contract-summary.md`, `security-design.md`): las 6 rutas de contrato están presentes con sus tags, cada regla de negocio de forma (BR2.1, BR2.2, BR3.1, BR9.1) está reflejada como restricción de schema y verificada por prueba dedicada, y las decisiones de NFR Requirements (workspace de monorepo, tipos generados sin registro externo) se implementaron tal cual. Los dos hallazgos son cosméticos/de documentación, no arquitectónicos — un desarrollador podría construir `backend-api`/`mobile-app` contra este contrato sin pedir aclaraciones al arquitecto.
