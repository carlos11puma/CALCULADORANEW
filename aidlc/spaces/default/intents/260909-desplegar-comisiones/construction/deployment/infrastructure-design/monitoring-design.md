# Infrastructure Design — Despliegue a Producción — Monitoring Design

## Sources

- [upstream:observability-design] `construction/nfr-design/observability-design.md`
- [upstream:monitoring-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/monitoring-design.md` (sin SLIs/SLOs formales, sin dashboard nuevo — decisión ya afirmada, no se reabre)
- [contexto] `nfr-design/reliability-design.md` (smoke test, rollback)

Este documento no introduce ninguna plataforma de monitoreo nueva — formaliza, a nivel de los dos ambientes reales (`staging`/`production`), las señales ya diseñadas en `nfr-design/observability-design.md`.

## Metrics & KPIs

| Métrica | Origen | Ambiente | Uso |
|---|---|---|---|
| Estado de despliegue (éxito/fallo) | Notificación nativa de Render por servicio | Ambos (`backend-api-staging`, `backend-api-production`) | Confirmación inmediata de que el contenedor arrancó y pasó el health check |
| Duración del cron de cierre mensual | Log dedicado (`260908`, NFR6.8) | Solo `production` (el cron de negocio real corre contra Neon `main`) | Único signal de si el cierre mensual corrió a tiempo (riesgo de cold start aceptado en `nfr-design` Q1) |
| Uso de memoria del servicio | Panel nativo de Render (informal, sin alerta configurada) | Ambos | Visibilidad manual del techo del free tier (`nfr-design/scalability-design.md`) |
| Resultado de `npm audit` | `dependency-audit.yml` (matrix por workspace) | N/A (corre sobre el repo, no por ambiente) | Ver `cicd-pipeline.md` — pasa de solo-informativo a required check |

## Alerts

| Condición | Canal | Ambiente | Acción esperada de Carlos |
|---|---|---|---|
| Deploy failed | Email nativo de Render (checkbox "Notify on failed deploys" activado por servicio) | Ambos | Revisar el log de build/deploy de ese servicio; no se considera el ambiente actualizado hasta resolver |
| Falla del required status check (`dependency-audit.yml`, tras `cicd-pipeline.md`) | Notificación nativa de GitHub Actions (email, ya confirmada activa) | N/A | El merge a `main` queda bloqueado hasta que Carlos decida actualizar la dependencia o (si aplica) documentar una excepción explícita |
| Health check down (`/api/v1/health`) | Render marca el servicio como unhealthy en su dashboard — sin canal de push adicional en el free tier | Ambos | Revisión manual periódica del dashboard de Render; no hay alerta activa fuera de la sesión — limitación aceptada del free tier, ya documentada en `260908` |

## SLIs / SLOs

Sin SLIs/SLOs formales — decisión ya afirmada en `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/monitoring-design.md` y no reabierta aquí: el volumen de uso (~26 vendedores, app interna) no justifica la inversión en medición formal de disponibilidad. El único compromiso de continuidad operativa es el smoke test post-despliegue de `nfr-design/reliability-design.md` (login + venta de prueba), no un SLO medido en el tiempo.

## Logs & Tracing

- **Backend**: panel de logs nativo de Render, por servicio (`backend-api-staging` y `backend-api-production` tienen paneles separados — no hay mezcla de logs entre ambientes). Sin tracing distribuido: proceso único, sin necesidad justificada (heredado de `260908`).
- **Mobile**: panel de telemetría/crash de EAS (`expo.dev`), separado por canal (`preview` vs `production`).
- **Correlación manual**: el `correlationId` ya diseñado en `260908` permite filtrar manualmente un flujo específico dentro del log de Render cuando Carlos necesita investigar un caso puntual — no hay dashboard de agregación nuevo.
- **Verificación de logs sin datos sensibles** (NFR-D7, deriva de `nfr-design/security-design.md`): la búsqueda de texto (`Bearer `, `JWT`, `DATABASE_URL`, `postgres://`, montos junto a nombre de vendedor) se ejecuta en estos mismos dos paneles (Render `production` + EAS `production`) como parte del smoke test — no requiere una herramienta de scrubbing automatizado nueva.

## Acceso a logs y paneles

Consistente con `project.md` § Mandated (RBAC de infraestructura): el acceso a ambos paneles de Render y al panel de EAS queda limitado a la cuenta de Carlos — no se invitan colaboradores adicionales en este primer despliegue.
