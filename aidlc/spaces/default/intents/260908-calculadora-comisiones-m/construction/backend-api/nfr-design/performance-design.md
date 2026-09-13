# NFR Design — backend-api — Performance Design

## Sources

- [upstream:performance-requirements] `construction/backend-api/nfr-requirements/performance-requirements.md`
- [upstream:functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:nfr-design-questions] `construction/backend-api/nfr-design/nfr-design-questions.md`

## Diseño: sin capa de caché (Q3)

`GET /api/v1/commission/current` (NFR1.3, <500ms) se sirve con lectura directa indexada por `(vendorId, periodMonth)` sin ninguna capa de caché — decisión explícita (Q3): el valor cambia en cada `POST /api/v1/sales`/`sync` (BR4.4), así que una caché necesitaría invalidarse en cada escritura de todas formas, y al volumen esperado (~26 vendedores) el costo de una lectura indexada directa ya está muy por debajo del presupuesto de NFR1.3. Se revisita solo si el volumen de uso crece más allá del rango de NFR6 de inception.

```
// Pseudocódigo ilustrativo — Code Generation implementa el repositorio real
async getCurrentPeriod(vendorId: string): Promise<CommissionPeriod> {
  return prisma.commissionPeriod.findUnique({
    where: { vendorId_periodMonth: { vendorId, periodMonth: currentMonth() } },
  }); // lectura directa, sin capa de caché intermedia
}
```

## Diseño: pool de conexiones de base de datos

Prisma (`tech-stack-decisions.md`) se conecta a Neon vía la cadena de conexión "pooled" (pgBouncer integrado de Neon — ver `scalability-design.md` NFR6.1) — el pool se configura una única vez al iniciar el proceso NestJS (módulo `PrismaModule`, patrón singleton) y se reutiliza en cada request, sin abrir/cerrar conexión por petición. Esto satisface el presupuesto de NFR1.2 (<200ms para operaciones de `DailySale`) evitando el costo de establecer una conexión TCP+TLS nueva en cada request.

## Diseño: recálculo de `CommissionPeriod` (BR4.4)

El recálculo completo (NFR1.2, <300ms) se implementa como una única transacción de Prisma que: (1) lee todas las `DailySale` no cerradas del período vigente del vendedor con una sola consulta indexada por `(vendorId, saleDate)`, (2) agrega `accumulatedSales`/`accumulatedReturns` en memoria (no con una agregación SQL separada, ya que el volumen por vendedor por mes es pequeño — máximo ~31 filas), (3) determina el tramo aplicable (BR4.1-BR4.3) con una lectura ya cacheada en memoria de los `CommissionTier` del canal (los tramos no cambian dentro del mismo request), y (4) escribe el `CommissionPeriod` actualizado en la misma transacción. Una sola transacción evita una condición de carrera entre lectura y escritura del mismo período dentro del mismo request.

## Diseño: procesamiento asíncrono para W7 (sincronización en lote)

`POST /api/v1/sales/sync` (NFR1.4, acotado por el timeout de contrato de 10s, no por el piso de 2s) procesa el arreglo de ítems de forma secuencial dentro de la misma petición (no encola trabajo en background) — el volumen esperado por lote es pequeño (unos pocos días de backlog offline, no cientos de ítems), y `functional-spec.md` W7 paso 3 ya especifica que el recálculo de `CommissionPeriod` se dispara una sola vez al final del lote, no por ítem, evitando trabajo redundante dentro del mismo request síncrono.

## Resumen

| ID | Diseño |
|---|---|
| NFR1.1 | Recálculo completo en una transacción Prisma + pool de conexión ya establecido (sin latencia de conexión nueva) |
| NFR1.2 | Presupuesto por capa satisfecho por: consulta indexada (`DailySale`), agregación en memoria (no SQL separado), tramos ya en memoria dentro de la transacción |
| NFR1.3 | Lectura directa indexada, sin caché (Q3) |
| NFR1.4 | Procesamiento secuencial dentro del mismo request, sin cola de background — volumen de lote pequeño |
