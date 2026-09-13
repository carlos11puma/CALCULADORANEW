# User Stories — Calculadora de Comisiones (MVP)

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:personas] `inception/user-stories/personas.md`

## US1. Autenticación y roles (FR1)

### US1.1 — Inicio de sesión del vendedor

Como **Vendedor**, quiero iniciar sesión con mi usuario y contraseña individuales, para acceder a mi propia información de venta y comisión. [FR1.3]

**Prioridad**: Must Have

- AC1.1.1 — Given un vendedor con credenciales válidas, When ingresa usuario y contraseña correctos, Then accede a su pantalla principal.
- AC1.1.2 — Given un vendedor con credenciales inválidas, When intenta iniciar sesión, Then el sistema muestra un error y no concede acceso.
- AC1.1.3 — Given un vendedor con sesión iniciada, When no cierra sesión manualmente, Then la sesión permanece activa por varios días. [FR1.4]

### US1.2 — Cierre de sesión del vendedor

Como **Vendedor**, quiero un botón visible de "Cerrar sesión" en mi pantalla principal, para proteger mi cuenta cuando comparto el dispositivo o cambio de turno. [FR1.4]

**Prioridad**: Must Have

- AC1.2.1 — Given un vendedor con sesión activa, When toca "Cerrar sesión", Then la sesión termina y vuelve a la pantalla de login.

### US1.3 — Inicio de sesión del supervisor

Como **Supervisor**, quiero iniciar sesión con mi PIN, para acceder al panel de administración. [FR1.2]

**Prioridad**: Must Have

- AC1.3.1 — Given un PIN correcto, When el supervisor lo ingresa, Then accede al panel de administración.
- AC1.3.2 — Given un PIN incorrecto, When el supervisor lo ingresa, Then el sistema muestra un error y no concede acceso.

### US1.4 — Modelo de datos preparado para múltiples supervisores

Como **Supervisor**, quiero que el sistema esté preparado para soportar más de un supervisor administrador en el futuro, para no requerir un rediseño cuando el centro de ventas crezca. [FR1.1, FR1.5, NFR7]

**Prioridad**: Should Have

- AC1.4.1 — Given el modelo de datos, When se agrega un segundo supervisor (fuera de alcance del MVP activarlo), Then no se requiere cambio de esquema, solo activación.

## US2. Administración — roster, presupuestos y tramos (FR2)

### US2.1 — Gestión del roster de vendedores

Como **Supervisor**, quiero gestionar el roster (ruta, nombre del vendedor, canal preventa/autoventa), para mantener actualizada la estructura de mi equipo. [FR2.1]

**Prioridad**: Must Have

- AC2.1.1 — Given el panel de administración, When el supervisor agrega un vendedor con ruta, nombre y canal, Then el vendedor queda disponible para iniciar sesión y aparecer en reportes.
- AC2.1.2 — Given un vendedor existente, When el supervisor edita su ruta o canal, Then el cambio se refleja en los cálculos del período vigente en adelante.

### US2.2 — Gestión de presupuestos

Como **Supervisor**, quiero asignar y editar el presupuesto de cada vendedor, para que el sistema calcule su avance frente a la meta. [FR2.2]

**Prioridad**: Must Have

- AC2.2.1 — Given un vendedor del roster, When el supervisor asigna un presupuesto, Then ese valor se usa para calcular el % de avance del vendedor (FR5.2) y disparar notificaciones (FR7.1).
- AC2.2.2 — Given un presupuesto inválido (negativo o vacío), When el supervisor intenta guardarlo, Then el sistema muestra un error bloqueante y no guarda.

### US2.3 — Gestión de tramos de comisión variable

Como **Supervisor**, quiero configurar los tramos de comisión variable por canal (por devolución o por efectividad), para que el sistema calcule correctamente la comisión de cada vendedor según su canal. [FR2.3]

**Prioridad**: Must Have

