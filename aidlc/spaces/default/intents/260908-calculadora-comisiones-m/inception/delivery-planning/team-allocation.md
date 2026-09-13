# Delivery Planning — Team Allocation

## Sources

- [upstream:bolt-plan] `inception/delivery-planning/bolt-plan.md`

Team Formation (1.5) no se ejecutó en este proyecto — es una etapa `SKIP` para el alcance `mvp` (solo corre en `enterprise`/`feature`). Sin equipos de 1.5 que referenciar, todos los Bolts los ejecuta `aidlc-developer-agent` (IA) en esta misma sesión, con Carlos Puma como único revisor humano y responsable de cada puerta de aprobación.

Con un solo "mob" para los 7 Bolts, no hay tablero de Program Board que coordinar entre equipos — esta tabla es la referencia de asignación.

## Asignación por Bolt

| Bolt | Mob | Rol humano |
|---|---|---|
| 0 — Walking Skeleton | `aidlc-developer-agent` | Carlos Puma: aprueba antes de que continúe el resto del plan (puerta propia del skeleton) |
| 1 — Roster y presupuesto | `aidlc-developer-agent` | Carlos Puma: revisor y aprobador de la puerta del Bolt |
| 2 — Tramos + venta offline | `aidlc-developer-agent` | Carlos Puma: revisor y aprobador de la puerta del Bolt |
| 3 — Notificación manual | `aidlc-developer-agent` | Carlos Puma: revisor y aprobador de la puerta del Bolt |
| 4 — Notificaciones automáticas | `aidlc-developer-agent` | Carlos Puma: revisor y aprobador de la puerta del Bolt |
| 5 — Historial y cierre | `aidlc-developer-agent` | Carlos Puma: revisor y aprobador de la puerta del Bolt |
| 6 — Cierre de sesión + accesibilidad | `aidlc-developer-agent` | Carlos Puma: revisor y aprobador de la puerta del Bolt |

## Aprobación de producción

Independiente de qué Bolt se construya, el despliegue a producción de cualquier cambio requiere la aprobación manual de Carlos Puma como supervisor (heredado de `team.md`, Deployment) — esta es una puerta recurrente por cada integración a `main` que llega a producción, no una asignación de equipo distinta por Bolt.
