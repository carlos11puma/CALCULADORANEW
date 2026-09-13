# Delivery Planning — Risk and Sequencing Rationale

## Sources

- [upstream:bolt-plan] `inception/delivery-planning/bolt-plan.md`
- [upstream:unit-of-work-dependency] `inception/units-generation/unit-of-work-dependency.md`

## Heurística utilizada

Combina dos modelos, en dos capas de decisión distintas:

1. **Walking skeleton (Cockburn)** decide qué va primero, sin puntuar: el Bolt 0 siempre encabeza la secuencia porque `team.md` ya lo afirmó explícitamente (Q2 de practices-discovery) — React Native + NestJS + Neon es un stack nuevo para el equipo, y probar la integración de punta a punta antes de construir cualquier funcionalidad completa reduce el riesgo de descubrir un problema de integración tarde, cuando ya hay varias funcionalidades construidas sobre una base que no se validó.
2. **WSJF (Reinertsen / SAFe)** ordena todo lo que viene después del skeleton: cada Bolt recibe una puntuación `(Valor de negocio + Urgencia + Reducción de riesgo) ÷ Tamaño del trabajo`, cada componente en una escala de 1 a 10 estimada por el arquitecto y el líder de entrega en conjunto. Mayor puntaje se construye antes.

## Puntuación WSJF por Bolt

| Bolt | Valor de negocio | Urgencia | Reducción de riesgo | Tamaño | WSJF |
|---|---|---|---|---|---|
| 1 — Roster y presupuesto | 8 | 6 | 3 | 5 | **3.4** |
| 2 — Tramos + venta offline | 7 | 5 | 9 | 8 | **2.625** |
| 3 — Notificación manual | 5 | 3 | 2 | 3 | **3.33** |
| 4 — Notificaciones automáticas | 7 | 6 | 5 | 6 | **3.0** |
| 5 — Historial y cierre | 6 | 4 | 4 | 5 | **2.8** |

Orden por puntaje puro (mayor a menor): Bolt 1 (3.4) → Bolt 3 (3.33) → Bolt 4 (3.0) → Bolt 5 (2.8) → Bolt 2 (2.625).

## Desviación deliberada: Bolt 2 se adelanta a su puntaje

El plan **no** sigue el orden WSJF puro. El Bolt 2 (tramos configurables + venta sin conexión) tiene el puntaje crudo más bajo del grupo (2.625) — principalmente porque su tamaño de trabajo (8) es el mayor del plan, dado que la sincronización offline es la pieza más nueva y compleja del sistema — pero el usuario identificó explícitamente, en la pregunta de mayor riesgo de `delivery-planning-questions.md` (Q6), que la sincronización de ventas sin conexión y el caso de dos dispositivos con la misma fecha (ADR-004 de Domain Design) es lo que más le preocupa de esta construcción. Esta señal explícita de un humano con el contexto del negocio pesa más que el puntaje agregado de un modelo, así que el plan mueve el Bolt 2 a la posición 3 (justo después de la administración básica del Bolt 1, que habilita datos reales para probarlo) en vez de dejarlo al final como indicaría el WSJF puro.

Esto es exactamente el tipo de desviación que la etapa de Delivery Planning permite explícitamente: "el orden de los Bolts puede desviarse del orden topológico de 2.7 cuando un argumento de riesgo-primero o walking-skeleton-primero lo justifica" — aquí el argumento es riesgo-primero, afirmado directamente por el usuario, no inferido.

El resto del plan (Bolts 3, 4, 5) sigue el orden WSJF puro sin desviaciones adicionales: Bolt 3 (3.33) antes de Bolt 4 (3.0) antes de Bolt 5 (2.8) — que además tiene sentido técnico, porque el Bolt 3 prueba el canal de entrega de push (Expo Push) con el caso más simple de `NotificationComponent` (envío manual, sin lógica de umbrales) antes de que el Bolt 4 construya la detección automática de umbrales sobre ese mismo canal ya validado.

## Consistencia con el DAG de 2.7

`unit-of-work-dependency.md` fija la topología: `backend-api` y `mobile-app` dependen de `api-contract`; no hay borde directo entre `backend-api` y `mobile-app`. Ningún Bolt de este plan viola esa topología — cada Bolt que toca `backend-api` y/o `mobile-app` asume que la porción correspondiente de `api-contract` para esa funcionalidad ya está definida (Contract Design, 2.8, ya cubrió los 6 componentes de dominio completos), y ningún Bolt hace que `mobile-app` consuma un endpoint que su propio Bolt no construye en `backend-api` en la misma pasada. La secuencia es una decisión económica dentro de esa topología, no una redefinición de ella — consistente con la nota de alcance de esta etapa.

## Riesgos no cubiertos por la secuencia (quedan como vigilancia continua)

- **ADR-004 (Domain Design)**: el caso de dos dispositivos del mismo vendedor editando la misma fecha mientras ambos están offline no tiene una regla de resolución exacta definida todavía (queda para Functional Design, según el hallazgo #2 heredado de Units Generation y el Open Question #2 de Contract Design). El Bolt 2 prueba el camino de sincronización normal (un dispositivo, offline, luego online) pero **no** resuelve ese caso de borde específico — Functional Design debe confirmarlo antes de que el Bolt 2 se dé por completamente cerrado, y su Definition of Done en `bolt-plan.md` no lo incluye como criterio de aceptación todavía.
- **Límites de capas gratuitas** (Neon, Expo/EAS, Expo Push): no bloquean ningún Bolt (ver `external-dependency-map.md`), pero conviene vigilar el consumo real una vez que Bolts 2-4 generen tráfico de sincronización y notificaciones con datos reales de ~26 rutas.
