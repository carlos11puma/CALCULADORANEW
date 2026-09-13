# Code Generation Plan — backend-api

## Sources

- [upstream:functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:rules] `construction/backend-api/functional-design/rules.md`
- [upstream:entities] `construction/backend-api/functional-design/entities.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:performance-design] `construction/backend-api/nfr-design/performance-design.md`
- [upstream:security-design] `construction/backend-api/nfr-design/security-design.md`
- [upstream:scalability-design] `construction/backend-api/nfr-design/scalability-design.md`
- [upstream:reliability-design] `construction/backend-api/nfr-design/reliability-design.md`
- [upstream:observability-design] `construction/backend-api/nfr-design/observability-design.md`
- [upstream:logical-components] `construction/backend-api/nfr-design/logical-components.md`
- [upstream:infrastructure-specification] `construction/backend-api/infrastructure-design/infrastructure-specification.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`
- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`

## Adaptación del alcance a esta unidad

`backend-api` es una unidad `service` (NestJS + Prisma + PostgreSQL/Neon) — todas las capas del perfil estándar de pruebas aplican salvo "Frontend behavior" (esta unidad no tiene UI; eso es `mobile-app`). Consume `packages/api-contract` como dependencia de workspace (tipos generados del OpenAPI) — ya construido y disponible en el monorepo.

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

- [x] **Step 1**: Estructura del proyecto — workspace `packages/backend-api/` en el monorepo (`package.json`, `tsconfig.json`, `nest-cli.json`, estructura de carpetas `src/` con un módulo por componente de dominio — `logical-components.md`), dependencia de workspace a `packages/api-contract` para los tipos generados
- [x] **Step 2**: Bootstrap del test runner — `vitest` (consistente con `api-contract`) configurado para NestJS (o `@nestjs/testing` + `vitest`); comando exacto: `npm test --workspace=packages/backend-api` (registrar en `unit-test-instructions.md`)
- [x] **Step 3**: Data model / database behavior — esquema Prisma (`schema.prisma`) con las 7 entidades de `entities.md` (`User`, `Session`, `Vendor`, `CommissionTier`, `DailySale`, `CommissionPeriod`, `Notification`), incluyendo la restricción `UNIQUE(vendorId, saleDate)` en `DailySale` (NFR4.2) y los índices de `index_hints`; migración inicial de Prisma
- [x] **Step 4**: Pruebas de la Step 3 — pruebas de esquema (constraints únicos, tipos) contra una base de datos de prueba (Neon efímera o Postgres local vía Docker/testcontainer, según disponibilidad del entorno de ejecución) — traceability: NFR4.2, BR3.3 (heredado de `api-contract`)
- [x] **Step 5**: Repository / data access — capa de repositorio por componente (`PrismaModule` global + un repositorio/servicio de datos por módulo: `AuthModule`, `VendorDirectoryModule`, `CommissionTierModule`, `SalesEntryModule`, `CommissionLedgerModule`, `NotificationModule`), conexión pooled de Neon (NFR6.1)
- [x] **Step 6**: Pruebas de la Step 5 — pruebas de repositorio con mocks de `PrismaClient` (unitarias) para cada módulo
- [x] **Step 7**: Business logic — implementación de las 16 reglas de `rules.md` (BR1.4/BR1.5 sesión sin expiración, BR3.4/BR3.5 sincronización, BR4.1-BR4.5 cálculo de comisión y cierre, BR6.1 historial, BR7.1/BR7.2 umbral de venta, BR8.1-BR8.3 indicador de devolución, BR9.2 notificación manual) como servicios de dominio, más el hash `bcrypt` (NFR3.9), el guard de sesión con `include` Session→User (NFR3.10/NFR3.11, cierra R-02), el `LoginThrottlerGuard` (cierra R-01), y el job de cierre mensual (`@nestjs/schedule`, BR4.5, NFR6.3)
- [x] **Step 8**: Pruebas de la Step 7 — pruebas unitarias de cada regla de negocio, incluyendo casos límite (BR8.1 división por cero, BR4.2 tramos fuera de orden, BR7.2/BR8.2 no-duplicación de notificación, BR3.4 período cerrado)
- [x] **Step 9**: API/endpoint — 13 workflows de `functional-spec.md` (W1-W13) como controllers NestJS, con DTOs de `class-validator`/`class-transformer` y `ValidationPipe` global (BR2.1/BR3.1 de `api-contract`), usando los tipos de `packages/api-contract` para las formas de request/response
- [x] **Step 10**: Pruebas de la Step 9 — pruebas de integración de cada endpoint (`@nestjs/testing` + supertest o equivalente) cubriendo camino feliz y al menos dos casos de error/borde por endpoint (mandato de `phases/construction.md` § Testing Standards)
- [x] **Step 11**: Frontend behavior — **N/A**: `backend-api` no tiene UI (`mobile-app` la implementa)
- [x] **Step 12**: Configuración de entorno/build — `@nestjs/config` con validación de esquema fail-fast (NFR3.12), `.env.example` documentando las variables requeridas (sin valores reales — nunca commitear secretos, `project.md` § Forbidden), script `build` del workspace, `Dockerfile`/configuración de arranque compatible con Render (`infrastructure-specification.md`), endpoint `GET /health` (`@nestjs/terminus`, NFR6.2)
- [x] **Step 13**: Documentación y trazabilidad — `README.md` del workspace (cómo correr localmente, cómo correr migraciones, variables de entorno requeridas), `render.yaml` (Q3 de `infrastructure-design-questions.md`), workflow de GitHub Actions (`cicd-pipeline.md`)

