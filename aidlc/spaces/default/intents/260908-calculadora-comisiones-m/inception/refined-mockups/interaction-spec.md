# Interaction Specification — Calculadora de Comisiones (MVP)

Formato heredado de `.claude/knowledge/aidlc-design-agent/component-spec-template.md`. Componentes base sobre React Native Paper (ver `design-system-mapping.md`); solo se documentan aquí las variantes/estados específicos de este proyecto.

## Sources

- [upstream:mockups] `inception/refined-mockups/mockups.md`

## PrimaryButton

| Field | Value |
|---|---|
| Component | PrimaryButton |
| Description | Botón de acción principal por pantalla (Ingresar, Guardar venta, Enviar notificación) |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | Habilitado, listo para tocar | formulario válido |
| disabled | No interactivo, opacidad reducida | campos requeridos vacíos o inválidos [Q1] |
| loading | Spinner reemplaza el texto | tras tocar, mientras espera respuesta del backend |
| error | (no aplica al botón; el error vive en el campo/banner, ver TextInput) | — |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| label | string | yes | — | Texto del botón |
| disabled | boolean | no | false | Deshabilita el botón (ver regla de validación por pantalla) |
| loading | boolean | no | false | Muestra spinner en vez del label |
| onPress | function | yes | — | Handler de la acción |
| fullWidth | boolean | no | true | Ancho completo en formularios móviles |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Único breakpoint soportado en este MVP [Q5] — ancho completo con márgenes de 16dp |
| tablet (768–1024px) | Fuera de alcance del MVP |
| desktop (>1024px) | No aplica (app móvil) |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | button (accessibilityRole="button" en RN) |
| Keyboard interaction | N/A en móvil táctil; foco visible al navegar con lector de pantalla |
| Label / aria-label | accessibilityLabel = label visible del botón |
| Contrast ratio | WCAG AA — 4.5:1 mínimo entre texto y fondo del botón |
| Screen reader | Anuncia label + estado ("deshabilitado" cuando disabled=true) |
| Focus management | Al deshabilitarse tras un error, el foco pasa al primer campo con error, no se queda en el botón |
| Área táctil | Mínimo 44×44pt, heredado del hallazgo #3 de la revisión de wireframes [Q4] |

### Usage Example

```
<PrimaryButton
  label="Guardar venta"
  disabled={!montoValido}
  loading={guardando}
  onPress={handleGuardarVenta}
/>
```

---

## ValidatedTextInput

| Field | Value |
|---|---|
| Component | ValidatedTextInput |
| Description | Campo de texto/numérico con validación inline bloqueante (monto de venta, presupuesto, PIN, mensaje de notificación) |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | Campo vacío o con valor válido, sin interacción reciente | render inicial |
| focus | Campo activo, teclado visible | tap / Tab |
| error | Borde rojo + mensaje inline debajo del campo | validación falla al intentar guardar (no en cada tecla) [Q1] |
| disabled | Campo de solo lectura (ej. venta de un día ya cerrado) | AC3.2.2 |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| value | string | yes | — | Valor actual |
| onChangeText | function | yes | — | Handler de cambio |
| errorMessage | string | no | — | Mensaje mostrado en estado error; su presencia activa el estado |
| keyboardType | string | no | "default" | "numeric" para monto/presupuesto/PIN |
| disabled | boolean | no | false | Solo lectura |
| secureTextEntry | boolean | no | false | Para el campo contraseña (con toggle de visibilidad) |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Ancho completo, altura mínima 44pt |
| tablet / desktop | Fuera de alcance del MVP |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | text field (accessibilityRole no aplica en RN; usar accessibilityLabel + accessibilityHint) |
| Keyboard interaction | Teclado nativo según keyboardType; "Siguiente"/"Listo" navega al campo o acción siguiente |
| Label / aria-label | Label visible siempre presente encima del campo (no placeholder-only, por WCAG AA) |
| Contrast ratio | WCAG AA — texto 4.5:1, borde de error 3:1 mínimo contra el fondo |
| Screen reader | Al entrar en estado error, anuncia el mensaje de error asociado al campo (accessibilityLiveRegion) |
| Focus management | Al fallar la validación, el foco se mueve al primer campo con error |

