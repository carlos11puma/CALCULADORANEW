# Refined Mockups — Questions

## Sources

- [upstream:wireframes] `ideation/rough-mockups/wireframes.md`
- [upstream:user-flow] `ideation/rough-mockups/user-flow.md`
- [upstream:stories] `inception/user-stories/stories.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`

## Q1. Los wireframes (V3) no definían el estado de error de "Ingresar venta"; ahora con FR3.2/AC3.1.2 sabemos que debe ser un error bloqueante. ¿Cómo debe mostrarse ese error en la pantalla?

A. Mensaje inline debajo del campo, sin bloquear la vista (el usuario corrige y reintenta)
B. Modal/alerta que interrumpe hasta que el usuario la cierra
C. Ambos: mensaje inline + el botón "Guardar venta" queda deshabilitado hasta corregir
X. Other (please specify)

[Answer]: C. Ambos: mensaje inline debajo del campo + botón "Guardar venta" deshabilitado hasta que se corrija.

## Q2. Con hasta 12 notificaciones automáticas por período (FR7 + FR8) más las manuales (FR9), ¿qué patrón de interacción debe usar la pantalla de Notificaciones (V5) para diferenciarlas?

A. Lista plana cronológica, sin distinción visual entre tipos
B. Lista agrupada por tipo (venta/presupuesto, devolución, manuales del supervisor) con un ícono o color distintivo por grupo
C. Lista plana pero con un ícono distintivo por tipo (sin agrupar)
X. Other (please specify)

[Answer]: B. Lista agrupada por tipo (venta/presupuesto, devolución, manuales del supervisor), cada grupo con ícono/color distintivo.

## Q3. La app no tiene aún una librería de componentes ni guía de marca oficial (los wireframes usan rojo Bimbo genérico como placeholder). ¿Qué enfoque de sistema de diseño usamos para el MVP?

A. Adoptar una librería de componentes React Native ya existente (ej. React Native Paper) con theming mínimo (color primario, tipografía) en vez de construir componentes desde cero
B. Construir un set mínimo de componentes propios (botón, input, card, badge) sin librería externa
C. Aún no lo sé, propón una opción razonable dado el presupuesto mínimo/gratuito del proyecto
X. Other (please specify)

[Answer]: A. React Native Paper con theming mínimo (color primario placeholder de marca Bimbo, tipografía por defecto) — evita construir y mantener un set de componentes propio, alineado con el mandato de priorizar capas gratuitas de infraestructura.

## Q4. ¿Qué nivel de accesibilidad (WCAG) debe cumplir el MVP, más allá de la jerarquía de encabezados/landmarks ya definida en los wireframes?

A. WCAG 2.1 nivel A (mínimo básico)
B. WCAG 2.1 nivel AA (recomendado para apps de uso diario en campo, incluye contraste de color y tamaño de área táctil)
C. No es prioridad para el MVP; documentar como deuda técnica
X. Other (please specify)

[Answer]: B. WCAG 2.1 nivel AA — incluye contraste de color y tamaño mínimo de área táctil (44×44pt), lo que además resuelve el hallazgo #3 de la revisión de wireframes.

## Q5. NFR5 exige compatibilidad Android e iOS. ¿La app debe soportar tablets o solo teléfonos en este MVP?

A. Solo teléfonos (el uso es en campo, un vendedor por dispositivo)
B. Teléfonos y tablets (el panel del Supervisor podría usarse en tablet en oficina)
C. Solo teléfonos para el Vendedor; el panel del Supervisor sí debe adaptarse a tablet
X. Other (please specify)

[Answer]: A. Solo teléfonos para ambos roles en este MVP.

## Consolidated Summary Confirmation

- Error de ingreso de venta: mensaje inline + botón deshabilitado hasta corregir
- Notificaciones agrupadas por tipo (venta/presupuesto, devolución, manuales) con ícono/color por grupo
- Sistema de diseño: React Native Paper con theming mínimo (sin librería de marca oficial aún)
- Accesibilidad: WCAG 2.1 AA (contraste + área táctil mínima 44×44pt)
- Solo teléfonos en este MVP, para ambos roles

Does this all look correct before I generate the refined mockups and related artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
