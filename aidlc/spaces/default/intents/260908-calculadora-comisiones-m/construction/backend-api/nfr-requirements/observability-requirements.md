# NFR Requirements — backend-api — Observability Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`
- [upstream:security-requirements] `construction/backend-api/nfr-requirements/security-requirements.md`

## NFR6 — Costo de infraestructura, en su dimensión de observabilidad

- **NFR6.6**: logging estructurado (JSON) vía el `Logger` nativo de NestJS a `stdout` — sin una plataforma de monitoreo/alertas de terceros en el MVP (Q5 de `nfr-requirements-questions.md`), consistente con priorizar capas gratuitas. El hosting gratuito objetivo ya captura `stdout`, por lo que no se requiere infraestructura de logging adicional.
- **NFR6.7**: cada request a un endpoint autenticado registra, como mínimo: método + ruta, `userId` (no el token ni ningún dato de credencial — NFR3.13), código de respuesta, y duración en milisegundos. Cada error (4xx/5xx) registra además el código de error del contrato (`Error.code`, `contract-summary.md`) y un identificador de correlación de la petición, para poder rastrear un incidente reportado por un vendedor o por Carlos sin necesitar una plataforma externa.
- **NFR6.8**: el job de cierre mensual (BR4.5) registra explícitamente su ejecución (inicio, cantidad de `CommissionPeriod` cerrados, cantidad de períodos nuevos creados) — es el único proceso sin una petición HTTP asociada, por lo que sin este log no habría forma de confirmar que corrió (relevante para NFR6.3 de `reliability-requirements.md`, que depende de que una ejecución posterior pueda detectar períodos vencidos).
- **NFR6.9**: no se definen SLI/SLO formales en el MVP (consistente con NFR6.2 de `reliability-requirements.md` — sin SLA 24/7) — el log estructurado de NFR6.7 es la única fuente de observabilidad; si el volumen de uso crece más allá del rango esperado (NFR6 de inception), definir SLI/SLO e incorporar una plataforma de monitoreo queda como trabajo futuro explícito, no como un hueco de este MVP.

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR6.6 | Logging estructurado a stdout vía Logger nativo de NestJS, sin plataforma de pago | NFR6 / Q5 |
| NFR6.7 | Campos mínimos por request/error, sin datos de credencial | NFR3.13 |
| NFR6.8 | El job de cierre mensual registra su propia ejecución | NFR6.3 de reliability-requirements.md |
| NFR6.9 | Sin SLI/SLO formales en el MVP | NFR6.2 de reliability-requirements.md |
