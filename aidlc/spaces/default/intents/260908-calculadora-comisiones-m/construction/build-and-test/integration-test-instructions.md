# Build and Test — Integration Test Instructions

## Sources

- [upstream:code-generation-plan] `construction/api-contract/code-generation/code-generation-plan.md`
- [upstream:code-generation-plan] `construction/backend-api/code-generation/code-generation-plan.md`
- [upstream:code-generation-plan] `construction/mobile-app/code-generation/code-generation-plan.md`
- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

`Test Strategy: Standard` (`aidlc-state.md`) requiere pruebas de límite clave y de interacción entre unidades. Alcance de esta sección: los tres puntos de frontera reales entre unidades (`api-contract` ↔ `backend-api`, `backend-api` ↔ `mobile-app`), ya que no hay una cuarta unidad de infraestructura compartida.

## Frontera 1 — api-contract ↔ backend-api (tipos generados)

`packages/api-contract/__tests__/generate-types.test.ts` ya verifica, como parte de la suite de `api-contract`, que `src/types.ts` compila sin error de TypeScript. `backend-api` no importa directamente `@calculadora-comisiones/api-contract` en tiempo de ejecución (son contratos, no un paquete compartido en runtime) — la verificación de consistencia real es manual/de diseño, ya cerrada en la revisión de `functional-design` de `backend-api` (verificación cruzada `functional-spec.md` vs. `contract-summary.md`, PASS).

**Comando**: cubierto por `npm test --workspace=packages/api-contract` (ya ejecutado como parte de las pruebas unitarias de la unidad — no se duplica aquí).

## Frontera 2 — backend-api ↔ mobile-app (contrato de API real)

Esta es la frontera de integración más significativa: `mobile-app` llama a los 6 contratos reales de `backend-api` sobre HTTP. En este entorno no hay un backend desplegado ni una base de datos Neon real disponible (sin egress de red hacia servicios externos), por lo que una prueba de integración end-to-end real (levantar `backend-api` + Postgres real + hacer peticiones HTTP desde `mobile-app`) no es ejecutable en este sandbox.

**Mitigación ya presente en el código** (evidencia, no ejecutable aquí):
- `packages/mobile-app/src/shared/api/apiClient.ts` y sus pruebas (`apiClient.test.ts`) verifican el cliente HTTP de `mobile-app` contra respuestas mockeadas con la forma exacta de `contract-summary.md`.
- `packages/backend-api/__tests__/**` verifica cada endpoint contra su contrato (status codes, forma de payload) usando `supertest`/mocks de NestJS, sin una base de datos real (Prisma mockeado).
- La verificación cruzada manual `functional-spec.md` (mobile-app) vs. `contract-summary.md`, ya realizada en la revisión de `functional-design` de `mobile-app` (PASS), cubre que cada llamada de la app corresponde a un endpoint real con el método/códigos correctos.

**Comando**: no hay un comando de integración real ejecutable en este entorno. Diferido a la etapa `ci-pipeline`/entorno de staging real, donde `backend-api` se despliega contra una Neon real y `mobile-app` (o una suite de contrato tipo Pact) puede ejercer la frontera de verdad.

## Frontera 3 — Consistencia de tipos de contrato en tiempo de compilación

`mobile-app` no importa `src/types.ts` de `api-contract` directamente (cada unidad mantiene sus propios tipos locales, ver ADR de `functional-design`), así que no hay una prueba de compilación cruzada real que ejecutar aquí más allá de lo ya cubierto por Frontera 1.

## Resumen

Las 3 fronteras están cubiertas al nivel que este entorno permite: dos mediante las suites unitarias ya existentes (sin duplicar su ejecución aquí) y la tercera (integración HTTP real backend↔mobile) diferida explícitamente a un entorno con despliegue real, sin comando local ejecutable — ver `build-and-test-summary.md` § Target Verification Matrix para su seguimiento formal.
