# Requirements — Calculadora de Comisiones (MVP)

## Intent Analysis

Carlos, supervisor de ventas en TIOSA S.A. (Grupo Bimbo Ecuador), necesita reemplazar su calculadora de comisiones actual — un archivo HTML de un solo dispositivo sin backend — por una app móvil real que él y sus ~26 rutas de vendedores puedan usar en campo. El objetivo de fondo no es solo "tener una app", sino que el cálculo de comisión deje de depender de un solo dispositivo y que cada vendedor pueda ver, en tiempo real, cuánto va ganando a partir de la venta que él mismo registra. [upstream:intent-statement]

## Functional Requirements

### FR1. Autenticación y roles

- FR1.1 El sistema debe soportar dos roles: supervisor (administrador) y vendedor. [upstream:scope-document]
- FR1.2 El supervisor inicia sesión con PIN (heredado de la app actual). [upstream:intent-statement]
- FR1.3 El vendedor inicia sesión con credenciales individuales (usuario/contraseña). [upstream:wireframes]
- FR1.4 La sesión del vendedor permanece activa por varios días; debe existir un botón visible de "Cerrar sesión" en la pantalla principal. [Q8]
- FR1.5 El modelo de datos debe soportar más de un supervisor administrador, aunque el MVP solo active uno. [Q7]

### FR2. Administración (supervisor)

- FR2.1 El supervisor gestiona el roster: ruta, nombre del vendedor, canal (preventa/autoventa). [upstream:intent-statement]
- FR2.2 El supervisor gestiona el presupuesto asignado a cada vendedor. [upstream:intent-statement]
- FR2.3 El supervisor gestiona los tramos de comisión variable por canal. [upstream:intent-statement]

### FR3. Ingreso de venta diaria (vendedor)

- FR3.1 El vendedor ingresa el monto de su venta del día. [upstream:scope-document]
- FR3.2 El sistema valida el monto (rechaza negativos y campos vacíos) y muestra un error bloqueante sin guardar hasta que se corrija. [Q6]
- FR3.3 El vendedor puede corregir la venta ya ingresada durante el mismo día; después del cierre del día, el valor queda fijo. [Q3]
- FR3.4 El ingreso de venta debe funcionar sin conexión a internet, guardando localmente en el dispositivo y sincronizando con el servidor cuando la conexión se restablezca. [Q2]

### FR4. Cálculo de comisión

- FR4.1 El sistema calcula la comisión acumulada del vendedor según el tramo configurado por el supervisor, a partir de las ventas ingresadas en el período vigente. [upstream:intent-backlog]
- FR4.2 El período de cálculo y cierre de comisión es mensual. [Q5]

### FR5. Reporte individual del vendedor

- FR5.1 El vendedor ve, como dato principal de su pantalla de inicio, la comisión ganada hasta la fecha. [upstream:wireframes]
- FR5.2 El vendedor ve su venta acumulada frente a su presupuesto asignado. [upstream:scope-document]
- FR5.3 El reporte se actualiza en tiempo real (al guardar una venta, sin necesidad de refrescar manualmente). [upstream:intent-statement]

### FR6. Historial

- FR6.1 El vendedor puede consultar la comisión y venta de períodos (meses) anteriores ya cerrados. [upstream:scope-document]

### FR7. Notificaciones de venta/presupuesto

- FR7.1 El sistema envía una notificación push al vendedor cada vez que su venta acumulada alcanza 95%, 97%, 100%, 103%, 105% y 110% de su presupuesto asignado en el período vigente. [Q9]

### FR8. Alertas de indicador de devolución y oportunidad de ganancia

- FR8.1 El sistema calcula el indicador de devolución del vendedor (devoluciones acumuladas / venta acumulada del período vigente). [Q10]
- FR8.2 El sistema envía una notificación push al vendedor cada vez que su indicador de devolución mejora (baja) por debajo de cada uno de estos umbrales: 8.5%, 8%, 7.5%, 7%, 6% y 5%. [Q10]
- FR8.3 Cada notificación de FR8.2 muestra la oportunidad de ganancia: cuánta comisión adicional ganaría el vendedor si alcanza el siguiente tramo de devolución mejor, calculada a partir de los tramos de comisión por devolución configurados por el supervisor (FR2.3). [Q10]

### FR9. Notificaciones push manuales (supervisor)

- FR9.1 El supervisor puede redactar y enviar una notificación push con mensaje libre a uno, varios o todos los vendedores, desde el panel de administración (por ejemplo, para anunciar un incentivo especial del mes). [Q11]

## Non-Functional Requirements

