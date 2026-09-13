# Functional Design — api-contract — Questions

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

## Contexto

`api-contract` (U1) es una unidad `spec` — "incluye solo forma de datos y firmas de endpoints — nunca lógica de negocio" (`unit-of-work.md`). Contract Design (2.8) ya definió los 6 contratos OpenAPI completos. Esta etapa traduce esa forma de datos a un modelo de entidades y reglas de validación tecnología-agnósticas (sin código, sin SQL) que sirva de fuente de verdad de diseño para `backend-api` y `mobile-app` en las etapas siguientes.

## Q1. ¿El modelo de entidades de esta unidad debe reflejar exactamente las 7 entidades de `components.md`/`contract-summary.md` (User, Session, Vendor, CommissionTier, DailySale, CommissionPeriod, Notification), o conviene simplificarlo para el contrato (ej. omitir `Session` por ser un detalle interno de `AuthComponent` no expuesto en payloads)?

A. Reflejar las 7 entidades tal cual — incluida `Session`, porque aunque no se expone completa en los payloads, su existencia (creación/expiración) sí es parte del comportamiento observable del contrato (login devuelve un token que representa una sesión)
B. Omitir `Session` del modelo de esta unidad — solo modelar lo que efectivamente viaja en request/response bodies
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Reflejar las 7 entidades tal cual, incluida Session — su existencia es parte del comportamiento observable del contrato.

## Q2. Las reglas de negocio "reales" (ej. cálculo de comisión, detección de umbrales) viven en `backend-api`, no en `api-contract`. ¿Qué tipo de reglas corresponde documentar en `rules.md` de esta unidad?

A. Solo reglas de validación de forma/entrada (BR de categoría `validation`) — lo que un request inválido dispara como error de contrato (ej. presupuesto negativo, monto de venta vacío), más las reglas de autorización de quién puede llamar cada endpoint (categoría `authorization`). Las reglas de cálculo (comisión, umbrales) se documentan en `backend-api`, que es quien las implementa
B. Incluir también las reglas de cálculo aquí, duplicadas con lo que luego documentará `backend-api`
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Solo reglas de validación de forma/entrada y de autorización de quién puede llamar cada endpoint; las reglas de cálculo se documentan en backend-api.

## Q3. Esta unidad no tiene historias de usuario propias en `unit-of-work-story-map.md` (es un contenedor de contrato). ¿Con qué trazamos su `traceability.json`?

A. Contra los 5 Criterios de Aceptación que son puramente de forma de contrato (validación de payload, autorización, timeout/idempotencia) — AC2.2.2 (presupuesto negativo), AC3.2.x (corrección tras cierre), AC3.3.4 (fallo de red a mitad de guardado), y los criterios de autorización implícitos de FR1 (solo supervisor administra roster/tramos) — en vez de intentar trazar contra historias que no le pertenecen a esta unidad
B. Dejar `traceability.json` con `upstream_ids` vacío, ya que no tiene historias asignadas
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Contra los criterios de aceptación que son puramente de forma de contrato (validación de payload, autorización, timeout/idempotencia).

## Consolidated Summary Confirmation

- `entities.md` refleja las 7 entidades de `components.md`, incluida `Session`
- `rules.md` cubre solo reglas de validación de forma y autorización — no reglas de cálculo (esas van en `backend-api`)
- `traceability.json` traza contra los criterios de aceptación de forma de contrato, no contra historias de usuario (esta unidad no tiene historias propias)

Does this all look correct before I generate the functional design artifacts for api-contract?

- Looks correct
- Request changes

[Answer]: Looks correct
