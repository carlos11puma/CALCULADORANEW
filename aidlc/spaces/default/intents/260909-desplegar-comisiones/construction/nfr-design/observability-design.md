# NFR Design — Despliegue a Producción — Observability Design

## Sources

- [upstream:observability-requirements] `construction/nfr-requirements/observability-requirements.md`
- [upstream:observability-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/observability-design.md` (logging estructurado, correlation ID — ya diseñados, no se rediseñan aquí)
- [upstream:nfr-design-questions] `nfr-design-questions.md` (Q1)

Breve por diseño, consistente con la exclusión de alcance ya afirmada (`observability-requirements.md`): no se agrega ninguna plataforma de monitoreo ni dashboard nuevo. Este documento diseña únicamente cómo se activan y a quién llegan las señales nativas de Render/EAS/GitHub Actions ya decididas.

## Diseño: activación de notificaciones nativas (deriva de NFR-D13)

- **Render**: en la configuración del servicio `backend-api-production`, activar la notificación por email "Deploy failed" (ajuste nativo del dashboard, sin webhook ni integración propia) a la cuenta de Carlos.
- **GitHub Actions**: sin configuración adicional — GitHub ya envía notificación por email al dueño del repositorio (Carlos) cuando un workflow falla, según su configuración de cuenta por defecto; Carlos confirma que esa opción está activa en su configuración de notificaciones de GitHub antes del primer despliegue.
- Cada fuente notifica de forma independiente — no se agrega un paso de workflow que consolide ambas en un solo correo (Q2 de `nfr-requirements`).

## Diseño: acceso a los logs (deriva de NFR-D14)

El panel de logs de Render (`backend-api-production`/`backend-api-staging` por separado) y el panel de EAS (build/telemetry de producción) son las únicas fuentes de logging — ambas ya visibles por defecto en las cuentas que Carlos crea (FR2), sin agregador externo. El acceso a ambos paneles queda limitado a la cuenta de Carlos (mismo alcance que el RBAC de infraestructura de `security-design.md`).

## Diseño: visibilidad del cron de cierre mensual bajo cold start (deriva de Q1)

Dado que Carlos aceptó el riesgo de retraso del cron sin mitigación técnica (`reliability-design.md`), el log dedicado que el job de cierre ya emite en cada ejecución (`260908` NFR6.8: `{ event: "monthly-close", startedAt, periodsClosedCount, periodsCreatedCount }`) es la única señal disponible para confirmar, revisando el panel de logs de Render, que el cierre efectivamente corrió — no se agrega ninguna alerta activa sobre su ausencia; su revisión, si Carlos alguna vez quisiera confirmarlo, sería una consulta manual del panel de logs, no un paso de este despliegue.

## Resumen

| ID | Diseño |
|---|---|
| NFR-D13.1-D13.3 | Notificación "Deploy failed" activada en Render; notificación por defecto de GitHub confirmada activa |
| NFR-D14.1-D14.3 | Paneles de Render/EAS, sin agregador, acceso limitado a Carlos |
| — (Q1) | El log dedicado del cron de cierre (`260908`) es la única señal de que corrió, sin alerta activa |
