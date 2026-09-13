# Functional Design — mobile-app — Componentes de Frontend

## Sources

- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`
- [upstream:mockups] `inception/refined-mockups/mockups.md`
- [upstream:design-system-mapping] `inception/refined-mockups/design-system-mapping.md`
- [upstream:accessibility-checklist] `inception/refined-mockups/accessibility-checklist.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

Jerarquía de componentes, props/estado y validación de formularios para las 11 pantallas de `functional-spec.md`. Base: React Native Paper (`design-system-mapping.md`); navegación con `BottomNavigation` (app del vendedor) y `SegmentedButtons`/`Tabs` (panel del administrador).

## Jerarquía de navegación

```
App
├─ AuthStack (sin sesión)
│  ├─ VendorLoginScreen (V1)
│  └─ SupervisorLoginScreen (A1)
├─ VendorTabs (sesión rol=vendedor) — BottomNavigation
│  ├─ HomeScreen (V2)
│  ├─ SalesEntryScreen (V3) — modal/push desde HomeScreen, no un tab propio
│  ├─ HistoryScreen (V4)
│  └─ NotificationsScreen (V5)
└─ AdminTabs (sesión rol=supervisor) — SegmentedButtons/Tabs
   ├─ RosterScreen (A2)
   ├─ BudgetsScreen (A3)
   ├─ TiersScreen (A4)
   └─ ManualNotificationScreen (A5) — accesible desde menú de A2, no un tab propio
```

## Componentes compartidos (transversales)

| Componente | Base Paper | Props | Uso |
|---|---|---|---|
| `PrimaryButton` | `Button` (mode="contained") | `label`, `onPress`, `disabled`, `loading` | Todas las pantallas con una acción principal |
| `ValidatedTextInput` | `TextInput` (mode="outlined") + `HelperText` | `label`, `value`, `onChangeText`, `error?: string`, `keyboardType?` | V1, V3, A3, A4, A5 |
| `OfflineBanner` | `Banner` | `visible: boolean`, `message` | V2, V3 (mensaje "↻ Sin conexión...") |
| `ErrorBanner` | `Banner` (color error) | `visible`, `message`, `onRetry?` | Cualquier pantalla con estado `error` |
| `SkeletonCard` / `SkeletonListItem` | `ActivityIndicator` (fallback de bajo costo, per `design-system-mapping.md`) | `count?` | V2, V4, A2 en estado `loading` |
| `ConfirmDialog` | `Dialog` | `visible`, `title`, `message`, `onConfirm`, `onCancel` | V6 (cerrar sesión) |
| `SessionGate` (no visual) | — | `children` | Envuelve `VendorTabs`/`AdminTabs`; escucha el interceptor 401 de MW9 y redirige |
| `SyncStatusIcon` | ícono `↻` custom sobre `IconButton` | `pendingCount: number` | V2 (junto al monto de comisión), V3 (banner) |

## Componentes por pantalla

### V1 — VendorLoginScreen

- **Estado local**: `username: string`, `password: string`, `passwordVisible: boolean`, `status: 'idle'|'loading'|'error'`, `errorMessage?: string`.
- **Componentes**: `ValidatedTextInput` (usuario), `ValidatedTextInput` (contraseña, `secureTextEntry={!passwordVisible}`, ícono toggle 👁), `ErrorBanner`, `PrimaryButton` (deshabilitado si `!username || !password`, `loading={status==='loading'}`).
- **Validación**: solo "no vacío" en cliente (UX inmediata); la validación real de credenciales es del backend (MW1).
- **Integración API**: `POST /api/v1/auth/login/vendedor` al tocar el botón.

### A1 — SupervisorLoginScreen

- **Estado local**: `pin: string` (máx. 4 dígitos), `status`, `errorMessage?`.
- **Componentes**: input numérico tipo PIN (`TextInput` con `keyboardType="number-pad"`, `maxLength={4}`, render enmascarado `• • • •`), `ErrorBanner`, `PrimaryButton` (deshabilitado hasta `pin.length === 4`).
- **Integración API**: `POST /api/v1/auth/login/supervisor`.