- AC2.3.1 — Given el panel de tramos, When el supervisor define tramos para canal preventa (por devolución) o autoventa (por efectividad), Then esos tramos se usan en el cálculo de comisión (FR4.1) y en la oportunidad de ganancia de las alertas de devolución (FR8.3).
- AC2.3.2 — Given tramos de devolución configurados fuera de orden estrictamente creciente en beneficio, When el supervisor intenta guardarlos, Then el sistema advierte o bloquea el guardado (detalle de validación exacto: Domain Design, hallazgo #5 de la revisión de Requirements).

## US3. Ingreso de venta diaria (FR3)

### US3.1 — Registrar venta del día (con conexión)

Como **Vendedor**, quiero ingresar el monto de mi venta del día, para que mi comisión se actualice de inmediato. [FR3.1, FR5.3]

**Prioridad**: Must Have

- AC3.1.1 — Given el vendedor en su pantalla de ingreso de venta, When ingresa un monto válido y guarda, Then el sistema registra la venta y recalcula su comisión en menos de 2 segundos. [NFR1]
- AC3.1.2 — Given un monto negativo o un campo vacío, When el vendedor intenta guardar, Then el sistema muestra un error bloqueante y no guarda hasta que se corrija. [FR3.2]

### US3.2 — Corregir venta del mismo día

Como **Vendedor**, quiero poder corregir la venta que ya ingresé hoy, para arreglar un error de digitación antes del cierre del día. [FR3.3]

**Prioridad**: Must Have

- AC3.2.1 — Given una venta ya guardada hoy, When el vendedor la edita antes del cierre del día, Then el nuevo valor reemplaza al anterior y la comisión se recalcula.
- AC3.2.2 — Given una venta de un día ya cerrado, When el vendedor intenta editarla, Then el sistema no permite el cambio (el valor queda fijo).

### US3.3 — Registrar venta sin conexión

Como **Vendedor**, quiero poder ingresar mi venta del día aunque no tenga señal en ese momento, para no perder el registro mientras estoy en ruta. [FR3.4, NFR4]

**Prioridad**: Must Have

- AC3.3.1 — Given el dispositivo sin conexión, When el vendedor ingresa y guarda su venta, Then el sistema la guarda localmente y muestra que está pendiente de sincronizar.
- AC3.3.2 — Given una venta guardada localmente sin sincronizar, When el dispositivo recupera conexión, Then el sistema sincroniza automáticamente sin pérdida ni duplicación de datos.
- AC3.3.3 — (Caso a definir en Domain Design, hallazgo #1 de la revisión de Requirements) Given el dispositivo estuvo varios días sin conexión con más de un día de venta pendiente, When recupera señal, Then el sistema resuelve la sincronización múltiple según la regla que defina Domain Design.
- AC3.3.4 — Given el vendedor está guardando una venta, When pierde la conexión a mitad de esa operación (no sabía de antemano que estaba sin señal), Then el sistema detecta el fallo de red y guarda localmente igual que en AC3.3.1, sin mostrar un error de pérdida de datos. [contributions/aidlc-quality-agent]

> **Nota para Delivery Planning**: US3.3 mezcla dos preocupaciones de tamaño distinto — guardado local (chico) y sincronización multi-día sin pérdida ni duplicación (grande, depende de Domain Design). Se recomienda tratarla como al menos dos Bolts separados en Delivery Planning. [contributions/aidlc-developer-agent]

## US4. Cálculo de comisión (FR4)

### US4.1 — Cálculo automático de comisión por tramos

Como **Vendedor**, quiero que mi comisión se calcule automáticamente según los tramos configurados por mi supervisor y mi venta acumulada, para no depender de un cálculo manual. [FR4.1]

**Prioridad**: Must Have

- AC4.1.1 — Given la venta acumulada del vendedor en el período vigente y los tramos configurados para su canal, When se guarda una nueva venta, Then el sistema determina el tramo correspondiente y calcula la comisión.

### US4.2 — Cierre de período mensual

Como **Vendedor**, quiero que mi comisión se calcule y cierre en un ciclo mensual, para tener un período de referencia claro y consistente con la calculadora que usaba antes. [FR4.2]

**Prioridad**: Must Have

- AC4.2.1 — Given el fin del mes, When el período cierra, Then la venta y comisión de ese mes quedan fijas y disponibles como historial (US6).

## US5. Reporte individual del vendedor (FR5)

### US5.1 — Ver comisión ganada en pantalla principal

Como **Vendedor**, quiero ver mi comisión ganada hasta la fecha como dato principal de mi pantalla de inicio, para saber de un vistazo cuánto llevo ganado. [FR5.1]

**Prioridad**: Must Have

- AC5.1.1 — Given el vendedor con sesión iniciada, When abre la app, Then ve su comisión acumulada del período vigente como el dato más prominente de la pantalla.

### US5.2 — Ver venta acumulada frente al presupuesto

Como **Vendedor**, quiero ver mi venta acumulada frente a mi presupuesto asignado, para saber qué tan cerca estoy de mi meta. [FR5.2]

**Prioridad**: Must Have

- AC5.2.1 — Given el vendedor con sesión iniciada, When consulta su pantalla principal, Then ve su venta acumulada y su presupuesto asignado, con el % de avance.

### US5.3 — Actualización en tiempo real

Como **Vendedor**, quiero que mi reporte se actualice automáticamente al guardar una venta, para no tener que refrescar manualmente. [FR5.3]

**Prioridad**: Must Have

- AC5.3.1 — Given el vendedor guarda una venta, When la operación se completa, Then la comisión y el avance de presupuesto mostrados en pantalla se actualizan sin acción adicional del usuario.

## US6. Historial (FR6)

### US6.1 — Consultar períodos anteriores

Como **Vendedor**, quiero consultar la comisión y venta de meses anteriores ya cerrados, para revisar mi desempeño histórico. [FR6.1]

**Prioridad**: Should Have

- AC6.1.1 — Given uno o más períodos cerrados, When el vendedor abre su historial, Then ve la venta y comisión de cada período anterior, de solo lectura.

## US7. Notificaciones de venta/presupuesto (FR7)

### US7.1 — Notificación al cruzar umbrales de venta/presupuesto

Como **Vendedor**, quiero recibir una notificación push cuando mi venta acumulada alcanza 95%, 97%, 100%, 103%, 105% o 110% de mi presupuesto, para enterarme de inmediato de mi progreso sin tener que revisar la app constantemente. [FR7.1]

**Prioridad**: Must Have

- AC7.1.1 — Given la venta acumulada del vendedor cruza uno de los umbrales (95/97/100/103/105/110%) por primera vez en el período vigente, When esto ocurre al guardar una venta, Then el sistema envía una notificación push indicando el umbral alcanzado.
- AC7.1.2 — Given un umbral ya notificado en el período vigente, When la venta se mantiene igual o sube sin cruzar el siguiente umbral, Then el sistema no reenvía la misma notificación.
- AC7.1.3 — (Caso a definir en Domain Design, hallazgo #4 de la revisión de Requirements) Given el supervisor edita el presupuesto a mitad de mes, When esto cambia qué umbrales ya se cruzaron, Then el sistema recalcula y notifica según la regla que defina Domain Design.

## US8. Alertas de indicador de devolución y oportunidad de ganancia (FR8)

### US8.1 — Cálculo del indicador de devolución

Como **Vendedor**, quiero que el sistema calcule mi indicador de devolución (devoluciones acumuladas / venta acumulada), para saber cómo está mi indicador de calidad de venta. [FR8.1]

**Prioridad**: Must Have

- AC8.1.1 — Given la venta y devoluciones acumuladas del período vigente, When se actualiza cualquiera de las dos, Then el sistema recalcula el indicador de devolución.

### US8.2 — Notificación al mejorar el indicador de devolución

Como **Vendedor**, quiero recibir una notificación push cuando mi indicador de devolución baja por debajo de 8.5%, 8%, 7.5%, 7%, 6% o 5%, para saber que estoy mejorando mi desempeño. [FR8.2]

**Prioridad**: Must Have

- AC8.2.1 — Given el indicador de devolución del vendedor cruza hacia abajo uno de los umbrales (8.5/8/7.5/7/6/5%) por primera vez en el período vigente, When esto ocurre, Then el sistema envía una notificación push indicando el umbral alcanzado.
- AC8.2.2 — Given un umbral de devolución ya notificado en el período vigente, When el indicador sube de nuevo sin cruzar hacia abajo otro umbral, Then el sistema no reenvía la notificación.

### US8.3 — Oportunidad de ganancia en la alerta de devolución

Como **Vendedor**, quiero que cada notificación de mejora de devolución me muestre cuánta comisión adicional podría ganar si sigo bajando mi devolución, para tener un incentivo concreto para seguir mejorando. [FR8.3]

**Prioridad**: Must Have

- AC8.3.1 — Given una notificación de umbral de devolución (US8.2), When se genera, Then incluye el monto de comisión adicional que ganaría el vendedor si alcanza el siguiente tramo de devolución mejor, calculado según los tramos configurados por el supervisor (FR2.3).
- AC8.3.2 — (Depende de la validación de orden de tramos, ver AC2.3.2) Given tramos de devolución correctamente ordenados, When se calcula la oportunidad de ganancia, Then el "siguiente tramo mejor" está bien definido y el cálculo es determinístico.

## US9. Notificaciones push manuales del supervisor (FR9)

### US9.1 — Enviar notificación manual a uno, varios o todos los vendedores

Como **Supervisor**, quiero redactar y enviar una notificación push con mensaje libre a uno, varios o todos los vendedores desde mi panel de administración, para comunicar incentivos especiales u otros avisos durante el mes. [FR9.1]

**Prioridad**: Should Have

- AC9.1.1 — Given el panel de administración, When el supervisor redacta un mensaje y selecciona uno o varios vendedores, Then el sistema envía la notificación push solo a los vendedores seleccionados.
- AC9.1.2 — Given el panel de administración, When el supervisor selecciona "todos los vendedores", Then el sistema envía la notificación a todo el roster activo.
- AC9.1.3 — Given un mensaje vacío, When el supervisor intenta enviarlo, Then el sistema muestra un error bloqueante y no envía la notificación.

## Story Dependencies

- US3 (Ingreso de venta) es prerequisito de US4 (Cálculo), US5 (Reporte), US7 (Notif. venta) y US8 (Notif. devolución) — todas dependen de que exista venta registrada.
- US2.2 (Presupuestos) es prerequisito de US5.2 y US7.1.
- US2.3 (Tramos) es prerequisito de US4.1 y US8.3.
- US1 (Autenticación) es prerequisito de todas las demás historias del Vendedor y del Supervisor.

## INVEST Compliance Notes

- **Independent**: cada historia entrega valor por sí sola; US7/US8/US9 (notificaciones) son independientes entre sí aunque comparten el mecanismo de push.
- **Negotiable**: los criterios de aceptación marcados "(a definir en Domain Design)" dejan explícitamente abierto el detalle de implementación, no el alcance.
- **Valuable**: cada historia traza a un FR/NFR con valor de negocio directo (ver traceability.json).
- **Estimable**: el tamaño se mantiene acotado por historia gracias a la granularidad mixta (fina en US4/US7/US8, gruesa en US1/US6).
- **Small**: ninguna historia excede una capacidad (feature) coherente; US2 y US1 se dividieron en sub-historias por dato administrado / por acción, respectivamente.
- **Testable**: todo criterio de aceptación sigue Given/When/Then verificable.

## Review

**Reviewer:** aidlc-product-lead-agent
**Iteration:** 1

Fortalezas: las 9 historias trazan de forma 1:1 a los grupos FR1–FR9 de requirements.md (ver traceability.json, todo `OK` salvo NFR2/NFR3/NFR5/NFR6 que no se expresan como historias por diseño). La granularidad mixta acordada con el usuario se aplicó consistentemente: US4/US7/US8 (lógica de negocio compleja) tienen criterios de aceptación detallados incluyendo casos de borde ya conocidos (AC3.3.4, AC8.3.2), mientras US1/US6 se mantienen simples. El proceso de mob dejó evidencia completa: las tres contribuciones señalaron gaps reales (bandeja de notificaciones, sizing de US3.3, caso de borde de conexión) y dos de los tres se incorporaron directamente al draft; el tercero (bandeja de notificaciones) se escaló correctamente al usuario como decisión de alcance con costo, en vez de que el lead lo resolviera unilateralmente.

Disensión mantenida (objeción no resuelta a favor del objetante): aidlc-design-agent objetó que el vendedor necesita una forma de consultar notificaciones dentro de la app dado el volumen (hasta 12 automáticas + manuales por período); el usuario, informado del costo, decidió explícitamente "No por ahora" — riesgo aceptado, no un gap sin evaluar.

Hallazgos (no bloquean esta etapa; pasan a Domain/Functional Design):
1. AC2.3.2 y AC8.3.2 dependen de una regla de validación de orden de tramos de devolución que Domain Design aún no ha definido — ya quedaron marcadas explícitamente como pendientes, lo cual es correcto en esta etapa, pero Domain Design debe resolverlas antes de Contract Design.
2. AC7.1.3 (recálculo de umbrales al editar presupuesto/tramos a mitad de mes) hereda el hallazgo #4 de Requirements Analysis y sigue sin regla definida — mismo tratamiento: pendiente explícito, no bloqueante.
3. La nota de Delivery Planning sobre dividir US3.3 en al menos dos Bolts es una entrada útil pero no vinculante; Delivery Planning debe confirmarla o ajustarla con la información de esfuerzo real disponible en esa etapa.

**Verdict:** READY

Las historias, personas y trazabilidad son suficientes y consistentes con requirements.md para avanzar a la siguiente etapa; los hallazgos anteriores están correctamente diferidos, no representan huecos sin reconocer.
