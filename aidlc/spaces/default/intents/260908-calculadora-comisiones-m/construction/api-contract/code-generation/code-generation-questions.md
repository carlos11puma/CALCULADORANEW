# Code Generation — api-contract — Questions

## Sources

- [upstream:code-generation-plan] `construction/api-contract/code-generation/code-generation-plan.md`
- [upstream:unit-test-instructions] `construction/api-contract/code-generation/unit-test-instructions.md`

## Plan Approval

Resumen del plan (`code-generation-plan.md`, 12 pasos):

- Workspace `packages/api-contract/` dentro del monorepo, con `vitest` como test runner (comando `npm test --workspace=packages/api-contract`).
- Las capas de modelo de datos, repositorio y lógica de negocio están marcadas **N/A** — justificado: `api-contract` es una unidad `spec` sin persistencia ni cálculo propio.
- El trabajo real de esta unidad es el "API/endpoint" adaptado a spec: escribir `openapi.yaml` consolidando los 6 contratos de `contract-summary.md` (Auth, VendorDirectory, CommissionTier, SalesEntry, CommissionLedger, Notification), con pruebas de validez del documento (parseo, sin referencias rotas, reglas de negocio reflejadas en el schema).
- Generación de tipos TypeScript desde el YAML (`openapi-typescript`), con pruebas que verifican los tipos de las 7 entidades y de cada endpoint.
- Testing Contract embebido: metodología test-after, estrategia standard (5-8 pruebas por componente + integración en fronteras clave), piso de cobertura 80% con CI antes de merge (heredado de `mvp`).

Resumen de `unit-test-instructions.md`:

- Comando: `npm test --workspace=packages/api-contract`, aislado del resto del monorepo.
- Pruebas de validez del contrato (Step 7) y de generación de tipos (Step 9), con fixtures YAML inválidos solo para pruebas.
- Sin datos sensibles de vendedores/comisiones en esta unidad — es spec pura.
- Piso de cobertura 80%, CI antes de merge.

[Approval Fingerprint]: sha256:06027c07079919218fb644dac0cfbe4d8cf8c4b4331dacfda9f75af890dc1880

¿Apruebas este plan de Code Generation exacto para `api-contract` (el plan y las instrucciones de prueba de arriba, con el Testing Contract embebido) antes de que se genere el código?

- Approve Plan
- Request Changes

[Answer]: Approve Plan
