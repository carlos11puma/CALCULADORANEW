# Functional Design — api-contract — Business Rules

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

Por decisión del usuario (Q2), esta unidad solo documenta reglas de **validación de forma de entrada** y de **autorización** — lo que el contrato rechaza o permite en el borde, no el cálculo de negocio (comisión, umbrales, oportunidad de ganancia), que `backend-api` documentará en su propio `rules.md` como quien lo implementa.

```yaml
rules:
  - id: BR1.1
    statement: Toda petición a un endpoint protegido debe portar un token de sesión (Authorization Bearer) válido y no revocado.
    category: authorization
    applies_to: [Session]
    trigger: cualquier endpoint salvo /api/v1/auth/login/*
    logic: "IF no hay token, o el token no corresponde a una Session con revokedAt nulo y no expirada THEN rechazar con 401 UNAUTHORIZED"
    violation_behaviour: "responde 401 UNAUTHORIZED; no ejecuta la operación"
    source: FR1

  - id: BR1.2
    statement: Un endpoint de administración (roster, presupuesto, tramos) solo lo puede invocar un usuario cuyo rol resuelto del token sea supervisor.
    category: authorization
    applies_to: [Vendor, CommissionTier]
    trigger: "POST/PATCH /api/v1/vendors, PUT /api/v1/tiers"
    logic: "IF role del token ≠ supervisor THEN rechazar con 403"
    violation_behaviour: "responde 403 FORBIDDEN"
    source: FR2

  - id: BR1.3
    statement: El envío manual de notificación solo lo puede originar un usuario cuyo rol resuelto del token sea supervisor.
    category: authorization
    applies_to: [Notification]
    trigger: "POST /api/v1/notifications/manual"
    logic: "IF role del token ≠ supervisor THEN rechazar con 403"
    violation_behaviour: "responde 403 FORBIDDEN"
    source: FR9.1

  - id: BR2.1
    statement: El presupuesto de un vendedor debe ser un número positivo mayor a cero.
    category: validation
    applies_to: [Vendor]
    trigger: "POST/PATCH /api/v1/vendors"
    logic: "IF budget es negativo, cero o vacío THEN rechazar con 400 VALIDATION_ERROR"
    violation_behaviour: "responde 400 con detalle de campo budget"
    source: FR2.2 / AC2.2.2

  - id: BR2.2
    statement: Un tramo de comisión requiere canal, tipo, orden, umbral y tasa de comisión no vacíos.
    category: validation
    applies_to: [CommissionTier]
    trigger: "PUT /api/v1/tiers"
    logic: "IF cualquiera de channel, tierType, order, thresholdValue, commissionRate está vacío o es negativo THEN rechazar con 400 VALIDATION_ERROR"
    violation_behaviour: "responde 400 con detalle de campo"
    source: FR2.3

  - id: BR2.3
    statement: Un conjunto de tramos fuera de orden se acepta con advertencia, nunca se rechaza.
    category: validation
    applies_to: [CommissionTier]
    trigger: "PUT /api/v1/tiers"
    logic: "IF el conjunto guardado queda fuera de orden de mejor a peor beneficio THEN responder 200 con warning=TIER_ORDER_WARNING (no 400)"
    violation_behaviour: "ninguna — es una advertencia informativa, no un rechazo"
    source: ADR-003 (domain-design)

  - id: BR3.1
    statement: El monto y las devoluciones de una venta diaria deben ser números no negativos.
    category: validation
    applies_to: [DailySale]
    trigger: "POST /api/v1/sales, POST /api/v1/sales/sync"
    logic: "IF amount < 0 OR returns < 0 OR amount es vacío OR returns es vacío THEN rechazar ese ítem con 400 VALIDATION_ERROR"
    violation_behaviour: "responde 400 (envío único) o marca el ítem como rejected con motivo (envío en lote /sync)"
    source: FR3.2

  - id: BR3.2
    statement: Una venta de un día ya cerrado no admite corrección.
    category: constraint
    applies_to: [DailySale]
    trigger: "POST /api/v1/sales"
    logic: "IF el DailySale de (vendorId, saleDate) tiene closed=true THEN rechazar con 409"
    violation_behaviour: "responde 409 — el valor queda fijo tras el cierre"
    source: FR3.3

  - id: BR3.3
    statement: La sincronización de una venta es idempotente por (vendorId, saleDate) — un reintento del mismo envío nunca duplica el registro.
    category: constraint
    applies_to: [DailySale]
    trigger: "POST /api/v1/sales, POST /api/v1/sales/sync"
    logic: "IF ya existe un DailySale para (vendorId, saleDate) THEN el nuevo envío actualiza ese registro en vez de crear uno nuevo"
    violation_behaviour: "ninguna — es la garantía de contrato, no un rechazo; cubre explícitamente el fallo de red a mitad de guardado (AC3.3.4)"
    source: ADR-004 (domain-design) / AC3.3.4

  - id: BR9.1
    statement: Un envío manual de notificación requiere un mensaje no vacío y al menos un destinatario válido.
    category: validation
    applies_to: [Notification]
    trigger: "POST /api/v1/notifications/manual"
    logic: "IF message está vacío OR recipients no es 'all' ni una lista no vacía de vendorId existentes THEN rechazar con 400 VALIDATION_ERROR"
    violation_behaviour: "responde 400 con detalle"
    source: FR9.1
```

## Resumen de reglas

| ID | Categoría | Qué cubre |
|---|---|---|
| BR1.1 | authorization | Todo endpoint protegido exige sesión válida |
| BR1.2 | authorization | Administración (roster/presupuesto/tramos) exige rol supervisor |
| BR1.3 | authorization | Envío manual de notificación exige rol supervisor |
| BR2.1 | validation | Presupuesto positivo |
| BR2.2 | validation | Tramo con todos sus campos no vacíos |
| BR2.3 | validation | Tramo fuera de orden se guarda con advertencia, no se rechaza |
| BR3.1 | validation | Monto/devoluciones de venta no negativos |
| BR3.2 | constraint | Venta de día cerrado es inmodificable |
| BR3.3 | constraint | Sincronización de venta idempotente por fecha+vendedor |
| BR9.1 | validation | Notificación manual exige mensaje y destinatarios válidos |

Reglas de cálculo (comisión por tramo, indicador de devolución, detección de umbrales, oportunidad de ganancia, cierre de período) quedan fuera de este `rules.md` por diseño — `backend-api` las documenta en su propio Functional Design, como la unidad que las implementa.
