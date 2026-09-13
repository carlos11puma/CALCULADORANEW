**Collaborator:** aidlc-design-agent

## Contribution

Revisé `personas.md` y `stories.md` desde la óptica de experiencia de usuario y fidelidad de las personas.

- Las dos personas (Vendedor, Supervisor) son consistentes con los wireframes de Rough Mockups (V1-V5 para Vendedor, A1-A2 para Supervisor) y con el hallazgo de esa revisión sobre logout — US1.2 lo cubre explícitamente.
- US7.1 y US8.2 generan hasta 12 notificaciones push distintas por vendedor por período (6 umbrales de venta + 6 de devolución), más las manuales de US9.1. Falta una historia o criterio que cubra cómo el Vendedor ve/gestiona su historial de notificaciones dentro de la app (no solo el push del sistema operativo) — sin eso, una notificación perdida (dispositivo apagado, permiso denegado) no tiene forma de recuperarse.
- AC3.3.1 dice "muestra que está pendiente de sincronizar" pero no hay una historia que defina qué ve el vendedor mientras hay ventas sin sincronizar (¿un ícono, un banner, un contador?) — relevante porque el vendedor de campo necesita confianza visual de que su venta quedó guardada aunque no haya señal.
- US2.3 (tramos) es la pantalla más compleja del panel de administración (heredado de "Mi Comisión") y no tiene un criterio de aceptación sobre cómo el supervisor visualiza el orden/beneficio de los tramos antes de guardar — relevante para AC2.3.2 (validación de orden).

## Positions

AGREE: US1-US6 (autenticación, administración, ingreso de venta, cálculo, reporte, historial) — la fidelidad a los wireframes y flujos ya revisados en Rough Mockups es correcta.
AGREE: US9 (notificaciones manuales) — el flujo de redacción y envío es simple y suficiente para el MVP.
OBJECT: Falta una historia de "bandeja de notificaciones dentro de la app" (o un criterio de aceptación explícito) para US7 y US8, dado el volumen de notificaciones push que este proyecto introduce (hasta 12 automáticas + manuales por período) y el riesgo de que el vendedor las pierda si no tiene forma de consultarlas dentro de la app.
