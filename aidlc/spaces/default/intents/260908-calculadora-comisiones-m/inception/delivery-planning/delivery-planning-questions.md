# Delivery Planning — Questions

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:stories] `inception/user-stories/stories.md`
- [upstream:mockups] `inception/refined-mockups/mockups.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:unit-of-work-dependency] `inception/units-generation/unit-of-work-dependency.md`
- [upstream:unit-of-work-story-map] `inception/units-generation/unit-of-work-story-map.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:team-practices] `aidlc/spaces/default/memory/team.md`

## Contexto

Esta etapa planifica la secuencia de **Bolts** — cada Bolt es una porción de trabajo de Construction con Definition of Done, hipótesis de confianza (qué demuestra al construirse) y dueño propios; puede agrupar una o varias Unidades de 2.7, o cortar de forma delgada a través de ellas. La topología del DAG (2.7) ya está fija: `backend-api` y `mobile-app` dependen de `api-contract` y pueden avanzar en paralelo entre sí. Esta etapa decide el *orden económico* dentro de esa topología, no la topología misma.

`team.md` ya afirma **walking skeleton: sí** — construir primero una porción mínima de punta a punta (login → ingresar venta → ver comisión calculada) antes de construir cada funcionalidad completa, dado que React Native + NestJS + Neon es un stack nuevo para el equipo (Q2 de practices-discovery). El Bolt 0 de este plan implementa exactamente ese camino.

## Preguntas estratégicas

### Q1. ¿Qué construimos primero, más allá del walking skeleton ya afirmado?

A. Después del walking skeleton (Bolt 0), seguir con lo más riesgoso primero (venta offline y sincronización, notificaciones push) para descubrir problemas temprano
B. Después del walking skeleton, seguir con lo más valioso para el negocio primero (administración de roster/presupuesto/tramos, para que el supervisor pueda operar cuanto antes)
C. Mixto — administración básica primero (habilita datos reales para probar todo lo demás), luego lo riesgoso (offline, notificaciones), luego el resto
D. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: C. Mixto — administración básica primero (habilita datos reales para probar todo lo demás), luego lo riesgoso (offline, notificaciones), luego el resto.

### Q2. ¿Usamos un modelo formal de puntuación (WSJF-style) para ordenar los Bolts después del walking skeleton, o el orden mixto de Q1 basta sin puntuar cada Bolt numéricamente?

A. No hace falta puntuación formal — con 6 Bolts y un solo equipo, el orden mixto de Q1 (razonado por valor/riesgo/tamaño en prosa) es suficiente y más rápido de mantener
B. Sí, aplicar WSJF formal (valor de negocio + urgencia + reducción de riesgo, entre tamaño del trabajo) a cada Bolt
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: B. Sí, aplicar WSJF formal (valor de negocio + urgencia + reducción de riesgo, entre tamaño del trabajo) a cada Bolt.

### Q3. ¿Qué tamaño debe tener un Bolt?

A. Rebanadas delgadas que cruzan Unidades (backend + móvil juntos) cuando ambos lados de una funcionalidad deben demostrarse juntos — que es lo que ya exige el walking skeleton — y así para el resto de los Bolts también, para que cada uno termine en algo demostrable de punta a punta
B. Una Unidad de Work completa por Bolt (ej. un Bolt = todo backend-api, otro Bolt = todo mobile-app)
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Rebanadas delgadas que cruzan Unidades — cada Bolt termina en algo demostrable de punta a punta (backend + móvil juntos cuando ambos lados deben demostrarse juntos).

### Q4. ¿Los Bolts se construyen en paralelo o uno detrás de otro?

A. Uno detrás de otro (secuencial) — con un solo desarrollador (yo, la sesión de Claude) construyendo, no hay equipos paralelos reales; el paralelismo de 2.7 (backend-api / mobile-app) se aprovecha dentro de cada Bolt, no entre Bolts
B. Varios Bolts en paralelo, con distintos "mobs"/equipos
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Uno detrás de otro (secuencial) — un solo desarrollador construyendo; el paralelismo de 2.7 se aprovecha dentro de cada Bolt.

### Q5. ¿Hay algo fuera de este equipo que nos pueda bloquear (APIs externas, datos, aprobaciones, otro equipo)?

A. No — Neon (Postgres gratuito), Expo/EAS (build/distribución interna gratuita) y el servicio de push (Expo Push) son autoservicio, sin aprobación externa ni SLA de otro equipo; el único "externo" real es la aprobación manual de Carlos antes de producción (heredada de Deployment en team.md), que ya es parte del flujo normal de cada Bolt, no un bloqueo aparte
B. Sí, hay una dependencia externa (especificar cuál, quién la posee, cuánto tarda, a qué Bolt bloquea, y qué hacemos si se atrasa)
C. No estoy seguro
X. Other (please specify)

[Answer]: A. No — Neon, Expo/EAS y Expo Push son autoservicio; la aprobación manual de Carlos antes de producción ya es parte del flujo normal de cada Bolt.

### Q6. ¿Qué es lo que más te preocupa de esta construcción, para atacarlo temprano?

A. La sincronización de ventas sin conexión (offline) y el caso de borde de dos dispositivos con la misma fecha (ADR-004) — es la parte más nueva y con más riesgo de pérdida/duplicación de datos
B. Las notificaciones push (umbrales de venta/devolución) — que lleguen de forma confiable y sin duplicar avisos
C. El límite gratuito de Neon/Expo bajo uso real
D. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. La sincronización de ventas sin conexión (offline) y el caso de borde de dos dispositivos con la misma fecha — es la parte más nueva y con más riesgo de pérdida/duplicación de datos.

## Consolidated Summary Confirmation

- Walking skeleton (Bolt 0, ya afirmado en team.md): login → ingresar venta → ver comisión calculada, de punta a punta
- Después del skeleton: administración básica (roster/presupuesto/tramos) primero, luego lo riesgoso (offline, notificaciones), luego el resto
- Se aplica WSJF formal (valor de negocio + urgencia + reducción de riesgo, entre tamaño del trabajo) para puntuar y ordenar los Bolts posteriores al skeleton
- Bolts como rebanadas delgadas que cruzan Unidades, cada uno demostrable de punta a punta
- Construcción secuencial (un Bolt a la vez), un solo desarrollador (la sesión de Claude)
- Sin dependencias externas bloqueantes reales — Neon/Expo/EAS/Expo Push son autoservicio
- Mayor riesgo a atacar temprano: sincronización offline y el caso de dos dispositivos con la misma fecha

Does this all look correct before I generate the delivery-planning artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