### Usage Example

```
<ValidatedTextInput
  value={monto}
  onChangeText={setMonto}
  keyboardType="numeric"
  errorMessage={montoInvalido ? "Ingresa un monto válido (mayor a 0)" : undefined}
/>
```

---

## CommissionCard

| Field | Value |
|---|---|
| Component | CommissionCard |
| Description | Card destacada de Home que muestra la comisión ganada — el dato más prominente de la app [FR5.1] |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| default | Monto de comisión visible | datos cargados |
| loading | Skeleton placeholder | consulta en curso |
| error | Banner "No se pudo cargar tu comisión, desliza para reintentar" en vez del monto | falla la consulta al backend |
| stale-offline | Muestra el último valor conocido con un ícono ↻ indicando que puede no reflejar ventas pendientes de sincronizar | hay ventas guardadas localmente sin sincronizar [FR3.4] |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| amount | number | yes | — | Comisión acumulada del período vigente |
| loading | boolean | no | false | Activa el skeleton |
| error | boolean | no | false | Activa el banner de error |
| pendingSync | boolean | no | false | Activa el ícono de sincronización pendiente |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Card ocupa el ancho completo, tipografía de monto grande (≥28pt) |
| tablet / desktop | Fuera de alcance del MVP |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | header/text (accessibilityRole="header" para el título "Comisión ganada") |
| Keyboard interaction | N/A (solo lectura) |
| Label / aria-label | accessibilityLabel anuncia "Comisión ganada: $245.80" como una sola unidad |
| Contrast ratio | WCAG AA — 4.5:1 sobre el fondo de la card |
| Screen reader | pendingSync anuncia "monto puede no incluir ventas recientes sin sincronizar" |
| Focus management | Primer elemento anunciado al entrar a Home tras login |

### Usage Example

```
<CommissionCard amount={245.80} pendingSync={hasSyncPending} />
```

---

## NotificationGroup

| Field | Value |
|---|---|
| Component | NotificationGroup |
| Description | Sección agrupada de la pantalla de Notificaciones (venta/presupuesto, devolución, manuales) [Q2] |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| default | Lista de notificaciones del grupo, más reciente primero | render |
| empty | Grupo no se muestra si no tiene notificaciones (no se renderiza un grupo vacío) | sin notificaciones de ese tipo |
| unread-item | Ítem individual en negrita/punto indicador | notificación no leída |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| groupType | "venta" \| "devolucion" \| "manual" | yes | — | Determina ícono y color del grupo |
| items | array | yes | [] | Notificaciones del grupo |
| earningOpportunity | number | no | — | Solo para groupType="devolucion" (FR8.3): monto adicional que ganaría el vendedor |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Lista vertical de ancho completo |
| tablet / desktop | Fuera de alcance del MVP |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | list / listitem |
| Keyboard interaction | N/A táctil; orden de lectura de lector de pantalla sigue el orden visual (grupo → ítems) |
| Label / aria-label | El encabezado de grupo se anuncia antes de sus ítems ("Devolución, 1 notificación") |
| Contrast ratio | WCAG AA — íconos de color por grupo llevan también una etiqueta de texto, nunca solo color (no depender del color como único indicador) |
| Screen reader | El monto de oportunidad de ganancia (FR8.3) se anuncia como parte del texto de la notificación, no como elemento separado |
| Focus management | Al abrir la pantalla, el badge de no-leídas del ítem de navegación se limpia; el foco inicial va al primer grupo con notificaciones |

### Usage Example

```
<NotificationGroup
  groupType="devolucion"
  items={devolucionNotifs}
  earningOpportunity={18.50}
/>
```

## Assumptions & Open Questions

None.