- NFR1. **Rendimiento**: la comisión debe recalcularse y mostrarse en menos de 2 segundos después de guardar una venta (con conexión disponible). [Q1]
- NFR2. **Adopción / éxito medible**: al menos 80% de las rutas activas deben registrar su venta diaria dentro de las primeras 2 semanas de uso — métrica de éxito de "uso en campo" heredada de Intent Capture. [Q1][upstream:intent-statement]
- NFR3. **Seguridad**: los datos de comisión/salario se protegen con control de acceso por rol (supervisor vs. vendedor), credenciales cifradas y HTTPS obligatorio en toda comunicación con el backend. [upstream:feasibility-assessment][upstream:discovered-rules]
- NFR4. **Disponibilidad offline**: el ingreso de venta debe operar sin conexión y sincronizar de forma confiable al recuperar señal, sin pérdida ni duplicación de datos. [Q2]
- NFR5. **Compatibilidad**: la app debe funcionar en Android e iOS. [upstream:rough-mockups]
- NFR6. **Costo de infraestructura**: la solución debe operar dentro de las capas gratuitas de Neon, hosting del backend y Expo/EAS mientras el volumen de uso se mantenga en el rango esperado (~26 rutas). [upstream:constraint-register]
- NFR7. **Escalabilidad de datos**: el modelo de datos debe soportar múltiples supervisores administradores sin rediseño, aunque el MVP solo tenga uno activo. [Q7]

## Constraints

- Stack fijo: React Native, NestJS, PostgreSQL en Neon. [upstream:constraint-register]
- Presupuesto personal mínimo/gratuito. [upstream:constraint-register]
- Sin integración con sistemas de TIOSA/Bimbo en este alcance. [upstream:constraint-register]
- Testing posture: test-after con piso de 80% de cobertura antes de integrar a `main`. [upstream:team-practices]

## Assumptions

- [assumption] El volumen de datos (~26 rutas) se mantiene dentro del tier gratuito de Neon durante el MVP. [upstream:raid-log]
- [assumption] Ningún requerimiento regulatorio formal aplica, más allá de proteger datos sensibles por buenas prácticas. [upstream:feasibility-assessment]

## Out of Scope

- Integración con ERP/sistemas corporativos de TIOSA/Bimbo. [upstream:scope-document]
- Reportes consolidados multi-ruta más allá de la vista de administración existente. [upstream:scope-document]
- Roles adicionales (RRHH, Finanzas). [upstream:scope-document]

## Open Questions

None.

## Review

**Reviewer:** aidlc-product-lead-agent
**Iteration:** 1
**Request Challenge:** review:42a102e91eaa775401d1c4cb7ffbc2ea

Cambios desde la iteración 1: FR7 se acotó a notificaciones de venta/presupuesto con los umbrales corregidos (95/97/100/103/105/110%); se agregó FR8 (alertas de devolución + oportunidad de ganancia) y FR9 (notificaciones push manuales del supervisor), a pedido explícito del usuario tras Request Changes.

Fortalezas: FR8.3 conecta la alerta de devolución con un valor de negocio concreto (cuánto más podría ganar el vendedor), no solo un aviso — coherente con la métrica de éxito de "uso en campo" de NFR2. FR9 cubre un caso de uso real (incentivos ad-hoc) sin sobre-especificar el contenido del mensaje.

Hallazgos (no bloquean esta etapa; pasan a Domain/Functional Design):
1. NFR4 exige "sin pérdida ni duplicación" en la sincronización offline, pero ningún FR define qué pasa si el dispositivo estuvo varios días sin conexión y acumula más de un día de venta pendiente de sincronizar — sin esto, QA no puede escribir un caso de prueba de sincronización múltiple.
2. FR1.3 introduce login individual por vendedor pero no hay un requisito de recuperación de contraseña.
3. NFR2 (80% de rutas en 2 semanas) no especifica cómo se mide — falta un mecanismo de conteo/analítica.
4. FR7.1 y FR8.2 no aclaran qué pasa con los umbrales ya notificados si el supervisor edita el presupuesto o los tramos de devolución a mitad de mes (¿se recalculan? ¿se reenvían?) — este hallazgo creció de alcance con FR8, ya que ahora involucra dos series de umbrales en vez de una.
5. FR8.3 depende de que los tramos de comisión por devolución (FR2.3) estén ordenados de forma estrictamente creciente en beneficio a menor devolución — si el supervisor los configura fuera de ese orden, el cálculo de "oportunidad de ganancia" no tiene un "siguiente tramo mejor" bien definido. Domain Design debe decidir si se valida esto al guardar los tramos.

**Verdict:** READY

Los requisitos, incluyendo los tres nuevos (FR7 corregido, FR8, FR9), son suficientes y trazables para avanzar a Domain Design; los cinco hallazgos anteriores deben resolverse en Domain Design (modelo de datos de sincronización offline, de notificaciones, y validación de orden de tramos) y Functional Design (flujo de recuperación de contraseña, instrumentación de la métrica NFR2).
