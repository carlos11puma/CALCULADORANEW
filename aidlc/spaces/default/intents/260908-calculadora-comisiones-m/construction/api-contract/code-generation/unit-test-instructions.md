# Unit Test Instructions — api-contract

## Sources

- [upstream:code-generation-plan] `construction/api-contract/code-generation/code-generation-plan.md`
- [upstream:testing-contract] Testing Contract embebido en `code-generation-plan.md` (`contract_sha256: sha256:5f121b6dc678fe841aa3d00eeb5d16353b0db084dc2be228754e5e309d26bba9`)

## Runner

- Framework: `vitest`.
- Comando exacto, con alcance limitado a esta unidad: `npm test --workspace=packages/api-contract`.
- Bootstrap (Step 2 del plan): `vitest.config.ts` mínimo dentro de `packages/api-contract/`, sin dependencias de otros workspaces del monorepo — corre aislado.
- El runner debe quedar listo (`runner_ready_before_first_test: true`) antes de escribir la primera prueba real.

## Capas aplicables en esta unidad

Por ser `api-contract` una unidad `spec` (ver "Adaptación del alcance" en `code-generation-plan.md`), solo dos de las cinco capas estándar del Testing Contract aplican:

| Capa estándar | Aplica aquí | Detalle |
|---|---|---|
| Data model / database behavior | No | sin persistencia en esta unidad |
| Repository / data access | No | sin persistencia en esta unidad |
| Business logic | No | `rules.md` de esta unidad es solo forma/validación, sin cálculo |
| API / endpoint | Sí (adaptada) | validez del documento `openapi.yaml` (Step 7 del plan) |
| Frontend behavior | No | sin UI en esta unidad |

## Pruebas — validez del contrato (Step 7)

- **Parseo válido**: `openapi.yaml` carga sin error con un parser OpenAPI 3.0.3 (ej. `@readme/openapi-parser` o equivalente ya presente en el monorepo).
- **Sin referencias rotas**: todo `$ref` dentro del documento resuelve a un `components.schemas.*` existente — ninguna referencia colgante.
- **Cobertura de las 6 rutas de contrato**: el documento declara los paths de los 6 contratos de `contract-summary.md` (Auth, VendorDirectory, CommissionTier, SalesEntry, CommissionLedger, Notification), con al menos un método HTTP cada uno.
- **Reglas de negocio reflejadas en el schema**: para cada regla en `functional-design/rules.md` que tenga forma de contrato (BR2.2 campos completos de tramo, BR3.1 monto no-negativo, BR9.1 mensaje/destinatarios de notificación manual), el schema correspondiente declara esa restricción (`required`, `minimum`, tipo) — no basta con que el endpoint exista, la restricción debe estar en el schema.
- Fixtures: 2-3 documentos YAML de ejemplo con violaciones deliberadas (referencia rota, campo requerido faltante) usados solo en las pruebas, para verificar que el validador efectivamente los rechaza — no se commitean como parte del build de producción del workspace.

## Pruebas — generación de tipos (Step 9)

- Ejecutar el script de generación (`generate-types.ts`) sobre `openapi.yaml` y verificar que `types.ts` resultante:
  - Declara un tipo para cada una de las 7 entidades (`User`, `Session`, `Vendor`, `CommissionTier`, `DailySale`, `CommissionPeriod`, `Notification`).
  - Declara un tipo de request/response para cada endpoint del documento.
  - Compila sin error (`tsc --noEmit` sobre el archivo generado) — la prueba de "tipos correctos" es que el compilador de TypeScript los acepte, no una comparación textual frágil contra un snapshot.

## Gestión de datos de prueba

- Los fixtures YAML de contrato inválido (para Step 7) viven en `packages/api-contract/__fixtures__/`, fuera del árbol que se publica en `dist/`.
- No hay datos de prueba con información real de vendedores/comisiones en esta unidad — es spec pura, sin datos sensibles que enmascarar (el mandato de `project.md` sobre proteger datos de comisión aplica a `backend-api`/`mobile-app`, no aquí).

## Piso de cobertura

- 80% de líneas, heredado del Testing Contract (`scope_floor`), medido sobre el código propio del workspace (`openapi.yaml` en sí no cuenta como "línea de código" a cubrir — el piso aplica a los scripts de validación y generación de tipos).
- CI corre `npm test --workspace=packages/api-contract` antes de cualquier merge a `main`, junto con el resto de workspaces del monorepo (decisión de NFR Requirements: distribución como workspace de monorepo).