### V2 — HomeScreen

- **Estado local/derivado**: `commission: CommissionPeriod | null`, `status: 'loading'|'success'|'error'`, `pendingSalesCount: number` (derivado de `pending_sales` local, Q1), `returnRateTrend: 'up'|'down'|'flat'` (comparado contra el valor mostrado en la última carga de esta sesión, no persistido entre sesiones).
- **Componentes**: `CommissionCard` (`Card`+`Card.Content`, muestra `commissionEarned` en `typography.headlineLarge`), `ProgressBar` (color dinámico: `primary` si `budgetProgress < 100`, `secondary` si `≥ 100`, per `design-system-mapping.md`), badge de indicador de devolución (`Chip` o texto con ícono ▼/▲ según `returnRateTrend`), `SyncStatusIcon` (visible si `pendingSalesCount > 0`), `PrimaryButton` ("Ingresar venta de hoy" → navega a V3), `BottomNavigation` (Home/Historial/🔔, badge de no-leídas desde el estado de notificaciones de V5), `SkeletonCard` en `status==='loading'`, `ErrorBanner` con `onRetry` (pull-to-refresh) en `status==='error'`.
- **Integración API**: `GET /api/v1/commission/current`; re-fetch tras MW6/MW8.

### V3 — SalesEntryScreen

- **Estado local**: `amount: string`, `returns: string`, `mode: 'create'|'edit'|'readonly'`, `validationError?: string`, `isOffline: boolean` (de `NetInfo`, Q3), `saveStatus: 'idle'|'saving'|'error'`.
- **Componentes**: texto de fecha (hoy, `dd/mm`, no editable), `ValidatedTextInput` (Monto vendido, `keyboardType="decimal-pad"`), `ValidatedTextInput` (Devoluciones, opcional), `OfflineBanner` (visible si `isOffline`), `PrimaryButton` ("Guardar venta", deshabilitado si `!amount || parseFloat(amount) <= 0`).
- **Validación de formulario**: monto obligatorio y `> 0` (bloqueante, banner inline "⚠ Ingresa un monto válido (mayor a 0)" solo tras el primer intento fallido de guardado — no en cada tecla); devoluciones opcional, si se ingresa debe ser `≥ 0`.
- **Integración API**: con conexión → `POST /api/v1/sales`; sin conexión o fallo de red a mitad de envío → escritura local en `pending_sales` (`expo-sqlite`, Q1), sin llamada HTTP.
- **Modo `readonly`**: se activa tras un `409 PERIOD_CLOSED` — todos los inputs y el botón quedan deshabilitados, con el aviso "Este día ya cerró".

### V4 — HistoryScreen

- **Estado local**: `periods: CommissionPeriod[]`, `status: 'loading'|'success'|'empty'|'error'`.
- **Componentes**: `List.Section`/`List.Item` por período (mes, venta, comisión), `SkeletonListItem` (×3) en `loading`, texto vacío "Aún no tienes períodos cerrados" en `empty`.
- **Integración API**: `GET /api/v1/commission/history`.

### V5 — NotificationsScreen

- **Estado local**: `notifications: Notification[]`, `status: 'loading'|'success'|'empty'|'error'`, agrupación derivada por `type` (no es estado propio, se calcula con `useMemo` sobre `notifications`).
- **Componentes**: `List.Section` × 3 (`VENTA Y PRESUPUESTO` ícono 🎯 color primario, `DEVOLUCIÓN` ícono 📉 color secundario, `DEL SUPERVISOR` ícono 📣 color terciario — tokens de `design-system-mapping.md`), `List.Item` por notificación (negrita si no leída), texto de oportunidad de ganancia como línea secundaria del `List.Item` cuando `earningOpportunity != null`.
- **Integración API**: `GET /api/v1/notifications` al montar la pantalla; limpia el badge local de `expo-notifications` (Q4) al completar la carga.

