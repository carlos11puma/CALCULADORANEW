# Domain Design — Questions

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:stories] `inception/user-stories/stories.md`
- [upstream:mockups] `inception/refined-mockups/mockups.md`

## Propuesta de componentes (para discutir en las preguntas siguientes)

1. **AuthComponent** — login y sesión de ambos roles (FR1).
2. **VendorDirectoryComponent** — roster y presupuesto (FR2.1, FR2.2).
3. **CommissionTierComponent** — tramos de comisión por canal (FR2.3).
4. **SalesEntryComponent** — ingreso de venta diaria, online y offline (FR3).
5. **CommissionLedgerComponent** — cálculo de comisión, indicador de devolución, reporte en tiempo real e historial de períodos cerrados (FR4, FR5, FR6, FR8.1).
6. **NotificationComponent** — umbrales de venta/presupuesto y devolución, oportunidad de ganancia, notificaciones manuales del supervisor (FR7, FR8.2, FR8.3, FR9).

## Q1. ¿Roster (vendedores/rutas/canal) y presupuesto deben ser un solo componente (VendorDirectoryComponent) o dos separados?

A. Un solo componente — presupuesto es un atributo mutable del vendedor, mismo ciclo de vida
B. Dos componentes separados — el presupuesto cambia con más frecuencia y tiene su propia lógica de validación
C. No estoy seguro
X. Other (please specify)

[Answer]: A. Un solo componente (VendorDirectoryComponent) — presupuesto es un atributo mutable del vendedor, mismo ciclo de vida.

## Q2. Sincronización offline multi-día (hallazgo abierto desde Requirements Analysis, AC3.3.3): si el dispositivo del vendedor estuvo varios días sin conexión y acumula más de un día de venta pendiente, ¿cómo deben resolverse esas ventas al sincronizar?

A. Cada día pendiente se sincroniza como una venta independiente por fecha (el vendedor ya distinguió la fecha al ingresarlas) — sin necesidad de "merge", solo de insertar cada una en su fecha correspondiente
B. Se combinan en un solo registro del día de sincronización
C. El sistema pide al vendedor confirmar cada una manualmente antes de aceptarlas
X. Other (please specify)

[Answer]: A. Cada día pendiente se sincroniza como una venta independiente por su propia fecha — sin necesidad de "merge".

## Q3. Validación de orden de tramos de devolución (hallazgo abierto desde User Stories, AC2.3.2): si el supervisor configura los tramos fuera de orden estrictamente creciente en beneficio, ¿qué debe hacer el sistema al guardar?

A. Bloquear el guardado con un error hasta que el supervisor corrija el orden
B. Guardar pero mostrar una advertencia (el supervisor decide si corrige)
C. Ordenar automáticamente los tramos por el sistema, sin pedir confirmación
X. Other (please specify)

[Answer]: B. Guardar pero mostrar una advertencia — el supervisor decide si corrige. Nota: mientras los tramos estén fuera de orden, FR8.3 (oportunidad de ganancia) no puede calcular un "siguiente tramo mejor" bien definido; CommissionTierComponent debe exponer si el conjunto de tramos vigente está "en orden" para que NotificationComponent omita ese dato en vez de mostrar un valor incorrecto.

## Q4. Recálculo de umbrales al editar presupuesto o tramos a mitad de mes (hallazgo abierto desde Requirements Analysis, sección FR7.1/FR8.2): si el supervisor cambia el presupuesto o los tramos de un vendedor a mitad del período vigente, ¿qué pasa con los umbrales ya notificados?

A. Se recalculan desde cero con el nuevo valor; si el vendedor ya había cruzado umbrales que con el nuevo valor ya no aplican, no se "retira" la notificación ya enviada, pero no se vuelve a notificar hasta cruzar un nuevo umbral con el valor actualizado
B. Los umbrales ya notificados quedan congelados con el valor anterior; el cambio solo aplica a partir de la siguiente venta
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Se recalculan desde cero con el nuevo valor; los umbrales ya notificados no se retiran, pero no se reenvían hasta cruzar un nuevo umbral con el valor actualizado.

## Q5. ¿Qué dispara el cierre de un período mensual (FR4.2)?

A. Un job programado (scheduled) que corre automáticamente el último día del mes
B. Se calcula "al vuelo": un período se considera cerrado simplemente porque ya no es el mes vigente, sin un job que lo marque explícitamente
C. El supervisor lo cierra manualmente
X. Other (please specify)

[Answer]: A. Un job programado que corre automáticamente el último día del mes.

## Consolidated Summary Confirmation

- 6 componentes: AuthComponent, VendorDirectoryComponent (roster + presupuesto), CommissionTierComponent (tramos), SalesEntryComponent (venta diaria), CommissionLedgerComponent (cálculo, indicador, reporte, historial), NotificationComponent (umbrales + manuales)
- Sincronización offline multi-día: cada día pendiente se sincroniza por su propia fecha, sin merge
- Tramos fuera de orden: se guardan con advertencia; CommissionTierComponent expone si el conjunto está "en orden" para que la oportunidad de ganancia se omita cuando no lo esté
- Cambios de presupuesto/tramos a mitad de mes: recálculo desde cero, sin reenviar notificaciones de umbrales ya cruzados
- Cierre de período: job programado el último día del mes

Does this all look correct before I generate the component catalogue and ADRs?

- Looks correct
- Request changes

[Answer]: Looks correct
