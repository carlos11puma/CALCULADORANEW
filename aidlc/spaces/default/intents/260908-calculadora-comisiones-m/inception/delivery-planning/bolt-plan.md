# Delivery Planning — Bolt Plan

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:stories] `inception/user-stories/stories.md`
- [upstream:mockups] `inception/refined-mockups/mockups.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:unit-of-work-dependency] `inception/units-generation/unit-of-work-dependency.md`
- [upstream:unit-of-work-story-map] `inception/units-generation/unit-of-work-story-map.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

Un **Bolt** es la porción de trabajo de Construction que planifica esta etapa: uno o más Unidades de 2.7 (o una rebanada delgada que corta a través de varias), con su propia Definition of Done, hipótesis de confianza y dueño. A diferencia del DAG de 2.7 (que fija qué Unidad depende de cuál), el orden de los Bolts aquí es una decisión económica — ver `risk-and-sequencing-rationale.md` para el porqué de cada posición.

Todos los Bolts de este plan son rebanadas delgadas que cruzan las 3 Unidades (`api-contract`, `backend-api`, `mobile-app`) cuando ambos lados de una funcionalidad deben demostrarse juntos (Q3 de `delivery-planning-questions.md`) — cada Bolt termina en algo que se puede mostrar de punta a punta, no en una Unidad completa aislada.

## Bolt 0 — Walking Skeleton: login → ingresar venta → ver comisión calculada

**Estado**: solo, con puerta de aprobación propia (afirmado en `team.md`, Walking Skeleton) — este Bolt se construye y se muestra antes de decidir el resto.

**Unidades incluidas**: `api-contract` (mínimo: 4 endpoints), `backend-api` (mínimo: AuthComponent solo login de vendedor, VendorDirectoryComponent con un vendedor sembrado con presupuesto, CommissionTierComponent con un tramo por defecto sin UI de administración, SalesEntryComponent, CommissionLedgerComponent con cálculo simple), `mobile-app` (mínimo: V1 Login, V3 Ingresar venta, V2 Home).

**¿Es el walking skeleton?**: Sí — es la porción mínima que atraviesa las 3 capas de la arquitectura (móvil → API → Neon) para probar que el stack completo (React Native + NestJS + PostgreSQL/Neon, con Expo/EAS) funciona de punta a punta antes de construir cada funcionalidad completa. Stack nuevo para el equipo (afirmado en team.md, Q2 de practices-discovery).

**Definition of Done**: un vendedor inicia sesión real (usuario/contraseña), registra una venta del día con un monto válido, y ve en la pantalla Home su comisión y % de avance contra presupuesto ya calculados — contra una base de datos Neon real, desplegado vía Expo en un dispositivo/emulador real, no en mocks.

**Hipótesis de confianza**: el stack completo puede mover datos de extremo a extremo (dispositivo móvil → API NestJS → Postgres Neon → de vuelta a la pantalla) sin fricción de integración mayor entre las 3 tecnologías nuevas para el equipo.

**Demo esperada**: login real de un vendedor sembrado → ingresar una venta con un monto → la pantalla Home refleja la comisión calculada para esa venta.

**Historias cubiertas (parcial)**: US1.1, US3.1, US4.1, US5.1, US5.2 (versión mínima; corrección, offline, y multi-tramo llegan en Bolts posteriores).

**Mob que lo ejecuta**: `aidlc-developer-agent` (ver `team-allocation.md`).

---

## Bolt 1 — Administración de roster y presupuesto

**WSJF**: (Valor de negocio 8 + Urgencia 6 + Reducción de riesgo 3) ÷ Tamaño 5 = **3.4** (el más alto del plan tras el skeleton — ver rationale)

**Unidades incluidas**: `backend-api` (AuthComponent completo con PIN de supervisor, VendorDirectoryComponent completo: CRUD de vendedores y presupuesto con validación), `mobile-app` (A1 Login PIN, A2 Roster, A3 Presupuestos).

**¿Walking skeleton?**: No.

**Definition of Done**: el supervisor (Carlos) autentica con su PIN real, puede crear/editar vendedores (ruta, nombre, canal) y su presupuesto, con rechazo de presupuesto negativo o vacío (AC2.2.2).

**Hipótesis de confianza**: el supervisor puede operar el roster real de ~26 rutas sin que nadie tenga que tocar la base de datos a mano — condición previa para que el resto de los Bolts trabajen con datos reales en vez de datos sembrados a mano.

