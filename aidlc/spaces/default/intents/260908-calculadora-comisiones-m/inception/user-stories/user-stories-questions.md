# User Stories — Story Plan & Questions

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:team-practices] `inception/practices-discovery/team-practices.md`

## Persona Development Approach (propuesta)

Dos personas primarias, derivadas de FR1 y del roster de ~26 rutas:

1. **Vendedor** — preventista o autoventa, ingresa venta diaria en campo, consulta su comisión y recibe notificaciones. Meta: saber en todo momento cuánto está ganando y qué le falta para el siguiente umbral.
2. **Supervisor (Carlos)** — administra roster, presupuestos y tramos; envía notificaciones manuales; aprueba con PIN. Meta: que su equipo tenga visibilidad diaria sin depender de un archivo centralizado.

## Story Format

Formato estándar INVEST: "Como [persona], quiero [objetivo], para [beneficio]", con criterios de aceptación en Given/When/Then (heredado de `phases/inception.md` — User Stories).

## Story Prioritization

MoSCoW por historia, informado por los FR/NFR de requirements.md. La frontera del MVP se decide formalmente en Delivery Planning; esta priorización es una señal de entrada, no la decisión final.

## Breakdown Approach (propuesta)

Por área funcional (alineado a los grupos FR1–FR9 de requirements.md): Autenticación y roles, Administración, Ingreso de venta, Cálculo y reporte de comisión, Historial, Notificaciones de venta/presupuesto, Notificaciones de devolución, Notificaciones manuales.

## Q1. ¿El vendedor de canal autoventa necesita una persona/historias separadas del preventista, dado que su tramo de comisión se calcula distinto (por devolución vs. por efectividad)?

A. No, una sola persona "Vendedor" cubre ambos canales; la diferencia de cálculo se refleja en las historias de FR4/FR8, no en la persona
B. Sí, dos personas separadas (Vendedor Preventa / Vendedor Autoventa)
C. No estoy seguro
X. Other (please specify)

[Answer]: C. No estoy seguro — el usuario pidió una propuesta razonable. Se propone A: una sola persona "Vendedor" cubre ambos canales (preventa y autoventa); el canal es un atributo del vendedor (heredado de FR2.1), y la diferencia de cálculo de comisión por canal se refleja en las historias de FR4 (cálculo) y FR8 (devolución), no como personas separadas. Esto evita duplicar historias que en realidad comparten el mismo flujo de UI.

## Q2. ¿Qué nivel de granularidad prefieres para las historias?

A. Una historia por cada sub-requisito (FR{n}.{m}) — más historias, más trazabilidad fina
B. Una historia por grupo funcional (FR{n}) — menos historias, más amplias
C. Mixto: granularidad fina donde hay lógica de negocio compleja (cálculo de comisión, notificaciones), gruesa donde es simple (login, historial)
X. Other (please specify)

[Answer]: C. Mixto — granularidad fina en cálculo de comisión y notificaciones (FR4, FR7, FR8), más gruesa en login, historial y administración simple.

## Q3. ¿Las historias del panel de administración (FR2, FR9) deben cubrir tanto el "camino feliz" como los errores de validación (ej. tramos mal configurados, presupuesto negativo)?

A. Sí, incluir casos de error explícitamente en los criterios de aceptación
B. Solo camino feliz; los casos de error se detallan después en Domain/Functional Design
C. Depende de la historia — decide caso por caso
X. Other (please specify)

[Answer]: C. Depende de la historia — se incluyen casos de error donde ya hay una regla de negocio conocida (ej. validación de venta de FR3.2, orden de tramos de FR8.3); se difieren a Domain/Functional Design los casos aún no definidos (ej. conflictos de sincronización offline).

## Follow-up (Triage de objeción del mob — Round 1)

### Q4. Bandeja de notificaciones dentro de la app

El diseñador (aidlc-design-agent) objetó que, con hasta 12 notificaciones automáticas por período (US7 + US8) más las manuales (US9), el vendedor necesita una forma de consultar sus notificaciones dentro de la app, no solo depender del push del sistema operativo (que puede perderse si el dispositivo estaba apagado o el permiso denegado).

A. Sí, agregar una historia nueva (US10) de "bandeja de notificaciones" dentro de la app
B. No, el push del sistema operativo es suficiente para el MVP; se puede agregar después si hace falta
C. Agregarlo pero como parte de US5 (reporte del vendedor), no como historia separada
X. Other (please specify)

[Answer]: B. No por ahora — el push del sistema operativo es suficiente para el MVP dado el costo adicional; se puede agregar después si se detecta que hace falta. La objeción del diseñador queda registrada como riesgo aceptado (Out of Scope de esta etapa), no resuelta.

## Consolidated Summary Confirmation

- Dos personas: Vendedor (una sola, cubre preventa y autoventa) y Supervisor (Carlos)
- Formato INVEST con criterios Given/When/Then
- Priorización MoSCoW informativa (no decide el MVP)
- Desglose por área funcional alineado a FR1–FR9
- Granularidad mixta: fina en cálculo de comisión y notificaciones (FR4, FR7, FR8), gruesa en login/historial/administración simple
- Casos de error incluidos donde ya hay regla de negocio conocida; diferidos a Domain/Functional Design donde aún no está definida
- Triage del mob (Round 1): se incorporó AC3.3.4 (pérdida de conexión a mitad de guardado) y una nota de Delivery Planning sobre dividir US3.3 en Bolts; la objeción de diseño sobre una bandeja de notificaciones dentro de la app se decidió "No por ahora" (riesgo aceptado, no resuelto)

Does this all look correct before I generate the stories and personas?

- Looks correct
- Request changes

[Answer]: Looks correct
