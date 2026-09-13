# Functional Design — api-contract — Entities

## Sources

- [upstream:components] `inception/domain-design/components.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

Modelo de datos tecnología-agnóstico de las 7 entidades que cruzan el límite `api-contract` — la forma que backend-api implementa y mobile-app consume. Sin lógica de negocio (eso vive en `rules.md` de `backend-api`, no aquí) y sin tipos de lenguaje concretos (eso es Code Generation).

```yaml
entities:
  - name: User
    description: Identidad y credenciales de quien se autentica (vendedor o supervisor).
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: role, type: enum, required: true, allowed_values: [vendedor, supervisor] }
      - { name: username, type: string, required: false, unique: true, constraints: "requerido solo cuando role=vendedor" }
      - { name: passwordHash, type: string, required: false, constraints: "requerido solo cuando role=vendedor; nunca se expone en response" }
      - { name: pin, type: string, required: false, constraints: "requerido solo cuando role=supervisor; nunca se expone en response" }
      - { name: active, type: boolean, required: true, default: true }
    constraints:
      - "username es único entre todos los User con role=vendedor"
    relationships: []

  - name: Session
    description: >
      Sesión activa emitida al autenticar. No viaja completa en los payloads del
      contrato (solo su `token` se expone al cliente) pero su existencia,
      creación y expiración son comportamiento observable del contrato — login
      la crea, logout la revoca, y cualquier endpoint protegido la valida.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: userId, type: reference, required: true, references: User }
      - { name: createdAt, type: datetime, required: true }
      - { name: expiresAt, type: datetime, required: false, constraints: "ausente para sesión de vendedor de larga duración (FR1.4); Functional Design de backend-api resuelve la duración de sesión de supervisor" }
      - { name: revokedAt, type: datetime, required: false }
    constraints:
      - "una Session con revokedAt no nulo ya no autentica ninguna petición"
    relationships:
      - { to: User, cardinality: "N:1", direction: "Session → User" }

  - name: Vendor
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
      - "budget nunca es negativo ni vacío (rechazado como VALIDATION_ERROR — AC2.2.2)"
      - "cada Vendor corresponde a exactamente un User con role=vendedor"
    relationships:
      - { to: User, cardinality: "1:1", direction: "Vendor → User" }

  - name: CommissionTier
    description: Tramo de comisión configurado por canal, con su orden relativo.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: channel, type: enum, required: true, allowed_values: [preventa, autoventa] }
      - { name: tierType, type: enum, required: true, allowed_values: ["por_devolucion", "por_efectividad"] }
      - { name: order, type: integer, required: true }
      - { name: thresholdValue, type: decimal, required: true }
      - { name: commissionRate, type: decimal, required: true }
    constraints:
      - "tierType=por_devolucion para channel=preventa; tierType=por_efectividad para channel=autoventa"
      - "un conjunto de tramos de un canal puede quedar fuera de orden — se guarda con advertencia (TIER_ORDER_WARNING), no se rechaza"
    relationships: []

  - name: DailySale
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
      - "amount y returns nunca son negativos ni vacíos (rechazado como VALIDATION_ERROR — FR3.2)"
      - "único por (vendorId, saleDate) — la clave de idempotencia de sincronización (ADR-004 de domain-design)"
      - "closed=true fija el registro; ya no acepta corrección (FR3.3)"
    relationships:
      - { to: Vendor, cardinality: "N:1", direction: "DailySale → Vendor" }

  - name: CommissionPeriod
    description: Agregado mensual de comisión, venta e indicador de devolución de un vendedor.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: vendorId, type: reference, required: true, references: Vendor }
      - { name: periodMonth, type: string, required: true, constraints: "formato AAAA-MM" }
      - { name: accumulatedSales, type: decimal, required: true, default: 0 }
      - { name: accumulatedReturns, type: decimal, required: true, default: 0 }
      - { name: returnRate, type: decimal, required: true, default: 0 }
      - { name: commissionEarned, type: decimal, required: true, default: 0 }
      - { name: closed, type: boolean, required: true, default: false }
      - { name: closedAt, type: datetime, required: false }
    constraints:
      - "único por (vendorId, periodMonth)"
      - "closed=true es irreversible dentro del contrato — el historial expone solo períodos con closed=true"
    relationships:
      - { to: Vendor, cardinality: "N:1", direction: "CommissionPeriod → Vendor" }

  - name: Notification
    description: Notificación entregada a un vendedor — de umbral automático o manual del supervisor.
    attributes:
      - { name: id, type: identifier, required: true, unique: true }
      - { name: vendorId, type: reference, required: true, references: Vendor }
      - { name: type, type: enum, required: true, allowed_values: ["umbral_venta", "umbral_devolucion", "manual"] }
      - { name: thresholdCrossed, type: decimal, required: false, constraints: "presente solo cuando type≠manual" }
      - { name: earningOpportunity, type: object, required: false, constraints: "presente solo cuando type=umbral_devolucion y los tramos del canal están en orden" }
      - { name: message, type: string, required: true }
      - { name: sentAt, type: datetime, required: true }
      - { name: read, type: boolean, required: true, default: false }
    constraints:
      - "un mismo (vendorId, type, thresholdCrossed, periodo vigente) nunca se notifica dos veces"
    relationships:
      - { to: Vendor, cardinality: "N:1", direction: "Notification → Vendor" }
```

## Resumen

Las 7 entidades del contrato son las mismas 7 de `components.md` — `api-contract` no introduce ni oculta entidades nuevas, solo fija su forma externa. `Session` se incluye por decisión explícita (Q1): aunque nunca viaja completa en un payload, su ciclo de vida (creada por login, revocada por logout, validada en cada endpoint protegido) es comportamiento observable del contrato. Las claves de idempotencia (`DailySale` único por `vendorId`+`saleDate`) y de agregación (`CommissionPeriod` único por `vendorId`+`periodMonth`) quedan explícitas como restricciones de entidad, porque son la base de las garantías de contrato documentadas en `contract-summary.md` (idempotencia de sincronización, unicidad de período).