### V6 — Diálogo de cierre de sesión

- Ver `ConfirmDialog` en Componentes compartidos; se dispara desde el menú de perfil del header de V2 o del panel de administración, no es una ruta de navegación propia.

### A2 — RosterScreen

- **Estado local**: `vendors: Vendor[]`, `status`, `editingVendor: Vendor | null` (formulario de edición inline o modal), `formError?: string`.
- **Componentes**: `List.Item` por vendedor (ruta, nombre, canal, presupuesto), ícono lápiz de edición (deslizar o tocar), FAB o `PrimaryButton` full-width "+ Agregar", `SegmentedButtons`/`Tabs` (Roster/Presupuestos/Tramos), `SkeletonListItem`, `ValidatedTextInput` × 2 (ruta, nombre) + selector de canal (`SegmentedButtons` Preventa/Autoventa) en el formulario de agregar/editar.
- **Integración API**: `GET /api/v1/vendors`, `POST /api/v1/vendors` (agregar), `PATCH /api/v1/vendors/{vendorId}` (editar ruta/canal).

### A3 — BudgetsScreen

- **Estado local**: comparte `vendors` con A2 (mismo tab group), `editingBudget: { vendorId, value } | null`, `formError?: string`.
- **Componentes**: misma lista de A2 con edición inline de "Presupuesto" (`ValidatedTextInput`, `keyboardType="decimal-pad"`), banner "⚠ El presupuesto debe ser mayor a 0" (bloqueante).
- **Integración API**: `PATCH /api/v1/vendors/{vendorId}` con `budget`.

### A4 — TiersScreen

- **Estado local**: `channel: 'preventa'|'autoventa'`, `tiers: CommissionTier[]`, `inOrder: boolean`, `warning?: string`, `status`.
- **Componentes**: selector de canal (`SegmentedButtons`, no un `Dropdown` nativo — dos opciones fijas), `List.Item` editable por tramo (umbral, comisión) en orden visual de mejor a peor beneficio, `PrimaryButton` "+ Agregar tramo", banner de advertencia (no bloqueante, `Banner` color warning distinto del `error`) cuando `warning === 'TIER_ORDER_WARNING'`.
- **Integración API**: `GET /api/v1/tiers?channel=...`, `PUT /api/v1/tiers` (reemplaza el conjunto completo del canal).

### A5 — ManualNotificationScreen

- **Estado local**: `mode: 'one'|'several'|'all'`, `selectedVendorIds: string[]`, `message: string`, `status: 'idle'|'sending'|'success'|'error'`, `validationError?: string`.
- **Componentes**: `RadioButton.Group` (Un vendedor / Varios vendedores / Todos los vendedores), `Checkbox.Item` × N (lista de vendedores del roster ya cargado en A2, visible solo si `mode !== 'all'`), `ValidatedTextInput` multilínea (mensaje), `PrimaryButton` "Enviar notificación" (deshabilitado si `!message.trim() || (mode !== 'all' && selectedVendorIds.length === 0)`), confirmación breve tipo `Snackbar` ("Notificación enviada a N vendedores") en `status==='success'`.
- **Integración API**: `POST /api/v1/notifications/manual` con `recipients` derivado de `mode`/`selectedVendorIds`.

## Accesibilidad (WCAG 2.1 AA, `accessibility-checklist.md`)

- Área táctil mínima 44×44pt en todo elemento interactivo (`PrimaryButton`, `List.Item`, íconos de acción) — heredado directamente del checklist, aplicado por defecto en los componentes de Paper usados arriba salvo indicación contraria.
- Todo `ValidatedTextInput` con error asocia su `HelperText` vía `accessibilityLabel`/`accessibilityHint` para que el lector de pantalla anuncie el error al enfocar el campo, no solo visualmente.
- Contraste de color verificado contra los `theme tokens` de `design-system-mapping.md` (placeholder hasta la guía de marca oficial) — Build and Test debe re-verificar si el theme cambia.

## Assumptions & Open Questions

None.
