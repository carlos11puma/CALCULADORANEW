# Scope Document — Calculadora de Comisiones (MVP)

## In Scope (MVP)

1. **Administración de roster/presupuestos/tramos** — el supervisor gestiona rutas, vendedores, canal (preventa/autoventa), presupuestos y tramos de comisión variable, protegido por PIN de administrador (funcionalidad heredada de la app web actual). [Q1][Q2]
2. **Ingreso de venta diaria** — cada vendedor ingresa su venta del día desde la app móvil. [Q1][Q2]
3. **Cálculo de comisión** — el sistema calcula la comisión acumulada según los tramos configurados, a partir de las ventas ingresadas. [Q1][Q2]
4. **Reporte individual en tiempo real** — cada vendedor ve su venta acumulada vs. presupuesto y su comisión ganada hasta la fecha, actualizado con cada venta ingresada. [Q1][Q2]
5. **Historial de períodos anteriores** — consulta de comisiones y ventas de períodos ya cerrados. [Q2]
6. **Notificaciones push** — avisos automáticos (p. ej., cercanía a una meta). [Q1][Q2]

## Out of Scope (MVP)

- Integración con sistemas de TIOSA/Bimbo (ERP, ventas corporativas). [upstream:constraint-register]
- Reportes consolidados multi-ruta para el supervisor más allá de lo que ya provee la vista de administración (no se pidió explícitamente; queda como candidato para una siguiente iteración).
- Roles adicionales (RRHH, Finanzas) — no identificados como stakeholders del MVP. [upstream:stakeholder-map]

## Sequencing

Orden de construcción por dependencia técnica (que coincide con el orden de valor): [Q3][Q4]

1. Administración de roster/presupuestos/tramos (base de datos para todo lo demás)
2. Ingreso de venta diaria + cálculo de comisión + reporte individual
3. Historial de períodos anteriores
4. Notificaciones push

## Timeline

Sin fecha límite dura. [Q5]

## Assumptions & Open Questions

None.
