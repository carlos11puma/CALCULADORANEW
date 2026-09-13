# @calculadora-comisiones/api-contract

Contrato OpenAPI de Calculadora de Comisiones (unidad `api-contract`, `spec`) y
los tipos TypeScript generados a partir de él. Fuente única de verdad de la
forma de la API — `backend-api` la implementa, `mobile-app` la consume vía
fetch/axios tipado. Ningún tipo se escribe a mano: siempre se regenera desde
`openapi/openapi.yaml`.

Ver `aidlc/spaces/default/intents/260908-calculadora-comisiones-m/inception/contract-design/contract-summary.md`
para las convenciones transversales (versionado, autenticación, formato de
error, timeout, idempotencia) y el detalle de cada uno de los 6 contratos.

## Regenerar tipos tras un cambio al YAML

1. Editar `openapi/openapi.yaml` (nunca editar `src/types.ts` a mano — es
   generado y se sobrescribe).
2. `npm run generate-types --workspace=packages/api-contract`
3. `npm test --workspace=packages/api-contract` — corre las pruebas de
   validez del contrato (Step 7) y de la generación de tipos (Step 9).
4. `npm run build --workspace=packages/api-contract` — compila `src/types.ts`
   a `dist/` para que `backend-api` y `mobile-app` lo consuman como
   dependencia de workspace.

## Versionado

- Un cambio **aditivo** (campo de respuesta nuevo opcional, endpoint nuevo) no
  requiere nueva versión de ruta — los consumidores deben ignorar campos que
  no reconocen.
- Un cambio **roto** (romper la forma de un campo existente, eliminar un
  endpoint, cambiar un tipo, o agregar un campo **requerido** a una petición)
  requiere `/api/v2/...` conviviendo con `/api/v1/...` hasta que `mobile-app`
  migre. Ver "Contract Ownership Rules" en `contract-summary.md`.

## Qué NO vive en este paquete

- Lógica de negocio (cálculo de comisión, detección de umbrales) — eso es
  `backend-api`.
- Persistencia — este paquete no tiene modelo de base de datos propio; las
  entidades de `entities.md` son forma de contrato, no un esquema de base de
  datos.
- Secretos o configuración de entorno — no hay ninguno en esta unidad
  (mandato de `project.md`: nunca commitear secretos).

## Pruebas

Runner: `vitest`, aislado del resto del monorepo.

```
npm test --workspace=packages/api-contract
```

Ver `../../aidlc/spaces/default/intents/260908-calculadora-comisiones-m/construction/api-contract/code-generation/unit-test-instructions.md`
para el detalle de cobertura y gestión de datos de prueba.
