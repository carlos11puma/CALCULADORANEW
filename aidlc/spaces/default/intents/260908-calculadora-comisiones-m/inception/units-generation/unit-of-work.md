# Units Generation — Unit of Work

## Sources

- [upstream:components] `inception/domain-design/components.md`
- [upstream:decisions] `inception/domain-design/decisions.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:stories] `inception/user-stories/stories.md`

## Unidades

| Unit ID | Directory | Nombre | Kind |
|---|---|---|---|
| U1 | `u1-api-contract` | api-contract | spec |
| U2 | `u2-backend-api` | backend-api | service |
| U3 | `u3-mobile-app` | mobile-app | ui |

### U1 — api-contract (spec)

**Descripción**: Contrato compartido entre backend y app móvil — esquema/tipos de la API (endpoints, request/response shapes) para los 6 componentes de dominio (Auth, VendorDirectory, CommissionTier, SalesEntry, CommissionLedger, Notification). No es un servicio desplegable: es un artefacto consumido en el lugar (import de tipos TypeScript compartidos, o definición OpenAPI) tanto por backend-api como por mobile-app.

**Límites**: incluye solo forma de datos y firmas de endpoints — nunca lógica de negocio (esa vive en backend-api, según los `behaviour` definidos en components.md) ni detalles de UI (esos viven en mobile-app).

**Responsabilidades**:
- Definir los tipos/schema de request y response de cada endpoint que expone backend-api
- Servir como fuente única de verdad para que backend-api y mobile-app no diverjan en la forma de los datos
- Version del contrato para permitir evolución sin romper al consumidor mientras ambas unidades se desarrollan en paralelo

**Deployment model**: embedded — se consume como paquete/módulo compartido (ej. workspace de un monorepo, o paquete npm publicado internamente), no se despliega de forma independiente.

**Complejidad relativa**: S

**Notas de implementación**: decisión del usuario (Q2 de units-generation-questions.md) de tenerlo como unidad separada para habilitar desarrollo en paralelo entre backend-api y mobile-app. Contract Design (siguiente etapa de Inception) es quien detalla el contenido exacto de este contrato; esta unidad es su contenedor de entrega en Construction.

### U2 — backend-api (service)

**Descripción**: Monolito modular NestJS que embebe los 6 componentes de dominio de `components.md` como módulos internos (AuthComponent, VendorDirectoryComponent, CommissionTierComponent, SalesEntryComponent, CommissionLedgerComponent, NotificationComponent), persistiendo en PostgreSQL (Neon) e integrando el servicio de push notifications. Incluye el job programado de cierre de período mensual (ADR-005 de domain-design).

**Límites**: implementa el `behaviour` de cada componente de components.md tal cual está definido allí — esta unidad no redefine reglas de negocio, las construye según lo ya decidido en Domain Design.

**Responsabilidades**:
- Exponer la API que implementa el contrato de U1 (api-contract)
- Ejecutar toda la lógica de negocio de los 6 componentes de dominio
- Ejecutar el job programado de cierre de período
- Integrarse con el servicio de push notifications (Expo Push / FCM / APNs)

**Deployment model**: standalone — un solo servicio desplegable (decisión del usuario, Q1 de units-generation-questions.md), con despliegue automático a un ambiente de pruebas en cada integración a `main` y aprobación manual del supervisor antes de producción (heredado de team.md).

**Complejidad relativa**: XL (embebe los 6 componentes de dominio completos, incluyendo las 4 decisiones de negocio no triviales resueltas en Domain Design: sincronización offline por fecha, validación de orden de tramos, recálculo de umbrales, cierre de período por job)

**Notas de implementación**: por ser un monolito modular, cada componente de dominio se implementa como un módulo NestJS independiente (siguiendo los límites de components.md) para no perder la separación de responsabilidades solo porque comparten proceso de despliegue — esto deja la puerta abierta a extraer un componente como servicio propio en el futuro sin rediseño, si el volumen lo justifica.

### U3 — mobile-app (ui)

**Descripción**: App React Native con las pantallas de Vendedor (V1–V6) y Supervisor (A1–A5) definidas en refined-mockups/mockups.md, usando React Native Paper como sistema de diseño (design-system-mapping.md) y consumiendo el contrato de U1.

**Límites**: solo presentación e interacción — toda validación de negocio real (más allá de UX inmediata como campos vacíos) se apoya en backend-api; esta unidad no duplica reglas de cálculo de comisión.

**Responsabilidades**:
- Implementar las 11 pantallas refinadas de mockups.md para ambos roles
- Persistencia local de ventas pendientes de sincronizar (modo offline, FR3.4)
- Recepción y visualización de notificaciones push agrupadas por tipo (V5)
- Consumir la API de backend-api según el contrato de U1

**Deployment model**: standalone — distribución vía Expo/EAS interno para el MVP, sin publicación en tiendas públicas todavía (decisión del usuario, Q3 de units-generation-questions.md).

**Complejidad relativa**: L (11 pantallas, modo offline con sincronización, agrupación de notificaciones)

**Notas de implementación**: solo teléfonos en este MVP (decisión heredada de Refined Mockups, Q5); WCAG 2.1 AA como nivel de accesibilidad objetivo (accessibility-checklist.md).

## Review

**Reviewer:** aidlc-architecture-reviewer-agent
**Iteration:** 1

Fortalezas: las 3 unidades respetan estrictamente el límite de esta etapa — no se propone un orden de implementación entre unidades ni un camino crítico en `unit-of-work-dependency.md`, y el bloque `yaml` de aristas es acíclico (api-contract → {backend-api, mobile-app}, sin ciclo). U2 (backend-api) preserva los límites de componente definidos en Domain Design en vez de aplanarlos en una sola masa de código: cada componente de dominio se mantiene como módulo NestJS independiente dentro del monolito, lo cual es coherente con ADR-001 de domain-design (la descomposición en 6 componentes no se pierde solo porque comparten despliegue). El story map cubre las 21 historias sin huecos y distingue correctamente cuáles son puramente de backend (US1.4, US4.1, US4.2, US8.1) de las que cruzan unidades.

Hallazgos (no bloquean esta etapa; pasan a Contract Design / Delivery Planning):
1. api-contract (U1) es una unidad `spec` sin historias propias en el story map — es correcto por diseño (es un contenedor de contrato, no de funcionalidad), pero Contract Design (siguiente etapa) debe asegurarse de que su contenido cubra los 6 componentes de dominio completos, no solo los más obvios (Auth, SalesEntry), para que backend-api y mobile-app realmente puedan avanzar en paralelo sin bloquearse mutuamente por partes del contrato aún no definidas.
2. `unit-of-work-story-map.md` marca US3.3 (venta sin conexión) como implementada por U3 primero y U2 después — es una nota de orden de lectura razonable dado que la lógica de persistencia local vive en mobile-app, pero Delivery Planning debe recordar el hallazgo ya heredado de Domain Design (ADR-004) sobre el caso de borde de dos dispositivos editando la misma fecha, que involucra a ambas unidades y no debe perderse al planificar Bolts.
3. `backend-api` (U2) es una unidad de complejidad XL que concentra los 6 componentes de dominio — válido para el MVP dado el modelo de monolito modular elegido por el usuario (Q1), pero si el proyecto creciera más allá del alcance actual, valdría la pena que Delivery Planning considere dividir el trabajo de U2 en Bolts por componente de dominio en vez de tratarla como una sola unidad de trabajo monolítica de principio a fin.

**Verdict:** READY

Las 3 unidades, el DAG de dependencias y el mapa de historias son suficientes, coherentes con components.md y stories.md, y respetan el límite de "topología, no secuencia" de esta etapa; los hallazgos anteriores son entradas útiles para Contract Design y Delivery Planning, no huecos de esta etapa.
