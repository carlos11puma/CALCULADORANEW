# Domain Design — Architecture Decision Records

## Sources

- [upstream:components] `inception/domain-design/components.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`

## ADR-001: Descomposición en 6 componentes de dominio

**Context**: requirements.md define 9 grupos funcionales (FR1–FR9) que combinan datos maestros (roster, presupuesto, tramos), captura transaccional (venta diaria), cálculo agregado (comisión, indicador de devolución) y comunicación (notificaciones automáticas y manuales). Era necesario decidir dónde trazar los límites de componente.

**Decision**: 6 componentes — AuthComponent, VendorDirectoryComponent (roster + presupuesto), CommissionTierComponent, SalesEntryComponent, CommissionLedgerComponent (cálculo + indicador + reporte + historial), NotificationComponent.

**Consequences**:
- Positivo: cada componente tiene un único motivo de cambio (ver Rationale en components.md) — el equipo puede tocar tramos de comisión sin arriesgar el flujo de captura de venta, o cambiar el proveedor de push sin tocar el cálculo.
- Positivo: CommissionLedgerComponent queda aislado y determinístico (crítico para testear con la metodología test-after acordada en Practices Discovery, con 80% de cobertura).
- Negativo: 6 componentes implican más interacciones cruzadas que una app monolítica sin límites — NotificationComponent depende de 4 de los otros 5 componentes. Se acepta este costo porque separa una responsabilidad transversal (I/O externo de push) de la lógica de negocio de comisión.

**Alternatives Rejected**:
- Un solo "AdminComponent" fusionando VendorDirectory y CommissionTier — rechazado porque tienen ciclos de validación y de cambio distintos, y el usuario explícitamente distinguió estas dos preocupaciones en la pregunta Q1 del plan de diseño (fusionó roster+presupuesto, no tramos).
- Fusionar CommissionLedger y Notification en un componente de "reportería y alertas" — rechazado porque acoplaría cálculo determinístico con I/O externo no determinístico (falla de red al enviar push), dificultando testing aislado del cálculo.

## ADR-002: Roster y presupuesto en un solo componente (VendorDirectoryComponent)

**Context**: FR2.1 (roster) y FR2.2 (presupuesto) podían modelarse como un componente único o dos separados; el presupuesto cambia con más frecuencia que el roster en la operación real, pero ambos son datos maestros del mismo vendedor.

**Decision**: un solo componente, con el presupuesto como atributo mutable de la entidad `Vendor` — decisión explícita del usuario en la pregunta Q1 de domain-design-questions.md.

**Consequences**:
- Positivo: un único punto de verdad para "quién es este vendedor y cuánto debe vender", que es como lo consumen tanto SalesEntryComponent (validar vendedor) como CommissionLedgerComponent (leer presupuesto) — evita una llamada extra entre dos componentes para algo que siempre se lee junto.
- Negativo: si en el futuro el presupuesto necesita su propio historial de cambios (auditoría de ediciones) o su propia cadencia de aprobación, habría que extraerlo como componente separado — no es un problema del MVP actual.

**Alternatives Rejected**: BudgetComponent separado — rechazado por decisión explícita del usuario, priorizando simplicidad sobre el argumento de "cambia con más frecuencia".

## ADR-003: Validación de orden de tramos — advertencia, no bloqueo, con bandera de estado expuesta

**Context**: FR8.3 (oportunidad de ganancia) requiere que los tramos de devolución de un canal estén ordenados de mejor a peor beneficio para que "el siguiente tramo mejor" esté bien definido (hallazgo abierto desde Requirements Analysis y User Stories, AC2.3.2/AC8.3.2).

**Decision**: el sistema permite guardar un conjunto de tramos fuera de orden, mostrando una advertencia al supervisor (decisión explícita del usuario, Q3) — no bloquea el guardado. CommissionTierComponent expone si el conjunto vigente de tramos de un canal está "en orden"; NotificationComponent consulta ese estado y omite la oportunidad de ganancia (en vez de calcular un valor incorrecto) cuando no lo está.

**Consequences**:
- Positivo: el supervisor no queda bloqueado por una regla de UI mientras reconfigura tramos (por ejemplo, a mitad de una edición de varios tramos donde el orden temporal es inconsistente hasta que termina).
- Positivo: el cálculo de oportunidad de ganancia nunca muestra un valor incorrecto — se omite explícitamente en vez de arriesgar un dato erróneo que afecte la confianza del vendedor en la app.
- Negativo: existe una ventana de tiempo donde el vendedor no recibe la oportunidad de ganancia en sus alertas de devolución, aunque sí recibe el umbral cruzado (FR8.2 no depende del orden). Functional Design debe definir la UX exacta de esa omisión (¿se omite la frase completa, o se muestra "calculando..."?).

**Alternatives Rejected**:
- Bloquear el guardado hasta corregir el orden — más seguro para el cálculo, pero rechazado explícitamente por el usuario por fricción operativa.
- Reordenar automáticamente sin confirmación — rechazado porque el supervisor podría no notar que el sistema reinterpretó su configuración, un riesgo de confianza mayor que la advertencia.

