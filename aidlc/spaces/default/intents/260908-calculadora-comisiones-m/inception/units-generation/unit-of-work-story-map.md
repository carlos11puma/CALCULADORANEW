# Units Generation — Unit / Story Map

## Sources

- [upstream:stories] `inception/user-stories/stories.md`
- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`

api-contract (U1) no implementa historias directamente — es el contrato consumido por U2 y U3; su cobertura se expresa a través de las historias que dependen de él vía backend-api/mobile-app.

## Mapa de historias

| Historia | Unit(es) | Directory(s) | Cruza unidades |
|---|---|---|---|
| US1.1 Inicio de sesión del vendedor | U2, U3 | u2-backend-api, u3-mobile-app | Sí — lógica de autenticación (U2) + pantalla de login (U3) |
| US1.2 Cierre de sesión del vendedor | U2, U3 | u2-backend-api, u3-mobile-app | Sí — invalidar sesión (U2) + botón/menú (U3) |
| US1.3 Inicio de sesión del supervisor | U2, U3 | u2-backend-api, u3-mobile-app | Sí — validar PIN (U2) + pantalla de login PIN (U3) |
| US1.4 Modelo de datos multi-supervisor | U2 | u2-backend-api | No — solo modelo de datos, sin historia de UI propia |
| US2.1 Gestión del roster | U2, U3 | u2-backend-api, u3-mobile-app | Sí — CRUD de vendedores (U2) + pantalla Roster A2 (U3) |
| US2.2 Gestión de presupuestos | U2, U3 | u2-backend-api, u3-mobile-app | Sí — validación de presupuesto (U2) + pantalla A3 (U3) |
| US2.3 Gestión de tramos de comisión | U2, U3 | u2-backend-api, u3-mobile-app | Sí — validación de orden con advertencia (U2) + pantalla A4 (U3) |
| US3.1 Registrar venta del día (con conexión) | U2, U3 | u2-backend-api, u3-mobile-app | Sí — validación y persistencia (U2) + pantalla V3 (U3) |
| US3.2 Corregir venta del mismo día | U2, U3 | u2-backend-api, u3-mobile-app | Sí — regla de edición hasta cierre (U2) + formulario precargado (U3) |
| US3.3 Registrar venta sin conexión | U3, U2 | u3-mobile-app, u2-backend-api | Sí — persistencia local y sincronización por fecha (U3, con endpoint de recepción en U2) |
| US4.1 Cálculo automático de comisión por tramos | U2 | u2-backend-api | No — cálculo puro de backend, consumido por el reporte (US5) |
| US4.2 Cierre de período mensual | U2 | u2-backend-api | No — job programado de backend |
| US5.1 Ver comisión ganada en pantalla principal | U2, U3 | u2-backend-api, u3-mobile-app | Sí — dato calculado (U2) + Home V2 (U3) |
| US5.2 Ver venta acumulada frente al presupuesto | U2, U3 | u2-backend-api, u3-mobile-app | Sí |
| US5.3 Actualización en tiempo real | U2, U3 | u2-backend-api, u3-mobile-app | Sí |
| US6.1 Consultar períodos anteriores | U2, U3 | u2-backend-api, u3-mobile-app | Sí — historial cerrado (U2) + pantalla V4 (U3) |
| US7.1 Notificación al cruzar umbrales de venta/presupuesto | U2, U3 | u2-backend-api, u3-mobile-app | Sí — detección de umbral y envío (U2) + agrupación en V5 (U3) |
| US8.1 Cálculo del indicador de devolución | U2 | u2-backend-api | No — cálculo puro de backend |
| US8.2 Notificación al mejorar el indicador de devolución | U2, U3 | u2-backend-api, u3-mobile-app | Sí |
| US8.3 Oportunidad de ganancia en la alerta de devolución | U2, U3 | u2-backend-api, u3-mobile-app | Sí — cálculo de oportunidad (U2) + texto en la notificación (U3) |
| US9.1 Enviar notificación manual | U2, U3 | u2-backend-api, u3-mobile-app | Sí — envío (U2) + pantalla A5 (U3) |

## Orden de implementación dentro de cada unidad

**backend-api (U2)**: Auth → VendorDirectory → CommissionTier → SalesEntry → CommissionLedger → Notification — el orden natural de dependencias entre componentes de dominio (components.md), consistente con la walking-skeleton acordada en Practices Discovery (login → ingresar venta → ver comisión calculada).

**mobile-app (U3)**: Login (V1/A1) → Home (V2) → Ingresar venta (V3) → Historial (V4) → Notificaciones (V5) → pantallas de administración (A2–A5) — misma lógica de walking-skeleton, mostrando primero el flujo de punta a punta del vendedor antes de las pantallas administrativas.

Este orden dentro de cada unidad es una nota de implementación local a la unidad, no una secuencia económica de Bolts — esa decisión pertenece a Delivery Planning (2.9).

## Verificación de cobertura

- Las 21 historias de `stories.md` (US1.1–US9.1) están asignadas a al menos una unidad. Ninguna historia queda sin unidad implementadora.
- Las 3 unidades tienen al menos una historia asignada: U2 (backend-api) implementa las 21; U3 (mobile-app) implementa las 17 con componente de UI; U1 (api-contract) no tiene historias propias por ser una unidad `spec` consumida por U2 y U3 (ver nota en Sources).
