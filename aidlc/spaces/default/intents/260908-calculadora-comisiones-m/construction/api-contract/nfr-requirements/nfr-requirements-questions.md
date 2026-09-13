# NFR Requirements — api-contract — Questions

## Sources

- [upstream:functional-spec] `construction/api-contract/functional-design/functional-spec.md`
- [upstream:rules] `construction/api-contract/functional-design/rules.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

## Contexto

`api-contract` (U1, kind `spec`) no es un servicio desplegable, así que de las 5 categorías de NFR solo dos aplican a esta unidad: **Seguridad** (lo que el contrato exige de cualquier implementación: TLS, forma del token, protección de datos sensibles) y **decisiones de stack tecnológico** propias de esta unidad (cómo se autora y distribuye el contrato). Performance/escalabilidad/confiabilidad/observabilidad son atributos de un servicio desplegado — se documentan en `backend-api`, no aquí.

## Q1. ¿Qué exige el contrato en materia de transporte y protección de datos en tránsito?

A. TLS obligatorio en todo momento (HTTPS únicamente, sin fallback a HTTP) — dado que el contrato transporta datos de comisión/salario (dato sensible, mandato de `project.md`: "proteger los datos de comisión/salario con control de acceso por rol... y credenciales cifradas")
B. TLS recomendado pero no obligatorio a nivel de contrato
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. TLS obligatorio en todo momento (HTTPS únicamente) — dado que el contrato transporta datos de comisión/salario, dato sensible según el mandato de project.md.

## Q2. ¿Cuánto debe durar el token de sesión de vendedor antes de requerir un nuevo login, dado que FR1.4 pide sesión de "larga duración" con cierre explícito?

A. Sin expiración por tiempo — el token de vendedor es válido hasta logout explícito o revocación manual por el supervisor (lo que FR1.4 describe literalmente como "larga duración... cierre de sesión manual explícito")
B. Expira a los 30 días de inactividad, renovable con uso
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Sin expiración por tiempo — válido hasta logout explícito o revocación manual, tal como describe FR1.4.

## Q3. ¿Cómo se autora y distribuye el contenido de `api-contract` entre `backend-api` y `mobile-app` (decisión técnica, no solo de proceso — ya se acordó "OpenAPI + tipos generados" en Contract Design, Q3)?

A. Monorepo con un paquete/workspace `api-contract` que contiene el YAML OpenAPI y los tipos TypeScript generados a partir de él (ej. con `openapi-typescript`); `backend-api` y `mobile-app` lo importan como dependencia de workspace — sin publicar a un registro npm externo, consistente con "priorizar capas gratuitas" (mandato de project.md)
B. Paquete npm publicado en un registro privado
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Monorepo con un paquete/workspace api-contract (YAML OpenAPI + tipos TypeScript generados), importado como dependencia de workspace sin registro externo.

## Consolidated Summary Confirmation

- TLS obligatorio en todo momento para el contrato (HTTPS únicamente)
- Token de sesión de vendedor sin expiración por tiempo — válido hasta logout explícito o revocación manual (FR1.4)
- `api-contract` se distribuye como workspace de monorepo (OpenAPI YAML + tipos TS generados), sin registro npm externo

Does this all look correct before I generate the NFR artifacts for api-contract?

- Looks correct
- Request changes

[Answer]: Looks correct
