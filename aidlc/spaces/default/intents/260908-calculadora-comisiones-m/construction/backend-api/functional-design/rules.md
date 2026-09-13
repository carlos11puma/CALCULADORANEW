# Functional Design — backend-api — Business Rules

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:decisions] `inception/domain-design/decisions.md`
- [upstream:api-contract-rules] `construction/api-contract/functional-design/rules.md`

`api-contract/rules.md` cubre validación de forma y autorización en el borde — BR1.1-BR1.3, BR2.1-BR2.3, BR3.1-BR3.3, BR9.1. Este archivo continúa esa misma numeración por grupo (`BR{grupo FR}.{secuencia}`) con las reglas de **cálculo y comportamiento interno** que `backend-api` implementa — lo que Domain Design decidió en sus ADR y lo que esta etapa resolvió en su ronda de preguntas.

```yaml
rules:
  - id: BR1.4
    statement: La sesión de un vendedor no expira por tiempo transcurrido.
    category: constraint
    applies_to: [Session]
    trigger: cualquier petición autenticada de un vendedor
    logic: "Session.expiresAt permanece nulo para toda Session cuyo User.role=vendedor; la sesión solo termina por logout explícito o revocación manual del supervisor"
    violation_behaviour: "no aplica — es una garantía positiva, no un rechazo"
    source: FR1.4

  - id: BR1.5
    statement: La sesión de un supervisor no expira por tiempo transcurrido — mismo comportamiento que la del vendedor.
    category: constraint
    applies_to: [Session]
    trigger: cualquier petición autenticada de un supervisor
    logic: "Session.expiresAt permanece nulo para toda Session cuyo User.role=supervisor; la sesión solo termina por logout explícito"
    violation_behaviour: "no aplica — es una garantía positiva, no un rechazo"
    source: Q1 de functional-design-questions.md

  - id: BR3.4
    statement: Una venta sincronizada cuya fecha cae dentro de un período mensual ya cerrado se rechaza, sin afectar el resto del lote de sincronización.
    category: constraint
    applies_to: [DailySale, CommissionPeriod]
    trigger: "POST /api/v1/sales/sync, por cada ítem del lote"
    logic: "IF existe un CommissionPeriod para (vendorId, periodMonth derivado de saleDate) con closed=true THEN marcar ese ítem status=rejected con Error.code=PERIOD_CLOSED; los demás ítems del lote se procesan de forma independiente (ya decidido en ADR-004)"
    violation_behaviour: "el ítem se reporta rejected en la respuesta de /sales/sync; el período cerrado no se modifica"
    source: ADR-004 / Q2 de functional-design-questions.md

  - id: BR3.5
    statement: Cuando dos sincronizaciones offline del mismo vendedor escriben la misma fecha, la última en llegar al servidor prevalece — no hay detección de conflicto.
    category: policy
    applies_to: [DailySale]
    trigger: "POST /api/v1/sales/sync, dos envíos distintos con la misma (vendorId, saleDate)"
    logic: "IF ya existe un DailySale para (vendorId, saleDate) THEN el envío más reciente sobrescribe amount/returns/syncStatus de ese registro — sin comparar versión ni marca de tiempo del dispositivo"
    violation_behaviour: "ninguna — riesgo aceptado explícitamente (ADR-004, patrón real de un dispositivo por vendedor)"
    source: ADR-004 / Q3 de functional-design-questions.md

  - id: BR4.1
    statement: La métrica de evaluación de tramo depende del canal del vendedor — devolución para preventa, efectividad para autoventa.
    category: calculation
    applies_to: [CommissionPeriod, CommissionTier, Vendor]
    trigger: cada recálculo de CommissionPeriod
    logic: "IF Vendor.channel=preventa THEN la métrica es CommissionPeriod.returnRate (evaluada contra tramos tierType=por_devolucion); IF Vendor.channel=autoventa THEN la métrica es efectividad = accumulatedSales / Vendor.budget (evaluada contra tramos tierType=por_efectividad)"
    violation_behaviour: "no aplica — regla de cálculo, no de validación"
    source: FR4.1 / components.md (CommissionTierComponent)

  - id: BR4.2
    statement: El tramo aplicable es el de mejor beneficio cuyo umbral la métrica vigente satisface, dentro del conjunto ordenado de tramos del canal.
    category: calculation
    applies_to: [CommissionTier, CommissionPeriod]
    trigger: cada recálculo de CommissionPeriod
    logic: "recorrer los CommissionTier del canal y tierType correspondientes en orden (order) de mejor a peor beneficio; el tramo aplicable es el de mejor beneficio cuyo thresholdValue la métrica vigente alcanza o supera (para por_efectividad) o está por debajo de (para por_devolucion, donde menor devolución es mejor)"
    violation_behaviour: "IF el conjunto de tramos del canal está fuera de orden (CommissionTierComponent.inOrder=false) THEN el tramo aplicable igual se determina recorriendo por order declarado — la advertencia de desorden (ADR-003) afecta la oportunidad de ganancia (BR8.3), no el cálculo de comisión en sí, que siempre usa el order tal como está guardado"
    source: FR4.1 / ADR-003

  - id: BR4.3
    statement: La comisión ganada del período es la venta acumulada multiplicada por la tasa del tramo aplicable.
    category: calculation
    applies_to: [CommissionPeriod]
    trigger: cada recálculo de CommissionPeriod
    logic: "CommissionPeriod.commissionEarned = CommissionPeriod.accumulatedSales × tramoAplicable.commissionRate (BR4.2)"
    violation_behaviour: "no aplica — regla de cálculo"
    source: FR4.1

  - id: BR4.4
    statement: CommissionPeriod se recalcula por completo, nunca de forma incremental, ante cualquier cambio relevante.
    category: calculation
    applies_to: [CommissionPeriod]
    trigger: "una DailySale del período vigente se crea/corrige/sincroniza; o el supervisor edita Vendor.budget o algún CommissionTier del canal del vendedor"
    logic: "recomputar accumulatedSales, accumulatedReturns, returnRate, commissionEarned desde el conjunto completo de DailySale no cerradas del período vigente, con los valores VIGENTES de budget y tramos — nunca ajustar incrementalmente el valor anterior"
    violation_behaviour: "no aplica — regla de cálculo; garantiza FR5.3 (tiempo real) y la semántica de ADR-006 (recálculo sin reenvío de notificaciones ya enviadas)"
    source: FR5.3 / ADR-006

  - id: BR4.5
    statement: Un job programado cierra el período vigente el último día del mes para cada vendedor y abre el período del mes siguiente.
    category: policy
    applies_to: [CommissionPeriod]
    trigger: ejecución del job programado de cierre mensual
    logic: "para cada Vendor activo, IF existe un CommissionPeriod vigente (closed=false) para el mes que termina THEN marcarlo closed=true, closedAt=ahora; IF no existe aún un CommissionPeriod para el mes siguiente THEN crearlo con acumulados en cero"
    violation_behaviour: "no aplica — job de infraestructura, el mecanismo concreto (scheduler) lo fija Infrastructure Design"
    source: ADR-005 / FR4.2

  - id: BR6.1
    statement: El historial expone únicamente períodos cerrados, ordenados del más reciente al más antiguo.
    category: validation
    applies_to: [CommissionPeriod]
    trigger: "GET /api/v1/commission/history"
    logic: "filtrar CommissionPeriod por vendorId (resuelto de la sesión) y closed=true; ordenar por periodMonth descendente; aplicar el límite opcional (query param limit) si se especifica"
    violation_behaviour: "no aplica — regla de consulta"
    source: FR6.1

  - id: BR7.1
    statement: Se notifica al vendedor cada vez que su venta acumulada cruza, hacia arriba, uno de los umbrales de presupuesto 95/97/100/103/105/110%, y ese umbral no había sido notificado aún en el período vigente.
    category: calculation
    applies_to: [Notification, CommissionPeriod, Vendor]
    trigger: cada recálculo de CommissionPeriod que resulta en un cambio de accumulatedSales
    logic: "para cada umbral U en [95,97,100,103,105,110]: IF (accumulatedSales / Vendor.budget) × 100 ≥ U AND no existe ya un Notification(vendorId, type=umbral_venta, thresholdCrossed=U) para el período vigente THEN crear y enviar esa Notification"
    violation_behaviour: "no aplica — regla de cálculo/envío; la no-duplicación es BR7.2"
    source: FR7.1

  - id: BR7.2
    statement: Un umbral de venta/presupuesto ya notificado en el período vigente nunca se reenvía, incluso si el supervisor edita presupuesto o tramos a mitad de mes.
    category: constraint
    applies_to: [Notification]
    trigger: cada evaluación de BR7.1 tras un recálculo de CommissionPeriod
    logic: "el filtro \"no existe ya un Notification(vendorId, type=umbral_venta, thresholdCrossed=U) para el período vigente\" de BR7.1 es la única fuente de verdad de qué ya se notificó — no existe una entidad ni campo separado de seguimiento (Q6)"
    violation_behaviour: "no aplica — la consulta de duplicados en BR7.1 ya lo previene por construcción"
    source: ADR-006 / Q6 de functional-design-questions.md

  - id: BR8.1
    statement: El indicador de devolución del período vigente es la proporción de devoluciones acumuladas sobre venta acumulada, o cero si aún no hay venta acumulada.
    category: calculation
    applies_to: [CommissionPeriod]
    trigger: cada recálculo de CommissionPeriod
    logic: "IF accumulatedSales = 0 THEN returnRate = 0; ELSE returnRate = accumulatedReturns / accumulatedSales"
    violation_behaviour: "no aplica — regla de cálculo; evita división por cero"
    source: FR8.1

  - id: BR8.2
    statement: Se notifica al vendedor cada vez que su indicador de devolución mejora por debajo de uno de los umbrales 8.5/8/7.5/7/6/5%, y ese umbral no había sido notificado aún en el período vigente.
    category: calculation
    applies_to: [Notification, CommissionPeriod]
    trigger: cada recálculo de CommissionPeriod que resulta en un cambio de returnRate
    logic: "para cada umbral U en [8.5,8,7.5,7,6,5]: IF returnRate × 100 < U AND no existe ya un Notification(vendorId, type=umbral_devolucion, thresholdCrossed=U) para el período vigente THEN crear y enviar esa Notification, con earningOpportunity si aplica BR8.3"
    violation_behaviour: "no aplica — misma no-duplicación que BR7.2, aplicada a este tipo de umbral"
    source: FR8.2 / ADR-006

  - id: BR8.3
    statement: La notificación de umbral de devolución incluye la oportunidad de ganancia hacia el siguiente tramo mejor únicamente cuando los tramos de devolución del canal están en orden; se omite por completo en cualquier otro caso.
    category: calculation
    applies_to: [Notification, CommissionTier]
    trigger: construcción de una Notification tipo umbral_devolucion (BR8.2)
    logic: "IF CommissionTierComponent reporta el conjunto de tramos tierType=por_devolucion del canal del vendedor como \"en orden\" THEN calcular earningOpportunity = { nextTierThreshold: umbral del tramo inmediatamente mejor, potentialGain: (tasa del tramo mejor − tasa del tramo actual) × accumulatedSales }; ELSE omitir earningOpportunity del todo (no incluir el campo, nunca un valor calculado con tramos fuera de orden)"
    violation_behaviour: "no aplica — es una omisión deliberada, no un rechazo (ADR-003)"
    source: FR8.3 / ADR-003

  - id: BR9.2
    statement: Una notificación manual con destinatarios "all" se envía a todo Vendor activo; una lista explícita de vendorId se envía solo a los que resuelven a un Vendor activo, ignorando silenciosamente cualquier id que no resuelva.
    category: calculation
    applies_to: [Notification, Vendor]
    trigger: "POST /api/v1/notifications/manual, tras pasar la validación de forma (BR9.1 de api-contract)"
    logic: "IF recipients = \"all\" THEN destinatarios = todo Vendor con active=true; ELSE destinatarios = { v ∈ recipients : existe Vendor(id=v, active=true) } — ids que no resuelven a un Vendor activo se ignoran sin bloquear el envío al resto"
    violation_behaviour: "no aplica — comportamiento de resolución, no de rechazo; BR9.1 ya cubrió el caso de lista vacía o mensaje vacío"
    source: FR9.1
```

