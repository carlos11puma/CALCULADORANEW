# Code Generation Plan — mobile-app

## Sources

- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`
- [upstream:frontend-components] `construction/mobile-app/functional-design/frontend-components.md`
- [upstream:rules] `construction/mobile-app/functional-design/rules.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:performance-design] `construction/mobile-app/nfr-design/performance-design.md`
- [upstream:security-design] `construction/mobile-app/nfr-design/security-design.md`
- [upstream:logical-components] `construction/mobile-app/nfr-design/logical-components.md`
- [upstream:infrastructure-specification] `construction/mobile-app/infrastructure-design/infrastructure-specification.md`
- [upstream:tech-stack-decisions] `construction/mobile-app/nfr-requirements/tech-stack-decisions.md`
- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`

## Adaptación del alcance a esta unidad

`mobile-app` es una unidad `ui` (React Native + Expo). No tiene "Data model / database behavior" ni "Repository / data access" en el sentido de un backend con base de datos propia — se adaptan así: "Data model" es el esquema local de `pending_sales` (`expo-sqlite`, un solo store local, no un modelo de dominio completo); "Repository / data access" son los wrappers de `shared/storage/` y el cliente Axios de `shared/api/` (`logical-components.md`); "API / endpoint" es el consumo de los 6 contratos de `api-contract` desde cada feature (no la exposición de endpoints propios); "Frontend behavior" son las 11 pantallas (V1-V6, A1-A5) de `frontend-components.md`.

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

- [x] **Step 1**: Estructura del proyecto — workspace `packages/mobile-app/` (Expo + TypeScript), `app.json`/`app.config.ts`, `eas.json` (perfiles development/preview/production), estructura `src/app`, `src/shared`, `src/features/*` por `logical-components.md`, dependencia de workspace a `packages/api-contract`
- [x] **Step 2**: Bootstrap del test runner — `jest` con `jest-expo` (preset estándar de Expo para pruebas unitarias sin simulador/dispositivo) + `@testing-library/react-native`; comando exacto: `npm test --workspace=packages/mobile-app` (registrar en `unit-test-instructions.md`)
- [x] **Step 3**: Data model local — esquema de la tabla `pending_sales` en `expo-sqlite` (`saleDate` PK, `amount`, `returns`, `createdAt`, `syncAttempts`, `vendorId` — agregado por el hallazgo R-01 de la revisión de Functional Design), migraciones/creación de tabla en `shared/storage/pendingSalesDb.ts`
- [x] **Step 4**: Pruebas de la Step 3 — pruebas del wrapper de `pendingSalesDb` (insertar, actualizar por `saleDate`+`vendorId`, listar pendientes, eliminar tras sincronización) contra una base SQLite en memoria (`expo-sqlite` soporta `:memory:` para pruebas)
- [x] **Step 5**: Repository / data access — `shared/api/apiClient.ts` (Axios + interceptores de `security-design.md`), `shared/storage/secureSession.ts` (wrapper de `expo-secure-store`), `shared/net/connectivity.ts` (wrapper de `netinfo`), un módulo `api.ts` por feature consumiendo los 6 contratos de `api-contract`
- [x] **Step 6**: Pruebas de la Step 5 — pruebas de los interceptores (adjunta token, dispara logout en 401 salvo `/auth/login*` y `/auth/logout`, cierra R-01 de `nfr-design`), del wrapper de `secureSession`, y de cada módulo `api.ts` con Axios mockeado
- [x] **Step 7**: Business logic — hooks de TanStack Query por feature (queries/mutaciones de `performance-design.md`), motor de sincronización de MW8 (dispara en reconexión vía `netinfo` y también al arrancar la app con conexión disponible — cierra R-03 de la revisión de `functional-design`), lógica de agrupación de notificaciones (V5) y de `returnRateTrend` (V2)
- [x] **Step 8**: Pruebas de la Step 7 — pruebas unitarias de cada hook (mock de `apiClient`), del motor de sincronización (casos: 0/1/N ventas pendientes, ítems `applied` vs. `rejected`, guarda contra sincronización duplicada en vuelo — cierra R-02 de la revisión de `functional-design`), de la agrupación de notificaciones y del cálculo de `returnRateTrend`
- [x] **Step 9**: API / endpoint (consumo) — verificación de que cada módulo `api.ts` de la Step 5 cubre los 6 contratos completos (todos los métodos usados por los 15 workflows de `functional-spec.md`), sin lógica de negocio propia más allá de la forma de la petición/respuesta
- [x] **Step 10**: Pruebas de la Step 9 — pruebas de integración por feature (`@testing-library/react-native` + mocks de MSW o Axios para simular respuestas HTTP) cubriendo camino feliz y al menos dos casos de error/borde por pantalla (mandato de `phases/construction.md` § Testing Standards)
- [x] **Step 11**: Frontend behavior — las 11 pantallas de `frontend-components.md` (V1-V6, A1-A5) con React Native Paper, navegación (`AuthStack`/`VendorTabs`/`AdminTabs`), componentes compartidos (`PrimaryButton`, `ValidatedTextInput`, `OfflineBanner`, `ErrorBanner`, `SkeletonCard`, `ConfirmDialog`, `SyncStatusIcon`)
- [x] **Step 12**: Pruebas de la Step 11 — pruebas de render de cada pantalla (estados default/loading/error/empty/offline según aplique por pantalla, de `functional-spec.md`), validación de formularios (botones deshabilitados según las 7 reglas de `rules.md`, BR1.6/BR1.7/BR2.4-BR2.6/BR3.6/BR9.3)
- [x] **Step 13**: Configuración de entorno/build — `app.json` con `usesCleartextTraffic=false` (Android) y sin excepciones ATS (iOS, cierra R-01 de `nfr-design`), variables de entorno (`API_BASE_URL`) vía `eas.json` por perfil, `.github/workflows/mobile-app-ci.yml` (`cicd-pipeline.md`)
- [x] **Step 14**: Documentación y trazabilidad — `README.md` del workspace (cómo correr localmente con Expo Dev Client, cómo correr pruebas, variables de entorno requeridas), `traceability.json` de esta etapa
  - `README.md` generado y verificado (comando de pruebas exacto, variables de entorno, estructura, CI/CD). `traceability.json` de esta etapa escrito por el orquestador (51 ids: 34 AC + 7 BR propios + 10 NFR), sensor `aidlc-sensor-traceability.ts` en verde. `code-summary.md` y `source-manifest.json` (105 archivos) también escritos por el orquestador.

## Trazabilidad historia → paso del plan

Las 17 historias de `unit-of-work-story-map.md` asignadas a `mobile-app` (US1.1-US9.1, con componente de UI) se implementan a través de los Steps 3-12: el store local y los wrappers de acceso (Steps 3-6) cubren la persistencia offline y la sesión; los hooks de negocio (Steps 7-8) cubren la orquestación de cada workflow (`MW1`-`MW15` de `functional-spec.md`); el consumo de API (Steps 9-10) cubre la integración con los 6 contratos; las pantallas (Steps 11-12) cubren la interacción visual de las 11 pantallas de `mockups.md`. El `traceability.json` de esta etapa (Step 14) enumera cada AC/BR/NFR contra el archivo de código o de prueba concreto que lo implementa.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T21:28:30Z
**Iteration:** 2
**Request Challenge:** review:705631f72f8966704549b96fb5f4db23

### Nota de esta iteración (2)

Reapertura administrativa del gate: el único cambio de contenido desde la iteración 1 fue mecánico — completar la columna Status (antes vacía) de la tabla de Findings con el valor de enum válido `New`, requerido por el validador de `aidlc-review-brief.ts`. No hay cambio de sustancia en ningún hallazgo, en el veredicto, ni en el resto del documento. El veredicto READY y los hallazgos de la iteración 1 se confirman sin cambios — ver la tabla debajo.

### Historial — iteración 1

Date: 2026-09-08T20:52:11Z (revisión original, contenido sin cambios de sustancia)

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | `src/features/sales-entry/SalesEntryScreen.tsx` | `isOffline` se fija una sola vez con `getCurrentConnectivity()` en el `useEffect` de montaje; a diferencia de `useAutoSync` (que sí se suscribe a transiciones vía `onReconnect`), esta pantalla no se suscribe a cambios de conectividad mientras está montada — si el vendedor pierde o recupera conexión con la pantalla abierta, `OfflineBanner` queda desactualizado hasta que la pantalla se remonte | No bloquea: la corrección real del guardado no depende del banner (el guardado offline funciona igual vía `pendingSalesDb`/`syncEngine` sin importar lo que muestre el banner) — es un gap puramente informativo de UX. Suscribir `isOffline` a `NetInfo.addEventListener` (o exponer un hook `useConnectivity()` reutilizable en `shared/net/connectivity.ts`) en un ciclo posterior | New |
| R-02 | Minor | `jest.config.js` | `forceExit: true` silencia cualquier handle nativo futuro que quede abierto por error genuino (no solo el ya documentado de TanStack Query/AppState), lo que podría enmascarar una fuga real introducida en código nuevo sin que la suite lo señale | No bloquea: la causa actual está documentada y verificada (todas las 187 pruebas terminan y aciertan en segundos); si se agregan pruebas nuevas, correr puntualmente con `--detectOpenHandles` (sin `forceExit`) para confirmar que no se introdujo una fuga distinta | New |
| R-03 | Minor | `frontend-components.md` § Accesibilidad (upstream) | El objetivo de touch targets ≥44×44pt (WCAG 2.1 AA) declarado en el diseño no tiene una prueba automatizada que lo verifique (las pruebas de render cubren estados/props, no dimensiones renderizadas) | No bloquea para el MVP: React Native Paper aplica tamaños mínimos por defecto en sus componentes (`Button`, `IconButton`), lo que cubre la mayoría de los casos: verificar manualmente en un dispositivo real antes del lanzamiento, o agregar una prueba de snapshot de estilos si el equipo lo prioriza | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `npm test --workspace=packages/mobile-app -- --coverage` (corrido de forma independiente por el orquestador, no autoreportado) | PASS: 43/43 test suites, 187/187 pruebas; cobertura 94.14%/87.36%/91.61%/95.66% (statements/branches/functions/lines) | Supera el piso 80%/70%/80%/80% del Testing Contract. Durante la primera verificación se encontraron y corrigieron 2 defectos reales (import dinámico roto en `apiClient.test.ts`; condición de carrera en la guarda R-02 de `syncEngine.ts` que colgaba una prueba) — ambos arreglados en el código de producción/pruebas, no relajando ningún umbral |
| `npx tsc --noEmit` (`packages/mobile-app/`) | PASS: 0 errores | TypeScript estricto sin errores de tipo |
| `bun .claude/tools/aidlc-sensor-traceability.ts --output-path .../code-generation/traceability.json --stage-slug code-generation` | PASS: `{"pass":true,"gaps":[],"orphans":[],"missing_from_upstream_ids":[],"invalid_entries":[],"invalid_targets":[],"findings_count":0}` | Los 51 ids (34 AC + 7 BR propios + 10 NFR) tienen `status: "OK"` con un archivo de código/prueba real existente como `target` |
| Verificación manual de cierre de hallazgos previos (R-01 a R-04 de `functional-design`, R-01 de `security-design`, R-01 de `cicd-pipeline`) | PASS (manual) | Cada hallazgo abierto en etapas anteriores tiene una decisión de diseño concreta y verificable en el código: clave `(vendorId, saleDate)` en `pendingSalesDb.ts`; guarda `inFlight` síncrona en `syncEngine.ts`; `useAutoSync` dispara también al montar con conexión; `returnRateTrend.ts` persiste en `AsyncStorage`; interceptor de `apiClient.ts` excluye `/auth/login*` y `/auth/logout`; `usesCleartextTraffic:false` en `app.config.ts`; lista literal de paths "nativos" en `.github/workflows/mobile-app-ci.yml` |

### Summary

La implementación de `mobile-app` está completa contra las 14 fases del plan aprobado, con los 51 ids de trazabilidad de esta etapa cubiertos por archivos de código o prueba reales y verificables, y los 8 hallazgos abiertos en las etapas de diseño anteriores genuinamente cerrados en el código (no solo mencionados en comentarios). La verificación independiente del orquestador — no el autoreporte del agente que escribió el código — encontró y corrigió dos defectos reales antes de aceptar el trabajo (un `await import()` dinámico roto y una condición de carrera real en la guarda anti-duplicado de sincronización), lo que da confianza adicional en que la suite de 187 pruebas certifica comportamiento real, no solo aserciones triviales. Los tres hallazgos nuevos de esta revisión son endurecimientos razonables de detalle (indicador de conectividad no reactivo en una pantalla, un `forceExit` que podría enmascarar una fuga futura, verificación manual pendiente de touch targets) — ninguno bloquea, y los tres quedan documentados como trabajo explícito de un ciclo posterior o de QA manual antes del lanzamiento.