## ADR-004: Sincronización offline por fecha, sin fusión de registros

**Context**: FR3.4/NFR4 exigen que el ingreso de venta funcione offline y sincronice sin pérdida ni duplicación; quedaba abierto qué pasa si el dispositivo acumula más de un día de venta pendiente (hallazgo abierto desde Requirements Analysis, AC3.3.3).

**Decision**: cada venta pendiente se sincroniza como un registro independiente en su propia fecha (`DailySale.saleDate`) — decisión explícita del usuario (Q2). No existe lógica de "merge": el vendedor ya distinguió la fecha de cada venta al ingresarla localmente, y el backend simplemente inserta cada `DailySale` pendiente por su fecha al recuperar conexión.

**Consequences**:
- Positivo: elimina la necesidad de una estrategia de resolución de conflictos compleja — cada fecha es una clave natural, no hay dos escrituras concurrentes al mismo registro en el caso normal.
- Positivo: es consistente con AC3.2.2 (una venta de un día ya cerrado no se puede editar) — al sincronizar, si la fecha de una venta pendiente cae en un período ya cerrado por el job de CommissionLedgerComponent, esa sincronización debe rechazarse o marcarse para revisión manual (detalle a definir en Functional Design).
- Negativo: si el mismo vendedor edita la misma fecha en dos dispositivos distintos mientras ambos estaban offline (caso de borde poco probable dado que es un dispositivo por vendedor), sí podría haber un conflicto de "última escritura gana" no cubierto explícitamente aquí — Functional Design debe decidir si vale la pena una regla adicional o si se acepta el riesgo dado el patrón de uso real (un vendedor, un dispositivo).

**Alternatives Rejected**:
- Combinar en un solo registro del día de sincronización — rechazado, perdería la fecha real de cada venta, dato central para el negocio.
- Confirmación manual de cada venta al sincronizar — rechazado, agrega fricción al vendedor por un caso relativamente infrecuente (varios días sin señal).

## ADR-005: Cierre de período mensual por job programado

**Context**: FR4.2 exige un ciclo mensual de comisión; quedaba abierto si el cierre lo dispara un job automático, un cálculo "al vuelo", o una acción manual del supervisor.

**Decision**: un job programado corre automáticamente el último día del mes y marca `CommissionPeriod.closed = true` para cada vendedor — decisión explícita del usuario (Q5).

**Consequences**:
- Positivo: comportamiento predecible y consistente para todos los vendedores a la vez, sin depender de que el supervisor recuerde cerrar manualmente ni de lógica implícita de fechas dispersa en varios componentes.
- Positivo: da un punto de anclaje único y auditable para "cuándo se congelaron los datos", que además implementa directamente AC3.2.2 (venta de un día ya cerrado no editable) y el historial (FR6.1).
- Negativo: introduce una dependencia de infraestructura (scheduler/cron) fuera del ciclo de solicitud-respuesta normal de la API — Infrastructure Design (Construction) debe elegir el mecanismo concreto (ej. cron job de NestJS `@nestjs/schedule`, o un scheduled job de la plataforma de hosting) dentro de las capas gratuitas priorizadas por el proyecto.

**Alternatives Rejected**:
- Cálculo al vuelo sin job — rechazado por el usuario; además complica la regla "venta de un día ya cerrado es fija" al no tener un momento explícito de cierre.
- Cierre manual del supervisor — rechazado por el usuario; añade un paso operativo que el supervisor podría olvidar, arriesgando que el historial no se cierre a tiempo.

## ADR-006: Recálculo de umbrales sin reenvío al editar presupuesto/tramos a mitad de mes

**Context**: FR7.1/FR8.2 no aclaraban qué pasa con los umbrales ya notificados si el supervisor edita presupuesto o tramos a mitad del período vigente (hallazgo abierto desde Requirements Analysis).

**Decision**: CommissionLedgerComponent recalcula comisión e indicador desde cero con el nuevo valor; NotificationComponent no reenvía notificaciones de umbrales que ya habían sido cruzados y notificados con el valor anterior — solo notifica cuando se cruza un nuevo umbral con el valor actualizado (decisión explícita del usuario, Q4).

**Consequences**:
- Positivo: evita una ráfaga de notificaciones duplicadas o confusas al vendedor cada vez que el supervisor ajusta un valor administrativo.
- Positivo: el estado "qué umbrales ya se notificaron en el período vigente" queda como responsabilidad clara de NotificationComponent, no mezclado con el cálculo puro de CommissionLedgerComponent.
- Negativo: si el nuevo valor hace que el vendedor "retroceda" por debajo de un umbral que ya había cruzado, el vendedor no recibe una notificación explicando ese retroceso — Functional Design debe decidir si eso amerita una notificación distinta (fuera del alcance de esta decisión, que solo cubre el caso de no-reenvío).

**Alternatives Rejected**: congelar los umbrales ya notificados con el valor anterior — rechazado por el usuario, quien prefirió que el sistema siempre refleje el valor vigente aunque eso signifique no re-notificar retroactivamente.
