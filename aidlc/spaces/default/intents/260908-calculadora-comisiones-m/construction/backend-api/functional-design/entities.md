# Functional Design — backend-api — Entities

## Sources

- [upstream:components] `inception/domain-design/components.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:api-contract-entities] `construction/api-contract/functional-design/entities.md`

Modelo de datos completo que `backend-api` persiste — la forma externa de cada entidad (lo que cruza `api-contract`) ya quedó fijada en `construction/api-contract/functional-design/entities.md`; este archivo la hereda sin cambio de forma y agrega lo que **no** es visible en el contrato: el dueño (componente de dominio, ver `components.md` § Entity Ownership) y los detalles de persistencia que la etapa de Functional Design debe fijar (índices lógicos, campos siempre internos). Ninguna entidad nueva se introduce — las 7 son las mismas de `components.md` y de `api-contract`.

```yaml
entities:
  - name: User
    owner: AuthComponent
    description: Identidad y credenciales de quien se autentica (vendedor o supervisor).
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: role, type: enum, required: true, allowed_values: [vendedor, supervisor] }
      - { name: username, type: string, required: false, unique: true, constraints: "requerido solo cuando role=vendedor; único entre todos los User con role=vendedor" }
      - { name: passwordHash, type: string, required: false, constraints: "requerido solo cuando role=vendedor; solo interno, nunca se expone en response (NFR3.2 de api-contract)" }
      - { name: pin, type: string, required: false, constraints: "requerido solo cuando role=supervisor; solo interno, nunca se expone en response (NFR3.2 de api-contract)" }
      - { name: active, type: boolean, required: true, default: true }
    constraints:
      - "username es único entre todos los User con role=vendedor"
      - "el modelo no asume cardinalidad 1 para role=supervisor — soporta más de un supervisor activo sin rediseño (FR1.5, NFR7), aunque el MVP solo activa uno"
      - "no existe flujo de recuperación de contraseña en este MVP (Q4 de functional-design-questions.md) — un vendedor que la olvida requiere restablecimiento manual por el supervisor, fuera del alcance de esta unidad"
    relationships: []
    index_hints:
      - "username (único, solo cuando role=vendedor) — lookup de login de vendedor"

  - name: Session
    owner: AuthComponent
    description: >
      Sesión activa emitida al autenticar, para ambos roles. Ninguna Session
      expira por tiempo transcurrido (FR1.4 para vendedor; Q1 de
      functional-design-questions.md extiende la misma regla al supervisor —
      un solo comportamiento de sesión en todo el sistema) — solo termina por
      logout explícito o revocación manual.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: userId, type: reference, required: true, references: User }
      - { name: createdAt, type: datetime, required: true }
      - { name: expiresAt, type: datetime, required: false, constraints: "siempre ausente/nulo en este MVP — ningún rol tiene sesión con expiración por tiempo (BR1.4, BR1.5); el atributo se conserva en el modelo por si una fase futura reintroduce expiración, no se elimina el campo" }
      - { name: revokedAt, type: datetime, required: false }
    constraints:
      - "una Session con revokedAt no nulo ya no autentica ninguna petición"
    relationships:
      - { to: User, cardinality: "N:1", direction: "Session → User" }
    index_hints:
      - "token opaco (ver security-design.md de api-contract) — lookup por token en cada petición protegida"
      - "userId — para revocar todas las sesiones de un usuario si se necesitara en el futuro"

  - name: Vendor
    owner: VendorDirectoryComponent
    description: Vendedor del roster, con su ruta, canal y presupuesto vigente.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: userId, type: reference, required: true, references: User, unique: true }
      - { name: route, type: string, required: true }
      - { name: name, type: string, required: true }
      - { name: channel, type: enum, required: true, allowed_values: [preventa, autoventa] }
      - { name: budget, type: decimal, required: true, min: 0.01 }
      - { name: active, type: boolean, required: true, default: true }
    constraints:
      - "budget nunca es negativo ni vacío (rechazado como VALIDATION_ERROR — AC2.2.2, BR2.1 de api-contract)"
      - "cada Vendor corresponde a exactamente un User con role=vendedor"
      - "channel determina qué tierType de CommissionTier aplica: preventa → por_devolucion, autoventa → por_efectividad (components.md)"
    relationships:
      - { to: User, cardinality: "1:1", direction: "Vendor → User" }
    index_hints:
      - "channel — para consultar tramos aplicables por canal"
      - "route — listado/administración del roster"

  - name: CommissionTier
    owner: CommissionTierComponent
    description: Tramo de comisión configurado por canal, con su orden relativo.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: channel, type: enum, required: true, allowed_values: [preventa, autoventa] }
      - { name: tierType, type: enum, required: true, allowed_values: ["por_devolucion", "por_efectividad"] }
      - { name: order, type: integer, required: true }
      - { name: thresholdValue, type: decimal, required: true, constraints: "porcentaje: umbral de indicador de devolución (tierType=por_devolucion) o de efectividad de venta sobre presupuesto (tierType=por_efectividad)" }
      - { name: commissionRate, type: decimal, required: true, constraints: "porcentaje aplicado sobre la venta acumulada del período (BR4.3)" }
    constraints:
      - "tierType=por_devolucion para channel=preventa; tierType=por_efectividad para channel=autoventa"
      - "un conjunto de tramos de un canal puede quedar fuera de orden — se guarda con advertencia (TIER_ORDER_WARNING), no se rechaza (ADR-003)"
      - "no se agrega snapshot histórico de tramos a CommissionPeriod en este MVP (Q5) — un cambio de tramos afecta el cálculo del período vigente hacia adelante, sin trazabilidad retroactiva"
    relationships: []
    index_hints:
      - "channel + order — resolución del tramo aplicable, en orden"

  - name: DailySale
    owner: SalesEntryComponent
    description: Venta y devoluciones de un vendedor en un día, con soporte para registro sin conexión.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: vendorId, type: reference, required: true, references: Vendor }
      - { name: saleDate, type: date, required: true }
      - { name: amount, type: decimal, required: true, min: 0 }
      - { name: returns, type: decimal, required: true, min: 0 }
      - { name: syncStatus, type: enum, required: true, allowed_values: [synced, pending] }
      - { name: closed, type: boolean, required: true, default: false }
    constraints:
      - "amount y returns nunca son negativos ni vacíos (rechazado como VALIDATION_ERROR — FR3.2, BR3.1 de api-contract)"
      - "único por (vendorId, saleDate) — la clave de idempotencia de sincronización (ADR-004)"
      - "closed=true fija el registro; ya no acepta corrección directa (FR3.3, BR3.2 de api-contract)"
      - "una sincronización cuya fecha cae en un período (CommissionPeriod) ya cerrado se rechaza con PERIOD_CLOSED en vez de aplicarse (BR3.4 — Q2)"
      - "dos dispositivos del mismo vendedor escribiendo la misma fecha offline: la última sincronización recibida gana, sin detección de conflicto (BR3.5 — Q3, riesgo aceptado)"
    relationships:
      - { to: Vendor, cardinality: "N:1", direction: "DailySale → Vendor" }
    index_hints:
      - "(vendorId, saleDate) único — idempotencia de sincronización y de corrección del mismo día"

  - name: CommissionPeriod
    owner: CommissionLedgerComponent
    description: Agregado mensual de comisión, venta e indicador de devolución de un vendedor.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: vendorId, type: reference, required: true, references: Vendor }
      - { name: periodMonth, type: string, required: true, constraints: "formato AAAA-MM" }
      - { name: accumulatedSales, type: decimal, required: true, default: 0 }
      - { name: accumulatedReturns, type: decimal, required: true, default: 0 }
      - { name: returnRate, type: decimal, required: true, default: 0, constraints: "accumulatedReturns / accumulatedSales; 0 cuando accumulatedSales es 0 (BR8.1)" }
      - { name: commissionEarned, type: decimal, required: true, default: 0 }
      - { name: closed, type: boolean, required: true, default: false }
      - { name: closedAt, type: datetime, required: false }
    constraints:
      - "único por (vendorId, periodMonth)"
      - "closed=true es irreversible dentro del contrato — el historial expone solo períodos con closed=true (FR6.1)"
      - "se recalcula por completo (nunca incremental) cada vez que cambia una DailySale del período vigente, o cuando el supervisor edita budget o tramos a mitad de mes (ADR-006, BR4.4)"
      - "sin campo de snapshot de configuración de tramos en este MVP (Q5 — decisión explícita de no agregarlo)"
    relationships:
      - { to: Vendor, cardinality: "N:1", direction: "CommissionPeriod → Vendor" }
    index_hints:
      - "(vendorId, periodMonth) único — resolución del período vigente y agregación por vendedor"
      - "closed + vendorId — listado de historial ordenado, más recientes primero"

  - name: Notification
    owner: NotificationComponent
    description: Notificación entregada a un vendedor — de umbral automático o manual del supervisor.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: vendorId, type: reference, required: true, references: Vendor }
      - { name: type, type: enum, required: true, allowed_values: ["umbral_venta", "umbral_devolucion", "manual"] }
      - { name: thresholdCrossed, type: decimal, required: false, constraints: "presente solo cuando type≠manual" }
      - { name: earningOpportunity, type: object, required: false, constraints: "presente solo cuando type=umbral_devolucion y los tramos del canal están en orden (BR8.3); ausente en cualquier otro caso, nunca un valor calculado con tramos fuera de orden" }
      - { name: message, type: string, required: true }
      - { name: sentAt, type: datetime, required: true }
      - { name: read, type: boolean, required: true, default: false }
    constraints:
      - "un mismo (vendorId, type, thresholdCrossed, período vigente) nunca se notifica dos veces (BR7.2, BR8.2-duplicado)"
      - "es también el registro de seguimiento de qué umbrales ya se notificaron en el período vigente — no existe una entidad ni campo separado para eso (Q6): se deriva consultando los Notification ya enviados de ese vendorId+type+período"
    relationships:
      - { to: Vendor, cardinality: "N:1", direction: "Notification → Vendor" }
    index_hints:
      - "(vendorId, type, período vigente) — detección de duplicados antes de notificar un umbral (BR7.2/BR8.2), y consulta de historial de notificaciones (V5)"
```

## Resumen

Las 7 entidades son las mismas de `components.md` y de `api-contract` — esta unidad no introduce entidades nuevas, agrega el dueño de cada una (ya fijado en `components.md` § Entity Ownership) y los detalles de persistencia que las preguntas de esta etapa resolvieron: `Session.expiresAt` queda siempre ausente para ambos roles (Q1), `CommissionPeriod` no lleva snapshot de tramos (Q5), y `Notification` funciona también como el registro de qué umbrales ya se notificaron (Q6), sin entidad separada. Los índices lógicos listados (`index_hints`) son sugerencias de diseño para Code Generation, no un esquema de base de datos concreto — eso lo fija Infrastructure Design / Code Generation de esta unidad.
