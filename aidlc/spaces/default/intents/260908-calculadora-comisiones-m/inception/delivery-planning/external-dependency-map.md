# Delivery Planning — External Dependency Map

## Sources

- [upstream:bolt-plan] `inception/delivery-planning/bolt-plan.md`
- [upstream:components] `inception/domain-design/components.md`

Confirmado en Q5 de `delivery-planning-questions.md`: no hay dependencias externas al equipo que bloqueen el plan. Las tres dependencias reales del sistema son de autoservicio, sin aprobación de otro equipo ni SLA externo formal. Este mapa queda liviano, como corresponde a un proyecto contenido enteramente por este equipo.

## Dependencias externas

| Dependencia | Dueño | Tiempo de aprovisionamiento | Bolt(s) que la consumen | Qué hacemos si se atrasa |
|---|---|---|---|---|
| PostgreSQL gestionado (Neon, capa gratuita) | Autoservicio (cuenta propia del proyecto) | Minutos — creación de proyecto/base de datos vía consola web | Bolt 0 en adelante (todos — es la base de datos de `backend-api`) | No hay atraso esperado; si la capa gratuita alcanza su límite, evaluar upgrade pago puntual (excepción documentada al mandato de "priorizar capas gratuitas" en `project.md`) |
| Expo/EAS (build y distribución interna) | Autoservicio (cuenta propia del proyecto) | Minutos a ~1 hora por build (cola de EAS Build en capa gratuita) | Bolt 0 en adelante (todos — es el mecanismo de distribución de `mobile-app`) | Los tiempos de cola de EAS Build gratuito pueden variar; no bloquea el desarrollo, solo la entrega del build a Carlos para probar en dispositivo — se planifica un build por Bolt, no por commit |
| Servicio de push notifications (Expo Push, sobre FCM/APNs) | Autoservicio (vía Expo, sin cuenta separada de Google/Apple necesaria para push interno) | Minutos — configuración de credenciales de push en el proyecto Expo | Bolt 3 (primer uso, envío manual) y Bolt 4 (uso automático de umbrales) | No hay atraso esperado dado el alcance interno (sin publicación en tiendas públicas, Q3 de units-generation) |

## No hay consumidor ni proveedor externo al equipo

- No hay integración con sistemas de TIOSA S.A. / Grupo Bimbo más allá de este proyecto (confirmado también en Q1 de `contract-design-questions.md`: el único consumidor de la API es `mobile-app`).
- La aprobación manual de Carlos Puma antes de producción (heredada de `team.md`, Deployment) es un paso del propio equipo en cada Bolt, no una dependencia de "otro equipo" — se documenta en `team-allocation.md`, no aquí.
