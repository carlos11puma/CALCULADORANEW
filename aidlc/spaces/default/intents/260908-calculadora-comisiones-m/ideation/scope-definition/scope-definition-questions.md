# Scope Definition & Prioritization — Questions

## Sources

- [upstream:intent-statement] `ideation/intent-capture/intent-statement.md` — Problem Statement, Target Customer, Success Metrics, Initial Scope Signal (`mvp`).
- [upstream:feasibility-assessment] `ideation/feasibility/feasibility-assessment.md` — Technical Viability, Risk Analysis.
- [upstream:constraint-register] `ideation/feasibility/constraint-register.md` — stack fijo (React Native/NestJS/Neon), presupuesto mínimo/gratuito, sin bloqueadores organizacionales.

## Correction to Intent Capture

El usuario precisó, en conversación posterior a la aprobación de Intent Capture, que el supuesto `[assumption]` de que "los vendedores solo consultan, no editan" queda **superado**: los vendedores deben **ingresar su venta diaria** para que el sistema calcule y les muestre cuánto van ganando. Esta precisión se registra aquí como la fuente de verdad vigente para Scope Definition y las etapas siguientes; `intent-statement.md` conserva su texto original como registro histórico de la etapa 1.1, con una nota de corrección añadida.

## Q1. ¿Cuál es el alcance mínimo que entrega valor (MVP)?

A. Vendedor ingresa su venta diaria; el sistema calcula la comisión según tramos y se la muestra en un reporte individual (venta acumulada vs. presupuesto + comisión ganada, en tiempo real); el supervisor administra roster/presupuestos/tramos vía PIN de admin (heredado de la app actual)
B. Lo anterior, más notificaciones automáticas (ej. cuando un vendedor está por alcanzar su meta)
C. Not yet defined
X. Other (please specify)

[Answer]: B. Lo anterior (ingreso de venta diaria + cálculo + reporte individual + administración por PIN) más notificaciones automáticas.

## Q2. De las capacidades identificadas, ¿cuáles son must-have para el lanzamiento y cuáles nice-to-have?

A. Roster/presupuestos/tramos por PIN admin — must-have
B. Ingreso de venta diaria por vendedor — must-have
C. Historial/reportes de períodos anteriores — must-have
D. Notificaciones push — must-have
X. Other (please specify)

[Answer]: A, B, C y D — las cuatro capacidades son must-have para el lanzamiento del MVP.

## Q3. ¿Cuáles son las dependencias entre capacidades?

A. El ingreso de venta diaria (B) depende de que exista el roster/presupuestos/tramos (A) ya cargados, porque el cálculo de comisión necesita el tramo y presupuesto asignado a cada vendedor
B. El historial (C) depende de que el ingreso de venta diaria (B) esté funcionando y acumulando datos
C. Las notificaciones (D) dependen del cálculo de comisión (que depende de A y B)
X. Other (please specify)

[Answer]: A, B y C confirmadas — la secuencia de dependencia técnica es: administración (A) → ingreso de venta y cálculo (B) → historial (C) y notificaciones (D), ambas derivadas de B.

## Q4. ¿Cuál es la preferencia de secuenciación (riesgo primero, valor primero, dependencia primero)?

A. Dependencia primero — construir en el orden que exige la cadena técnica (A → B → C/D), ya que es también el orden de valor incremental para el usuario
B. Valor primero, sin importar el orden de dependencia
C. Riesgo primero (atacar lo más incierto técnicamente antes)
X. Other (please specify)

[Answer]: A. Dependencia primero — coincide con el orden de valor.

## Q5. ¿Hay fechas límite duras atadas a alguna capacidad?

A. No hay fecha límite fija
B. Sí (especificar)
X. Other (please specify)

[Answer]: A. No hay fecha límite fija.

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