## Resumen de reglas

| ID | Categoría | Qué cubre |
|---|---|---|
| BR1.4 | constraint | Sesión de vendedor sin expiración por tiempo |
| BR1.5 | constraint | Sesión de supervisor sin expiración por tiempo (Q1) |
| BR3.4 | constraint | Sincronización a período ya cerrado se rechaza (Q2) |
| BR3.5 | policy | Conflicto de dos dispositivos offline: último en sincronizar gana (Q3) |
| BR4.1 | calculation | Métrica de tramo según canal (devolución vs. efectividad) |
| BR4.2 | calculation | Determinación del tramo aplicable |
| BR4.3 | calculation | Fórmula de comisión ganada |
| BR4.4 | calculation | Recálculo completo, nunca incremental |
| BR4.5 | policy | Cierre de período mensual por job programado |
| BR6.1 | validation | Historial: solo períodos cerrados, más recientes primero |
| BR7.1 | calculation | Detección de umbral de venta/presupuesto |
| BR7.2 | constraint | No reenvío de umbral de venta ya notificado (Q6) |
| BR8.1 | calculation | Fórmula del indicador de devolución |
| BR8.2 | calculation | Detección de umbral de devolución |
| BR8.3 | calculation | Oportunidad de ganancia — solo si tramos en orden |
| BR9.2 | calculation | Resolución de destinatarios de notificación manual |

Las reglas de validación de forma y autorización (BR1.1-BR1.3, BR2.1-BR2.3, BR3.1-BR3.3, BR9.1) ya están definidas en `construction/api-contract/functional-design/rules.md` y `backend-api` las implementa tal cual, sin redefinirlas aquí.