## Trazabilidad historia → paso del plan

Las 21 historias de `unit-of-work-story-map.md` asignadas a `backend-api` (US1.1-US9.1) se implementan a través de los Steps 3-10: el modelo de datos (Step 3) y la lógica de negocio (Steps 7-8) cubren el "qué" de cada regla citada en `traceability.json` de Functional Design (`BRx.y`); los endpoints (Steps 9-10) cubren el "cómo se expone" cada workflow (`W1`-`W13` de `functional-spec.md`, cada uno mapeado 1:1 a un endpoint del contrato de `api-contract`). El `traceability.json` de esta etapa (Step 13) enumera cada AC/NFR/BR contra el archivo de código o de prueba concreto que lo implementa.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T21:28:15Z
**Iteration:** 2
**Request Challenge:** review:58b0988a19117482328223853b5103ad

### Nota de esta iteración (2)

Reapertura administrativa del gate: la columna Status (antes vacía) de la tabla de Findings se completó con valores de enum válidos requeridos por el validador de `aidlc-review-brief.ts` — R-02 y R-03 con `New` (sin cambio de sustancia), y R-01 con `Unresolved` en lugar de una nota descriptiva libre, reflejando con precisión que la acción pendiente (`npx prisma generate` con acceso de red real antes de cualquier build de producción) sigue genuinamente abierta, tal como ya documentaba el propio hallazgo. Ningún hallazgo, ninguna acción requerida ni el veredicto cambian de sustancia. El veredicto READY y los hallazgos R-01 a R-03 de la iteración 1 se confirman — ver la tabla debajo.

### Historial — iteración 1