**Demo esperada**: login con PIN → crear un vendedor nuevo con presupuesto → verlo aparecer en el roster.

**Historias cubiertas**: US1.3, US2.1, US2.2.

**Mob que lo ejecuta**: `aidlc-developer-agent`.

---

## Bolt 2 — Tramos configurables y venta sin conexión

**WSJF crudo**: (Valor de negocio 7 + Urgencia 5 + Reducción de riesgo 9) ÷ Tamaño 8 = **2.625** — el score crudo más bajo del plan, pero se **eleva deliberadamente a la posición 2** (ver `risk-and-sequencing-rationale.md`) porque el usuario identificó explícitamente la sincronización offline como su mayor preocupación (Q6 de `delivery-planning-questions.md`).

**Unidades incluidas**: `backend-api` (CommissionTierComponent completo con validación de orden — guarda con advertencia, ADR-003; SalesEntryComponent: corrección del mismo día, persistencia local y sincronización por fecha), `mobile-app` (A4 Tramos, persistencia local en el dispositivo, formulario de venta precargado para corrección).

**¿Walking skeleton?**: No.

**Definition of Done**: el supervisor configura tramos por canal (preventa "por devolución", autoventa "por efectividad"); un conjunto fuera de orden se guarda con advertencia, no se bloquea (ADR-003); una venta se puede corregir mientras el día está abierto y queda fija tras el cierre (FR3.3); una venta ingresada sin conexión se guarda localmente y sincroniza al recuperar señal, identificada por su propia fecha, sin fusión ni duplicación (ADR-004, AC3.3.4), incluyendo el caso de un fallo de red a mitad del guardado.

**Hipótesis de confianza**: la app sobrevive un ciclo real de "sin señal → recupera señal" (incluida una interrupción a mitad de guardado) sin perder ni duplicar una venta — valida la decisión de sincronización por fecha sin merge (ADR-004) contra un dispositivo real, no solo en el diseño.

**Demo esperada**: poner el dispositivo en modo avión, registrar una venta, reactivar la conexión, y verificar que la venta sincroniza exactamente una vez.

**Historias cubiertas**: US2.3, US3.2, US3.3.

**Mob que lo ejecuta**: `aidlc-developer-agent`.

---

## Bolt 3 — Notificación manual del supervisor

**WSJF**: (Valor de negocio 5 + Urgencia 3 + Reducción de riesgo 2) ÷ Tamaño 3 = **3.33**

**Unidades incluidas**: `backend-api` (NotificationComponent — solo la vía de envío manual: resolver destinatarios uno/varios/todos vía VendorDirectory, confirmar emisor supervisor vía Auth, entregar por el servicio de push), `mobile-app` (A5 Enviar notificación manual).

**¿Walking skeleton?**: No.

**Definition of Done**: el supervisor redacta un mensaje libre y lo envía a uno, varios o todos los vendedores; el vendedor lo recibe como notificación push real en su dispositivo.

**Hipótesis de confianza**: el canal de entrega push (Expo Push) funciona de extremo a extremo contra un dispositivo real — se prueba primero con el caso más simple del componente (envío manual, sin lógica de umbrales) antes de construir la detección automática de umbrales en el Bolt 4, que depende del mismo canal de entrega.

**Demo esperada**: el supervisor envía "Recuerden cerrar el mes con las devoluciones al día" a todos los vendedores → llega como push en el dispositivo del vendedor.

**Historias cubiertas**: US9.1.

**Mob que lo ejecuta**: `aidlc-developer-agent`.

---

## Bolt 4 — Notificaciones automáticas de umbral y devolución

**WSJF**: (Valor de negocio 7 + Urgencia 6 + Reducción de riesgo 5) ÷ Tamaño 6 = **3.0**

**Unidades incluidas**: `backend-api` (CommissionLedgerComponent: cálculo del indicador de devolución; NotificationComponent: detección de cruces de umbral de venta/presupuesto 95/97/100/103/105/110% y de devolución 8.5/8/7.5/7/6/5%, cálculo de la oportunidad de ganancia vía CommissionTierComponent, registro de umbrales ya notificados para no duplicar avisos), `mobile-app` (V5 Notificaciones, agrupadas por tipo).

**¿Walking skeleton?**: No.

