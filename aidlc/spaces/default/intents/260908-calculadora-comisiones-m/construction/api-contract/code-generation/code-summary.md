# Code Generation — api-contract — Resumen de código

## Sources

- [upstream:code-generation-plan] `construction/api-contract/code-generation/code-generation-plan.md`
- [upstream:unit-test-instructions] `construction/api-contract/code-generation/unit-test-instructions.md`

## Archivos creados

Scaffold de monorepo (primera unidad en generar código — walking skeleton):

- `package.json` — raíz del monorepo, `workspaces: ["packages/*"]`
- `package-lock.json`
- `.gitignore` — se agregó `coverage` a las carpetas ignoradas

Workspace `packages/api-contract/`:

- `package.json`, `tsconfig.json`, `vitest.config.ts`
- `openapi/openapi.yaml` — documento OpenAPI 3.0.3 consolidado, los 6 contratos de `contract-summary.md` (Auth, VendorDirectory, CommissionTier, SalesEntry, CommissionLedger, Notification) como un único documento con `components.schemas` compartidos
- `scripts/validate-contract.ts` — validador del documento (parseo, referencias `$ref`, cobertura de las 6 rutas, reglas de negocio de forma reflejadas en el schema)
- `scripts/generate-types.ts` — genera `src/types.ts` desde `openapi.yaml` vía `openapi-typescript`
- `src/types.ts` — tipos TypeScript generados (regenerar con `npm run generate-types --workspace=packages/api-contract`; nunca editar a mano)
- `__tests__/validate-contract.test.ts` (11 pruebas) — Step 7 del plan
- `__tests__/generate-types.test.ts` (4 pruebas) — Step 9 del plan
- `__fixtures__/broken-ref.yaml`, `__fixtures__/missing-required-field.yaml` — fixtures inválidos deliberados, solo para pruebas
- `README.md`

## Decisiones clave de implementación

- **Validador propio en vez de una librería externa de validación OpenAPI**: se implementó `validate-contract.ts` con la librería `yaml` (parseo) más chequeos propios de referencias y de forma de reglas de negocio, en vez de una librería de validación de esquema OpenAPI de terceros — más simple, sin dependencia pesada adicional, y permite expresar directamente los chequeos de BR2.1/BR2.2/BR3.1/BR9.1 que son específicos de este dominio (una librería genérica de validación OpenAPI no conoce estas reglas de negocio).
- **`openapi-typescript` para la generación de tipos** — decisión ya tomada en NFR Requirements (Q3), implementada tal cual: `scripts/generate-types.ts` invoca la API programática de `openapi-typescript` y escribe `src/types.ts`.
- **`tsx` como runner de scripts TypeScript** — usado para ejecutar `generate-types.ts` sin paso de compilación previo, consistente con el resto del monorepo (Node 22, ESM).

## Resumen de cobertura de pruebas

15 pruebas, 2 archivos, todas en verde:

```
npm test --workspace=packages/api-contract
```

Cobertura (v8): 90.9% líneas, 90.9% statements, 100% funciones, 77.27% branches — por encima del piso de 80%/80%/80%/70% definido en `vitest.config.ts` (heredado del Testing Contract, mvp).

`npm run build --workspace=packages/api-contract` (genera tipos + `tsc -p tsconfig.json`) compila sin error.

`npm audit --omit=dev` reporta 0 vulnerabilidades en dependencias de producción; las vulnerabilidades reportadas por `npm audit` sin ese flag son todas de herramientas de desarrollo (cadena de dependencias de `vitest`/`esbuild`), no de código que se distribuye — no bloquean esta unidad.

## Desviaciones del plan

Ninguna. Los 12 pasos del plan se ejecutaron en el orden aprobado; los pasos marcados N/A (data model, repository, business logic, frontend) se omitieron tal como estaba justificado en `code-generation-plan.md`.
