# Infrastructure Design — mobile-app — Diseño de Monitoreo

## Sources

- [upstream:infrastructure-specification] `construction/mobile-app/infrastructure-design/infrastructure-specification.md`

## Métricas y KPIs

| Métrica | Fuente | Uso |
|---|---|---|
| Builds/actualizaciones publicadas | Dashboard nativo de EAS (Expo) | Verificar que cada release llegó a producción sin fallas de build |
| Adopción de actualizaciones OTA | Dashboard nativo de EAS Update | Confirmar que los dispositivos activos están recibiendo la última versión publicada |
| Crashes de la app | Ninguna herramienta dedicada en el MVP (fuera de alcance, mismo criterio de costo mínimo que `backend-api`) | N/A — riesgo aceptado explícitamente, ver Assumptions |

## Alertas

Ninguna alerta automatizada configurada en el MVP — el volumen de uso (~26 rutas) y la ausencia de una plataforma de monitoreo paga hacen que la detección de problemas dependa de que Carlos u otro vendedor reporte un fallo directamente, igual que con la herramienta actual de un solo dispositivo que esta app reemplaza.

## SLIs/SLOs

Ninguno definido — consistente con la decisión ya tomada en `backend-api`'s `observability-design.md` (NFR6.9, "no SLI/SLO formal en el MVP"); `mobile-app` hereda el mismo criterio de alcance.

## Logs y Tracing

- Ningún servicio de logging remoto de errores del cliente (ej. Sentry) en el MVP — mismo criterio de costo mínimo.
- El `console.error` de desarrollo se mantiene solo para depuración local durante Code Generation/Build and Test; no se envía a ningún backend de logs.

## Assumptions & Open Questions

- [assumption] La ausencia de crash reporting es un riesgo aceptado explícitamente para el MVP, dado el presupuesto mínimo/gratuito del proyecto (heredado de `project.md`) — revisar si el volumen de vendedores crece significativamente más allá de las ~26 rutas esperadas.