**Definition of Done**: al cruzar cualquiera de los umbrales de venta/presupuesto o de devolución definidos por Carlos, se envía la notificación correspondiente exactamente una vez por umbral y por período; la alerta de devolución incluye la oportunidad de ganancia hacia el siguiente tramo mejor, omitida si los tramos del canal están fuera de orden (AC8.3.2); un cambio de presupuesto o tramos a mitad de mes recalcula sin reenviar avisos ya emitidos (ADR de Domain Design, Q4).

**Hipótesis de confianza**: los umbrales exactos que Carlos definió disparan la notificación correcta, en el momento correcto, sin duplicar avisos ya enviados — reutiliza el canal de push ya probado en el Bolt 3.

**Demo esperada**: registrar ventas hasta que la venta acumulada cruce el 95% del presupuesto de un vendedor → llega la notificación de umbral correspondiente.

**Historias cubiertas**: US7.1, US8.1, US8.2, US8.3.

**Mob que lo ejecuta**: `aidlc-developer-agent`.

---

## Bolt 5 — Historial y cierre de período mensual

**WSJF**: (Valor de negocio 6 + Urgencia 4 + Reducción de riesgo 4) ÷ Tamaño 5 = **2.8**

**Unidades incluidas**: `backend-api` (CommissionLedgerComponent: job programado de cierre de período el último día del mes, historial de períodos cerrados), `mobile-app` (V4 Historial).

**¿Walking skeleton?**: No.

**Definition of Done**: el período vigente se cierra automáticamente el último día del mes vía el job programado (FR4.2), queda fijo, y aparece disponible en el historial consultable por el vendedor (FR6).

**Hipótesis de confianza**: el cierre automático corre de forma confiable sin intervención manual del supervisor ni del vendedor.

**Demo esperada**: forzar la ejecución del job de cierre sobre un período de prueba → el período pasa a "cerrado" y aparece en el historial.

**Historias cubiertas**: US4.2, US6.1.

**Mob que lo ejecuta**: `aidlc-developer-agent`.

---

## Bolt 6 — Cierre de sesión, accesibilidad y hardening final

**Sin WSJF** — Bolt de cierre/pulido transversal a toda la app, no una funcionalidad de negocio nueva; se ejecuta al final por definición, independientemente de puntuación.

**Unidades incluidas**: `mobile-app` (V6 Cierre de sesión completo en ambos roles, paso de checklist de accesibilidad WCAG 2.1 AA en las 11 pantallas según `accessibility-checklist.md`), `backend-api` (invalidación de sesión, FR1.4).

**¿Walking skeleton?**: No.

**Definition of Done**: cierre de sesión explícito funcional para vendedor y supervisor; las 11 pantallas (V1–V6, A1–A5) pasan el checklist de accesibilidad WCAG 2.1 AA transversal.

**Hipótesis de confianza**: la app cumple el nivel de accesibilidad objetivo (afirmado en Refined Mockups) antes de la distribución interna vía Expo/EAS — validado, no asumido.

**Demo esperada**: recorrer el checklist de accesibilidad con un lector de pantalla en al menos 2 pantallas representativas (Home, Ingresar venta); cerrar sesión desde ambos roles y confirmar que la sesión queda revocada.

**Historias cubiertas**: US1.2 (si no quedó cubierta en el Bolt 0), transversal de accesibilidad (no mapea a una historia funcional nueva).

**Mob que lo ejecuta**: `aidlc-developer-agent`.

## Resumen de secuencia

| # | Bolt | WSJF | Posición por WSJF puro | Posición en el plan | Motivo de la posición |
|---|---|---|---|---|---|
| 0 | Walking Skeleton | — (no aplica) | — | 1° | Walking skeleton afirmado en team.md — siempre primero, gated |
| 1 | Roster y presupuesto | 3.4 | 1° | 2° | Coincide con su score — mayor valor+urgencia, habilita datos reales |
| 2 | Tramos + venta offline | 2.625 | 5° (último) | 3° | **Elevado deliberadamente** — mayor riesgo señalado explícitamente por el usuario (Q6) |
| 3 | Notificación manual | 3.33 | 2° | 4° | Coincide aprox. con su score — after Bolt2 por decisión de riesgo-primero |
| 4 | Notificaciones automáticas | 3.0 | 3° | 5° | Coincide con su score — depende del canal de push ya probado en Bolt 3 |
| 5 | Historial y cierre | 2.8 | 4° | 6° | Coincide con su score |
| 6 | Cierre de sesión + accesibilidad | — (no aplica) | — | 7° | Bolt de hardening/pulido — siempre al final |