Date: 2026-09-08T16:45:06Z (revisión original, contenido sin cambios de sustancia salvo la columna Status ya descrita)

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | `node_modules/.prisma/client/*` (stub escrito a mano) | El cliente Prisma real no se pudo generar (`binaries.prisma.sh` bloqueado por la política de red del entorno sandbox, 403 Forbidden) — se escribió a mano un stub que imita la forma de `schema.prisma`. Este stub nunca fue validado contra el generador real de Prisma; cualquier divergencia sutil entre el stub y lo que `prisma generate` produciría (tipos de enums, formas de relación, nombres de campos generados) pasaría inadvertida hasta el primer entorno con red real | Bloquea el despliegue, no la finalización de esta etapa: ejecutar `npx prisma generate` con acceso de red real (CI, o el próximo entorno de Build and Test con egress habilitado) ANTES de cualquier build de producción o de fusionar a `main`; documentado ya en `code-summary.md` § Desviaciones punto 1, y ya verificado independientemente por el orquestador (reproducción del mismo 403, y build exitoso de `nest build` evitando el prestep bloqueado) — se registra aquí como hallazgo formal para que quede en el registro de revisión, no solo en el resumen | Unresolved |
| R-02 | Minor | `packages/backend-api/src/common/guards/login-throttler.guard.ts` | Cobertura de branch de este archivo es 35.71%, notablemente por debajo del promedio global de la suite (84.64% branches) — el guard que cierra R-01 de `nfr-design/security-design.md` (rate-limiting de login/PIN) tiene sus rutas de backoff exponencial y de reseteo de contador insuficientemente ejercitadas por las pruebas actuales, aunque el piso global de cobertura del Testing Contract (70% branches) sigue superado en el agregado | No bloquea: agregar en Build and Test casos de prueba específicos para las ramas no cubiertas de `login-throttler.guard.ts` (reseteo de contador tras la ventana de tiempo, escalamiento del backoff en intentos sucesivos) — mismo patrón que el hallazgo R-01 de la revisión de `api-contract`'s `generate-types.ts` en una etapa anterior | New |
| R-03 | Minor | Pruebas de Step 3-6 (`packages/backend-api/__tests__/**`) | Las pruebas de esquema/repositorio se ejecutan enteramente con `PrismaClient` mockeado, nunca contra una base de datos Postgres real — desviación prevista por `unit-test-instructions.md` § Base de datos de prueba ("si Docker no está disponible"), pero significa que el constraint `UNIQUE(vendorId, saleDate)` (NFR4.2) nunca fue verificado contra un motor Postgres real, solo contra el comportamiento simulado del mock | No bloquea para esta etapa: correr la suite de integración contra una base Neon/Postgres real (rama `staging`) en el pipeline de CI de `cicd-pipeline.md` — que sí tiene la red necesaria — antes del primer despliegue; ya documentado en `code-summary.md` § Desviaciones punto 3 | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `bun .claude/tools/aidlc-sensor-traceability.ts --output-path .../code-generation/traceability.json --stage-slug code-generation` | PASS: `{"pass":true,"gaps":[],"orphans":[],"missing_from_upstream_ids":[],"invalid_entries":[],"invalid_targets":[],"findings_count":0}` | Los 99 ids requeridos (38 AC + 23 BR + 23 NFR + 13 W + 2 R) están cubiertos, cada entrada `OK` apunta a un archivo de código/prueba existente en el workspace |
| `npm test --workspace=packages/backend-api` (reproducido independientemente por el orquestador) | PASS: 134/134 pruebas | Confirma el reporte del subagente, no solo lo asume |
| `npx vitest run --coverage` (desde `packages/backend-api/`, reproducido independientemente) | PASS: líneas 91.87%, branches 84.64%, funciones 90.84% | Todas por encima del piso 80%/70%/80% del Testing Contract; ver R-02 para el punto débil localizado |
| `npm run build --workspace=packages/backend-api` (reproducido independientemente) | FALLA en el prestep `prisma generate` — `403 Forbidden` en `binaries.prisma.sh` | Confirma que es una limitación real del entorno sandbox, no una fabricación del subagente — ver R-01 |
| `npx nest build` directo (evitando el prestep bloqueado, reproducido independientemente) | PASS: exit 0, `dist/` generado | La compilación de NestJS en sí es sólida; el fallo de build está aislado al paso de generación de Prisma (R-01), no a la lógica de la aplicación |

### Summary

El código de `backend-api` implementa las 21 historias asignadas con trazabilidad completa (99/99 ids requeridos cubiertos), 134 pruebas pasando y cobertura por encima del piso del Testing Contract en las tres dimensiones medidas. El hallazgo R-01 (stub de cliente Prisma escrito a mano por bloqueo de red del sandbox) es real y no trivial — ya está documentado explícitamente en `code-summary.md` y verificado independientemente por el orquestador, pero se formaliza aquí como hallazgo de revisión porque bloquea el despliegue (no esta etapa) hasta que se regenere el cliente real con `npx prisma generate`. R-02 y R-03 son endurecimientos razonables de cobertura para Build and Test, no defectos de diseño ni de implementación. Ningún hallazgo bloquea el avance de Code Generation — verdict READY.
