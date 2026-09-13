# NFR Requirements — backend-api — Scalability Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:entities] `construction/backend-api/functional-design/entities.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`

## NFR7 — Escalabilidad de datos (inception: "el modelo de datos debe soportar múltiples supervisores administradores sin rediseño")

- **NFR7.1**: `entities.md` (heredado de `components.md` § Entity Ownership) ya modela `User.role=supervisor` sin cardinalidad fija — más de un `User` con `role=supervisor` y `active=true` puede coexistir sin cambio de esquema; el MVP simplemente no activa más que uno (Carlos). Ningún query de esta unidad asume un único supervisor (ej. el guard de autorización de NFR3.11 valida `role=supervisor`, no un `userId` fijo).
- **NFR7.2**: volumen de datos esperado en el MVP: ~26 `Vendor` activos, un `DailySale` por vendedor por día hábil (≈ 6,760 filas/año a este ritmo), un `CommissionPeriod` por vendedor por mes (≈ 312 filas/año), y `Notification` en un orden de magnitud similar a los umbrales cruzados por vendedor/mes — ninguna de estas tablas requiere particionamiento, sharding, ni una estrategia de archivado especial en el MVP; el índice `(vendorId, saleDate)` de `DailySale` y `(vendorId, periodMonth)` de `CommissionPeriod` (ambos de `entities.md`) son suficientes a este volumen.

## NFR6 — Costo de infraestructura, en su dimensión de escalabilidad de conexiones

- **NFR6.1**: Neon (tier gratuito) limita el número de conexiones concurrentes directas a la base de datos — `backend-api` usa el modo de conexión "pooled" de Neon (pgBouncer integrado) a través de la cadena de conexión pooled, compatible con Prisma (Q4 de `nfr-requirements-questions.md`), en vez de abrir una conexión directa por instancia de proceso. A este volumen (~26 vendedores, sin concurrencia alta esperada) el pool por defecto de Neon es suficiente sin configuración adicional.

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR7.1 | Modelo soporta múltiples supervisores activos sin cambio de esquema | NFR7 (texto literal) |
| NFR7.2 | Volumen proyectado (~26 vendedores) no requiere particionamiento/sharding | NFR7 / NFR6 |
| NFR6.1 | Conexión pooled de Neon (pgBouncer), compatible con Prisma | NFR6 / Q4 |
