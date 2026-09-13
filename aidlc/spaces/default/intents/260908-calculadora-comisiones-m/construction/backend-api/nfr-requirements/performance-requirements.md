# NFR Requirements — backend-api — Performance Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`

Cada requisito hereda el ID `NFR{n}` de inception y agrega un sub-número. `NFR1` es el único NFR de rendimiento en inception; `backend-api` lo detalla porque es quien ejecuta el recálculo (W6/W7/W8 de `functional-spec.md`).

## NFR1 — Rendimiento (inception: "la comisión debe recalcularse y mostrarse en menos de 2 segundos después de guardar una venta")

- **NFR1.1**: el endpoint `POST /api/v1/sales` (W6) responde en menos de 2 segundos de extremo a extremo, medido desde la recepción de la petición hasta el envío de la respuesta con el `DailySale` guardado y el recálculo de `CommissionPeriod` (BR4.4) ya aplicado — este es el presupuesto de latencia que satisface NFR1 directamente. Medido sobre peticiones en caliente (excluye el cold start del hosting gratuito, cubierto en `reliability-requirements.md` NFR6.2).
- **NFR1.2**: presupuesto de latencia interno para no exceder NFR1.1 con margen: consulta y actualización de `DailySale` <200ms, recálculo completo de `CommissionPeriod` (recorrido de `DailySale` no cerradas del período + evaluación de tramos BR4.1-BR4.3) <300ms, evaluación de umbrales de notificación (BR7.1/BR8.2) y envío <500ms — el resto del presupuesto de 2s queda como margen de red y overhead de framework.
- **NFR1.3**: `GET /api/v1/commission/current` (W8, lectura del valor ya calculado, sin recálculo) responde en menos de 500ms — es una simple lectura indexada por `(vendorId, periodMonth)` (índice de `entities.md`), no ejecuta lógica de cálculo.
- **NFR1.4**: `POST /api/v1/sales/sync` (W7, lote de varios ítems) no tiene el mismo piso de 2 segundos por ítem individual — NFR1 se definió sobre el flujo interactivo (vendedor guardando una venta con conexión); un lote de sincronización se procesa de forma asíncrona respecto a la percepción del usuario (la app ya mostró "pendiente de sincronizar" localmente, per US3.3) y se acota únicamente por el timeout general de contrato de 10s (`contract-summary.md`).

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR1.1 | `POST /api/v1/sales` responde <2s de extremo a extremo, en caliente | NFR1 (texto literal) |
| NFR1.2 | Presupuesto de latencia por capa dentro de NFR1.1 | NFR1.1 |
| NFR1.3 | `GET /api/v1/commission/current` <500ms (lectura sin recálculo) | NFR1 |
| NFR1.4 | `POST /api/v1/sales/sync` acotado por el timeout de contrato (10s), no por NFR1.1 | NFR1 / contract-summary.md |
