# NFR Design — api-contract — Questions

## Sources

- [upstream:security-requirements] `construction/api-contract/nfr-requirements/security-requirements.md`
- [upstream:tech-stack-decisions] `construction/api-contract/nfr-requirements/tech-stack-decisions.md`
- [upstream:functional-spec] `construction/api-contract/functional-design/functional-spec.md`

## Q1. ¿Qué patrón de token respalda `Authorization: Bearer <token>`, dado que NFR3.3 exige que el logout/revocación manual invalide la sesión de inmediato (y `entities.md` ya modela `Session.revokedAt`)?

A. Token opaco (identificador aleatorio) con lookup server-side contra la tabla `Session` en cada petición — la revocación es instantánea porque `revokedAt` se consulta en tiempo real, sin esperar a que expire un JWT autocontenido
B. JWT autocontenido (stateless) firmado, sin lookup server-side — más rápido de validar pero la revocación inmediata requiere una lista de bloqueo adicional (contradice la simplicidad de "priorizar capas gratuitas")
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Token opaco con lookup server-side contra Session — revocación instantánea, consistente con Session.revokedAt.

## Q2. ¿Dónde se aplica el patrón de autorización por rol (NFR3.6/3.7) a nivel de diseño?

A. Un patrón de middleware/guard transversal (aplicado a nivel de framework, ej. un guard de NestJS) que resuelve rol desde la Session antes de que la petición llegue al handler del endpoint — un solo punto de verdad, no repetido endpoint por endpoint
B. Verificación de rol repetida manualmente al inicio de cada handler de endpoint
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Un patrón de middleware/guard transversal que resuelve el rol antes del handler — un solo punto de verdad.

## Consolidated Summary Confirmation

- Token opaco con lookup server-side contra `Session` (revocación instantánea)
- Autorización por rol vía patrón de middleware/guard transversal, no verificación repetida por endpoint

Does this all look correct before I generate the NFR design artifacts for api-contract?

- Looks correct
- Request changes

[Answer]: Looks correct
