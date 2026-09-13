# Requirements Analysis — Questions

## Sources

- [upstream:intent-statement] `ideation/intent-capture/intent-statement.md`
- [upstream:scope-document] `ideation/scope-definition/scope-document.md`
- [upstream:intent-backlog] `ideation/scope-definition/intent-backlog.md`
- [upstream:team-practices] `inception/practices-discovery/team-practices.md`
- [upstream:wireframes] `ideation/rough-mockups/wireframes.md` — hallazgos de revisión (V3 validación, logout, tamaño táctil)

## Q1. ¿Qué umbral concreto define el éxito de "uso en campo" (pendiente desde Intent Capture)?

A. % de vendedores ingresando venta a diario
B. Tiempo de respuesta al calcular
C. Ambos
D. Aún no lo sé, propón uno razonable
X. Other (please specify)

[Answer]: D. Aún no lo sé, propón uno razonable — se define en Requirements como: al menos 80% de las rutas activas registran su venta diaria dentro de las primeras 2 semanas de uso, y la comisión se recalcula y muestra en menos de 2 segundos tras guardar la venta.

## Q2. ¿Los vendedores necesitan ingresar venta sin conexión a internet?

A. Sí, es importante
B. No es necesario por ahora
C. No estoy seguro
X. Other (please specify)

[Answer]: A. Sí, es importante — guardar localmente en el dispositivo y sincronizar cuando vuelva la señal.

## Q3. ¿Puede el vendedor corregir su venta del día después de guardarla?

A. Sí, puede corregirla el mismo día
B. No, queda fija una vez guardada
C. Solo el admin puede corregirla
X. Other (please specify)

[Answer]: A. Sí, puede corregirla el mismo día; después del cierre del día queda fija.

## Q4. ¿Cuándo debe avisar la notificación de proximidad a meta?

A. Al alcanzar 90% del presupuesto
B. Al alcanzar 100% (meta cumplida)
C. En varios umbrales (ej. 50%, 90%, 100%)
D. Propón un default razonable
X. Other (please specify)

[Answer]: D. Propón un default razonable — se define como avisos progresivos en 50%, 90% y 100% del presupuesto.

## Q5. ¿Cada cuánto se cierra un período de comisión?

A. Mensual
B. Semanal
C. Otro
X. Other (please specify)

[Answer]: A. Mensual — igual que la calculadora web actual.

## Q6. ¿Qué debe pasar si el vendedor ingresa un monto inválido o ya ingresó venta hoy?

A. Mostrar error y no guardar hasta corregir
B. Si ya ingresó hoy, reemplazar el valor anterior
X. Other (please specify)

[Answer]: A. Mostrar error y no guardar hasta corregir (resuelve el hallazgo de revisión de wireframes V3).

## Q7. ¿El diseño debe contemplar más de un supervisor administrador en el futuro?

A. Solo yo por ahora
B. Podría haber más supervisores después
X. Other (please specify)

[Answer]: B. Podría haber más supervisores después — el modelo de datos debe soportarlo aunque el MVP solo active uno.

## Q8. ¿Cuánto debe durar la sesión de un vendedor antes de pedir login de nuevo (resuelve el hallazgo de revisión de wireframes sobre logout)?

A. Sesión larga (varios días) + botón de cerrar sesión manual
B. Sesión corta (un día) que expira sola
C. Propón un default razonable
X. Other (please specify)

[Answer]: A. Sesión larga (varios días) + botón de cerrar sesión manual visible en Home.

## Follow-up (Request Changes tras Consolidated Summary Confirmation)

### Q9. Umbrales de notificación de venta/presupuesto (reemplaza Q4)

El usuario pidió cambiar los umbrales de la notificación de proximidad/superación de meta.

[Answer]: Notificar en 95%, 97%, 100%, 103%, 105% y 110% de la venta acumulada frente al presupuesto asignado.

### Q10. Alertas de indicador de devolución + oportunidad de ganancia

El usuario pidió una nueva capacidad: alertar cuando el indicador de devolución del vendedor mejora (baja) a través de una serie de umbrales, y mostrarle cuánto más podría ganar en comisión si sigue bajando su devolución.

[Answer]: Notificar cuando el % de devolución del vendedor (devoluciones / venta del período) cae por debajo de cada uno de estos umbrales: 8.5%, 8%, 7.5%, 7%, 6%, 5%. Cada notificación debe mostrar la oportunidad de ganancia: cuánto más comisión ganaría si alcanza el siguiente tramo de devolución mejor, calculado a partir de los tramos de comisión por devolución que el supervisor configura en administración (heredado de la lógica de la app actual "Mi Comisión", donde los tramos variables se calculan "Por devolución" o "Por efectividad" según el canal).

### Q11. Notificaciones push manuales por incentivos del mes

El usuario pidió poder enviar notificaciones push manuales cuando haya un incentivo especial durante el mes, fuera de las alertas automáticas de venta/devolución.

[Answer]: El supervisor debe poder redactar y enviar una notificación push manual (mensaje libre) a uno, varios o todos los vendedores, desde su panel de administración, para comunicar incentivos u otros avisos durante el mes.

## Consolidated Summary Confirmation

- Métrica de éxito: 80% de rutas activas registrando venta diaria en 2 semanas + cálculo de comisión en menos de 2 segundos
- Ingreso de venta funciona sin conexión, con sincronización posterior
- Venta editable el mismo día, fija después del cierre
- Notificaciones de venta/presupuesto en 95%, 97%, 100%, 103%, 105% y 110%
- Alertas de mejora de indicador de devolución en 8.5%, 8%, 7.5%, 7%, 6%, 5%, mostrando la oportunidad de ganancia adicional
- Notificaciones push manuales del supervisor por incentivos del mes
- Cierre de período mensual
- Validación de venta: error bloqueante, sin guardar hasta corregir
- Modelo de datos preparado para múltiples supervisores a futuro (MVP activa solo uno)
- Sesión larga + botón de cerrar sesión manual

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
