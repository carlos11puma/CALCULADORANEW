# Infrastructure Design — backend-api — Monitoring Design

## Sources

- [upstream:observability-design] `construction/backend-api/nfr-design/observability-design.md`
- [upstream:infrastructure-specification] `construction/backend-api/infrastructure-design/infrastructure-specification.md`

Implementación concreta, sobre Render + GitHub Actions, de la estrategia que `observability-design.md` (NFR Design) ya definió: logging estructurado a stdout, sin plataforma de monitoreo de pago, sin SLI/SLO formales en el MVP.

## Metrics & KPIs

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Uso de memoria del proceso | Métricas nativas del dashboard de Render (incluidas en el free tier) | Alerta informal si se acerca al límite de 512MB del plan free | Un proceso que se queda sin memoria se reinicia — impacta la disponibilidad ya de por sí sin SLA (`reliability-design.md` NFR6.2) |
| Estado del deploy (éxito/fallo) | Notificación nativa de Render por email al completar cada deploy | N/A — binario | Es la única señal de que un despliegue a producción falló, dado que no hay plataforma de monitoreo externa |
| Duración del job de cierre mensual | Log estructurado propio (`observability-design.md` NFR6.8), leído manualmente en el panel de logs de Render | N/A — revisión manual mensual por Carlos, no automatizada | Confirma que el cierre de período corrió — sin esto no habría forma de saber si `@nestjs/schedule` falló silenciosamente |

## Alerts

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Deploy fallido | El build o el health check post-deploy de Render falla | Alta | Email nativo de Render a Carlos (único desarrollador/supervisor) |
| Servicio caído (health check) | `GET /health` no responde exitosamente por más del umbral configurado en Render | Alta | Email nativo de Render |

No se configuran alertas basadas en métricas de negocio (ej. "tasa de error > X%") en el MVP — consistente con NFR6.9 de `observability-design.md` (sin SLI/SLO formales); los dos alerts de arriba son los que la plataforma de hosting ya ofrece sin costo ni configuración adicional.

## SLIs / SLOs

Ninguno definido formalmente en el MVP (NFR6.9 de `observability-design.md`) — decisión de alcance explícita, no un hueco. Si el volumen de uso crece, este documento es el lugar donde se agregarían al incorporar una plataforma de monitoreo (ej. tiempo de respuesta p95, tasa de error).

## Logs & Tracing

- **Agregación de logs**: el panel de logs nativo de Render captura `stdout`/`stderr` de ambos servicios (staging/producción) por separado, con retención del tier gratuito (típicamente unas pocas horas a días) — suficiente para depuración manual reactiva a este volumen, sin necesidad de un agregador externo.
- **Trazado distribuido**: no aplica — `backend-api` es un único proceso sin llamadas a otros servicios propios (solo a Neon), por lo que no hay una cadena de llamadas entre servicios que trazar (`logical-components.md`: todos los módulos comparten el mismo proceso).
- **Correlación de logs dentro de un mismo request**: el `correlationId` que `observability-design.md` (NFR6.7) ya diseña permite, dentro del panel de logs de Render, filtrar manualmente todas las líneas de un mismo request — sin herramienta de trazado dedicada, dado el volumen.
- **Dashboards**: ninguno propio — se usa el dashboard nativo de Render (memoria, CPU, estado de deploy) sin construir uno adicional.
