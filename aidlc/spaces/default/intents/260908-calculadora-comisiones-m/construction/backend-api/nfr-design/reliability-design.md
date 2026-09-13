# NFR Design — backend-api — Reliability Design

## Sources

- [upstream:reliability-requirements] `construction/backend-api/nfr-requirements/reliability-requirements.md`
- [upstream:rules] `construction/backend-api/functional-design/rules.md`
- [upstream:decisions] `inception/domain-design/decisions.md`

## Diseño: cold start aceptado, sin health check activo adicional (NFR6.2)

No se diseña un mecanismo de "warm-up" ni un health check activo con ping periódico externo — sería contradictorio con NFR6 (priorizar capas gratuitas: un ping periódico para evitar que el proceso "duerma" consumiría el mismo recurso gratuito que se intenta preservar). El hosting elegido expone su propio endpoint de salud básico (`GET /health`, patrón estándar de NestJS con `@nestjs/terminus`) para que la plataforma de hosting lo consulte según su propio mecanismo, sin lógica adicional de esta unidad.

## Diseño: auto-recuperación del job de cierre mensual (NFR6.3)

`@nestjs/schedule` programa el job de cierre (BR4.5) con una expresión cron **diaria** (no solo "el último día del mes a medianoche") que evalúa la condición de estado "¿existe un `CommissionPeriod` vigente cuyo `periodMonth` ya terminó?" para cada `Vendor` activo — si el proceso estuvo caído en el instante exacto de fin de mes, la siguiente ejecución diaria detecta la condición pendiente y cierra el período, acotando la ventana de exposición a horas en vez de hasta el próximo primer día del mes siguiente.

```
// Pseudocódigo ilustrativo — Code Generation implementa el job real
@Cron(CronExpression.EVERY_DAY_AT_1AM)
async closeOverduePeriods() {
  const overdue = await findOpenPeriodsPastMonth(); // condición de estado, no un evento puntual
  for (const period of overdue) {
    await closePeriodAndOpenNext(period); // idempotente: closed=true ya no se vuelve a cerrar
  }
}
```

## Diseño: sin backup/restore adicional (NFR6.4)

Se documenta explícitamente que esta unidad no implementa un mecanismo de backup propio — depende del point-in-time recovery de corto alcance que Neon provee en su tier gratuito. Sin acción de diseño adicional; el riesgo residual (ventana de recuperación corta) es aceptado explícitamente, consistente con NFR6 y con que los datos no están sujetos a un marco regulatorio formal (`feasibility-assessment`).

## Diseño: sin failover propio (NFR6.5)

Ninguna llamada saliente propia (`backend-api` no depende de otro servicio además de Neon) requiere un circuit breaker — el único punto de fallo externo es la base de datos, y una falla de conexión a Neon se propaga como un error 5xx estándar (interceptor de excepciones de NestJS), que el timeout de contrato de 10s (`contract-summary.md`) y la persistencia local del cliente (`mobile-app`, W7) ya absorben del lado del consumidor. No se diseña un mecanismo de retry automático de escritura en el servidor (reintentar una escritura fallida a ciegas podría duplicar un efecto si la escritura original sí llegó a completarse) — el patrón correcto es que el cliente reintente la petición completa, que ya es idempotente por `(vendorId, saleDate)` (NFR4.2).

## Resumen

| ID | Diseño |
|---|---|
| NFR6.2 | Sin warm-up activo; `GET /health` estándar (`@nestjs/terminus`) para que el hosting lo consulte a su propio ritmo |
| NFR6.3 | Cron diario (no solo mensual) que evalúa una condición de estado idempotente — auto-recupera cierres perdidos por un reinicio |
| NFR6.4 | Sin backup propio — depende del point-in-time recovery por defecto de Neon |
| NFR6.5 | Sin circuit breaker ni retry de escritura en servidor — el timeout de contrato + idempotencia de `(vendorId, saleDate)` ya cubren la falla temporal |
