# Contract Design — Questions

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:unit-of-work-dependency] `inception/units-generation/unit-of-work-dependency.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`

## Contexto

El DAG de `unit-of-work-dependency.md` define un único borde real de contrato: **api-contract (U1) es consumido por backend-api (U2) y mobile-app (U3)**. No hay borde entre U2 y U3 directamente — ambos hablan solo a través de U1. No hay, hasta ahora, ninguna mención de un consumidor externo a este sistema (partner, API pública) en requirements.md ni en components.md; el servicio de push (Expo Push/FCM/APNs) es un external_dependency de NotificationComponent, no un consumidor de nuestra API.

## Q1. ¿Existe algún consumidor externo al sistema (partner, integración de terceros, API pública) además de mobile-app?

A. No — el único consumidor de la API de backend-api es mobile-app (U3); no hay borde externo que contractar en este MVP
B. Sí, hay un consumidor externo (especificar cuál y qué necesita)
C. No estoy seguro
X. Other (please specify)

[Answer]: A. No — el único consumidor de la API de backend-api es mobile-app (U3); no hay borde externo que contractar en este MVP.

## Q2. ¿Qué mecanismo de integración usa el único borde real (api-contract ↔ backend-api ↔ mobile-app)?

A. REST/HTTP síncrono con especificación OpenAPI — natural para NestJS (puede generar el spec automáticamente) y para consumo desde React Native vía fetch/axios
B. GraphQL — un solo endpoint flexible, mayor curva de aprendizaje para el equipo
C. tRPC / tipos TypeScript compartidos sin spec HTTP formal — más acoplado al monorepo, sin documentación independiente
D. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. REST/HTTP síncrono con especificación OpenAPI.

## Q3. ¿En qué formato vive el contenido del contrato dentro de la unidad api-contract (U1)?

A. Especificación OpenAPI (YAML) como fuente de verdad, más un paquete de tipos TypeScript generado a partir de ella (para que mobile-app tenga autocompletado/tipado)
B. Solo un paquete de tipos TypeScript compartido (sin YAML OpenAPI separado); backend-api expone su propio Swagger generado en runtime
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Especificación OpenAPI (YAML) como fuente de verdad, más tipos TypeScript generados a partir de ella.

## Q4. ¿Qué política de versionado y cambios rotos aplica al contrato?

A. Versionado por prefijo de ruta (`/api/v1/...`); un cambio incompatible (romper forma de un campo existente, eliminar un endpoint) requiere una nueva versión de ruta; los consumidores ignoran campos nuevos no reconocidos (aditivo = seguro sin nueva versión)
B. Versionado semántico del paquete de contrato (sin prefijo de ruta); mobile-app fija la versión del paquete que consume
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Versionado por prefijo de ruta (`/api/v1/...`); cambios aditivos sin nueva versión, cambios rotos requieren nueva versión.

## Q5. ¿Qué comportamiento de error/timeout/reintento debe cubrir el contrato, dado el modo offline de SalesEntryComponent (FR3.4, AC3.3.4)?

A. Errores en formato uniforme (código, mensaje, detalles de validación) en todos los endpoints; timeout estándar corto (ej. 10s) para que mobile-app decise rápido si debe caer a modo offline; los endpoints de sincronización de ventas son idempotentes por fecha+vendedor (reintentar un envío ya aplicado no duplica la venta), consistente con la sincronización "por fecha, sin merge" decidida en Domain Design (ADR-004)
B. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Errores en formato uniforme, timeout corto (10s), y endpoints de sincronización de ventas idempotentes por fecha+vendedor.

## Consolidated Summary Confirmation

- Un solo borde de contrato real: api-contract (U1), consumido por backend-api (U2) y mobile-app (U3); sin consumidor externo al sistema
- Mecanismo: REST/HTTP síncrono con especificación OpenAPI (YAML) como fuente de verdad + tipos TypeScript generados
- Versionado: prefijo de ruta `/api/v1/...`; aditivo sin romper, incompatible requiere nueva versión
- Errores/timeout/reintento: formato uniforme de error, timeout de 10s, sincronización de ventas idempotente por fecha+vendedor

Does this all look correct before I generate the contract summary?

- Looks correct
- Request changes

[Answer]: Looks correct
