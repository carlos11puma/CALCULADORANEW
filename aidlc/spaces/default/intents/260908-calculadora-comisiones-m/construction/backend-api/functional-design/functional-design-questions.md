# Functional Design — backend-api — Questions

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:unit-of-work-story-map] `inception/units-generation/unit-of-work-story-map.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:decisions] `inception/domain-design/decisions.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

`backend-api` (U2, kind `service`) implementa el `behaviour` de los 6 componentes de dominio tal cual quedaron definidos en Domain Design — esta unidad no redefine reglas de negocio ya decididas, pero varias quedaron explícitamente diferidas a esta etapa por los propios ADR y por la revisión de Requirements Analysis. Estas preguntas cubren esos puntos diferidos, no decisiones ya tomadas.

## Q1. NFR Requirements de `api-contract` dejó pendiente la duración de la sesión de supervisor (a diferencia del vendedor, que es sin expiración por tiempo — FR1.4). ¿Cuánto dura la sesión de supervisor?

A. Igual que el vendedor: sin expiración por tiempo, válida hasta logout explícito — más simple, un solo comportamiento de sesión en todo el sistema, y el supervisor es un solo usuario humano (Carlos) que no comparte el dispositivo
B. Expira tras un período corto de inactividad (ej. 30 minutos) — más restrictivo dado que el PIN es un mecanismo de autenticación más débil que usuario/contraseña
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Igual que el vendedor: sin expiración por tiempo, válida hasta logout explícito.

## Q2. ADR-004 (positivo) deja abierto qué pasa si una venta pendiente de sincronizar (guardada offline) cae en una fecha cuyo período mensual ya cerró por el job programado (ADR-005). ¿Qué hace `POST /api/v1/sales/sync`?

A. Rechazar ese ítem del lote con `status: rejected` y un `Error` con código `PERIOD_CLOSED` — mismo tratamiento que corregir directamente un día cerrado (FR3.3, BR3.2); el resto de ítems del lote se procesan normalmente (cada ítem es independiente, ya decidido en ADR-004)
B. Aceptar la venta igual y reabrir el período cerrado, recalculando la comisión ya cerrada
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Rechazar ese ítem con status: rejected y código PERIOD_CLOSED, sin afectar el resto del lote.

## Q3. ADR-004 (negativo) señala el caso de borde de dos dispositivos del mismo vendedor editando la misma fecha mientras ambos están offline — `contract-summary.md` ya asumió "el último en sincronizar gana" como semántica de contrato pendiente de confirmar aquí. ¿Se confirma esa semántica o se agrega una regla de detección de conflicto?

A. Confirmar "el último en sincronizar gana" tal cual — se acepta el riesgo dado el patrón de uso real (un dispositivo por vendedor, caso infrecuente); agregar detección de conflicto sería complejidad no justificada para el MVP
B. Agregar un campo de control (ej. `updatedAt` del lado del dispositivo) para que el backend detecte y devuelva una advertencia cuando dos sincronizaciones distintas escriben la misma fecha en una ventana corta de tiempo
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Confirmar "el último en sincronizar gana" — se acepta el riesgo, sin agregar detección de conflicto.

## Q4. La revisión de Requirements Analysis señaló que FR1.3 (login individual del vendedor con usuario/contraseña) no define un flujo de recuperación de contraseña. ¿Se incluye en el alcance de `backend-api` para este MVP?

A. Fuera de alcance del MVP — si un vendedor olvida su contraseña, el supervisor la restablece manualmente (ya tiene acceso administrativo al roster vía `PATCH /api/v1/vendors/{vendorId}`, aunque ese endpoint no cubre credenciales todavía — se resolvería como una operación administrativa directa en base de datos por ahora, dado el volumen de ~26 rutas y que Carlos es el único supervisor activo)
B. Incluir un flujo propio de recuperación (ej. pregunta de seguridad o reseteo por PIN del supervisor vía un endpoint dedicado)
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Fuera de alcance del MVP — el supervisor restablece manualmente si un vendedor olvida su contraseña.

## Q5. El hallazgo #2 de la revisión de `contract-summary.md` (Open Questions) preguntaba si `CommissionPeriod` debe registrar con qué configuración de tramos se calculó, para trazabilidad si el supervisor corrige el orden después (también señalado como hallazgo #4 de la revisión de `components.md`). ¿Se agrega ese campo en esta etapa?

A. Sí — agregar `tierSnapshot` (arreglo de los tramos vigentes del canal al momento del cálculo) a `CommissionPeriod`, de solo lectura, poblado por `CommissionLedgerComponent` en cada recálculo — es un campo aditivo (no rompe el contrato existente, `contract-summary.md` ya lo anticipó como adición segura) y da trazabilidad real si el supervisor corrige tramos después de que un período cerró
B. No agregarlo en este MVP — postergar hasta que exista un caso de uso real que lo necesite (el supervisor corrigiendo tramos retroactivamente no está en el alcance actual)
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: B. No agregarlo en este MVP — postergar hasta que haya un caso de uso real.

## Q6. `NotificationComponent` debe recordar qué umbrales de venta/presupuesto (FR7.1) y de devolución (FR8.2) ya se notificaron en el período vigente, para no reenviar (ADR-006) ni duplicar (regla de `Notification`, "un mismo (vendorId, type, thresholdCrossed, periodo vigente) nunca se notifica dos veces"). ¿Cómo se modela ese seguimiento?

A. Se deriva directamente de los registros `Notification` ya enviados en el período vigente (filtrar por vendorId + type + periodo actual y comparar `thresholdCrossed` contra los ya presentes) — sin entidad ni campo adicional, reutiliza la entidad que de todas formas hay que persistir para el historial de notificaciones (FR7/FR8/pantalla V5)
B. Mantener un campo separado de "umbrales notificados" en `CommissionPeriod`, redundante con la lista de `Notification` ya enviadas
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Se deriva directamente de los registros Notification ya enviados en el período vigente, sin entidad ni campo adicional.

## Consolidated Summary Confirmation

- Sesión de supervisor: sin expiración por tiempo, igual que el vendedor — hasta logout explícito
- Sincronización con fecha en período cerrado: se rechaza ese ítem (`status: rejected`, `PERIOD_CLOSED`), sin afectar el resto del lote
- Conflicto de dos dispositivos offline en la misma fecha: se confirma "el último en sincronizar gana", riesgo aceptado, sin detección adicional
- Recuperación de contraseña de vendedor: fuera de alcance del MVP — restablecimiento manual por el supervisor
- Snapshot de configuración de tramos en `CommissionPeriod`: no se agrega en este MVP
- Seguimiento de umbrales ya notificados: se deriva de los registros `Notification` existentes, sin entidad ni campo adicional

Does this all look correct before I generate the Functional Design artifacts for backend-api?

- Looks correct
- Request changes

[Answer]: Looks correct
