# NFR Requirements — backend-api — Reliability Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:rules] `construction/backend-api/functional-design/rules.md`
- [upstream:decisions] `inception/domain-design/decisions.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`

## NFR6 — Costo de infraestructura, en su dimensión de disponibilidad (inception: "operar dentro de las capas gratuitas... mientras el volumen de uso se mantenga en el rango esperado")

- **NFR6.2**: no se fija un SLA de disponibilidad 24/7 para el MVP — se acepta y documenta explícitamente el riesgo de "cold start" (latencia elevada del primer request tras un período de inactividad) propio de un hosting gratuito (Q6 de `nfr-requirements-questions.md`). NFR1 (rendimiento) se mide sobre peticiones en caliente, excluyendo explícitamente ese primer request.
- **NFR6.3**: el job de cierre mensual (`@nestjs/schedule`, BR4.5) corre in-process — si el servicio estuviera caído en el instante exacto de disparo (ej. reinicio del proceso a medianoche), el riesgo se mitiga porque BR4.5 evalúa una condición de estado ("existe un `CommissionPeriod` vigente para el mes que ya terminó"), no un evento puntual: cualquier ejecución posterior del job (el siguiente tick programado, o el arranque del proceso si se configura una verificación adicional al iniciar) detecta y cierra los períodos vencidos que quedaron pendientes, sin duplicar el cierre de uno que ya se marcó `closed=true`. Se recomienda que Code Generation programe el cron con una frecuencia diaria (no solo "al final del mes") para acotar la ventana de exposición a horas, no días, ante un reinicio coincidente.
- **NFR6.4**: no se requiere una estrategia de respaldo/recuperación (backup/restore) más allá de la que Neon provee por defecto en su tier gratuito (point-in-time recovery de corto alcance) — consistente con NFR6 (priorizar capas gratuitas) y con el volumen/criticidad de los datos (comisión de ventas, no datos financieros regulados — `feasibility-assessment` ya estableció que no aplica un marco regulatorio formal).

## Degradación controlada

- **NFR6.5**: si Neon o el proceso del backend no responden dentro del timeout de contrato (10s, `contract-summary.md`), la respuesta (o su ausencia) ya está cubierta del lado de `mobile-app` como "sin conexión" (W7 de `mobile-app`, fuera del alcance de esta unidad) — `backend-api` no necesita un mecanismo de failover propio en el MVP; el diseño de reintento del cliente es lo que absorbe la falla temporal del servidor.

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR6.2 | Sin SLA 24/7 — cold start del tier gratuito aceptado y documentado | NFR6 / Q6 |
| NFR6.3 | Job de cierre mensual auto-recupera períodos vencidos ante un reinicio coincidente | ADR-005 / BR4.5 |
| NFR6.4 | Backup/restore por defecto de Neon, sin estrategia adicional | NFR6 |
| NFR6.5 | Sin failover propio — el timeout de contrato (10s) y la persistencia local del cliente absorben la falla temporal | contract-summary.md |
