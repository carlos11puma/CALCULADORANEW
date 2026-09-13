# Units Generation — Questions

## Sources

- [upstream:components] `inception/domain-design/components.md`
- [upstream:decisions] `inception/domain-design/decisions.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:stories] `inception/user-stories/stories.md`

## Propuesta de unidades (para discutir en las preguntas siguientes)

1. **backend-api** (service) — monolito NestJS que embebe los 6 componentes de dominio (Auth, VendorDirectory, CommissionTier, SalesEntry, CommissionLedger, Notification) como módulos, con PostgreSQL/Neon y el job programado de cierre de período.
2. **mobile-app** (ui) — app React Native con las pantallas de Vendedor y Supervisor de refined-mockups.
3. **api-contract** (spec) — contrato compartido (tipos/schema de la API) entre backend-api y mobile-app, para permitir desarrollo en paralelo desde un contrato acordado.

## Q1. ¿El backend debe ser un solo servicio desplegable (monolito con los 6 componentes como módulos internos) o servicios separados por componente?

A. Un solo servicio (monolito modular) — más simple de operar y desplegar con presupuesto mínimo/gratuito, consistente con "priorizar capas gratuitas de infraestructura"
B. Servicios separados por componente (microservicios) — más aislamiento pero mayor complejidad operativa
C. No estoy seguro
X. Other (please specify)

[Answer]: A. Un solo servicio (monolito modular) — más simple de operar y desplegar con presupuesto mínimo/gratuito.

## Q2. ¿Conviene una unidad de "contrato de API" (api-contract) separada, para que backend y mobile-app se desarrollen en paralelo desde un contrato acordado, o el contrato se define directamente dentro del backend sin unidad propia?

A. Sí, unidad de contrato separada — reduce fricción de integración y habilita paralelismo real
B. No, el contrato vive dentro de backend-api (OpenAPI generado por NestJS) y mobile-app lo consume directamente sin una unidad separada
C. No estoy seguro
X. Other (please specify)

[Answer]: A. Sí, unidad de contrato separada (api-contract) — reduce fricción de integración y habilita paralelismo real entre backend-api y mobile-app.

## Q3. ¿Qué modelo de despliegue prevés para el MVP?

A. Backend en un solo ambiente de despliegue automático (deploy-on-merge a pruebas, aprobación manual a producción — heredado de team.md) y la app móvil distribuida vía Expo/EAS (build interno, no tiendas públicas todavía)
B. Backend igual que A, pero la app móvil sí publicada en Google Play / App Store desde el MVP
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Backend con despliegue automático heredado de team.md; app móvil vía Expo/EAS interno, sin tiendas públicas todavía.

## Consolidated Summary Confirmation

- 3 unidades: api-contract (spec), backend-api (service, monolito modular con los 6 componentes de dominio), mobile-app (ui)
- backend-api y mobile-app dependen de api-contract; pueden desarrollarse en paralelo entre sí una vez estable el contrato
- Despliegue: backend con deploy-on-merge automático a pruebas + aprobación manual a producción; app móvil vía Expo/EAS interno

Does this all look correct before I generate the unit artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
