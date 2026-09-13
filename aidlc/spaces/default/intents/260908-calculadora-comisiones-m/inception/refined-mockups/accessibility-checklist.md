# Accessibility Checklist — WCAG 2.1 AA

## Sources

- [upstream:mockups] `inception/refined-mockups/mockups.md`
- [Q4] Decisión: WCAG 2.1 nivel AA para todo el MVP.

Nivel objetivo: **WCAG 2.1 AA**. Esta checklist cubre las pantallas de `mockups.md`; se revalida en Functional Design/Build and Test con las implementaciones reales (contraste medido, no solo especificado).

## Checklist transversal (aplica a todas las pantallas)

| Criterio WCAG 2.1 AA | Estado en este diseño | Notas |
|---|---|---|
| 1.4.3 Contraste (mínimo) — 4.5:1 texto normal, 3:1 texto grande | Especificado en design-system-mapping.md (tokens de color) | Falta validación con herramienta de contraste una vez definida la guía de marca oficial |
| 1.4.11 Contraste de componentes no textuales — 3:1 | Bordes de error, íconos de grupo | Verificar en Construction con los colores finales |
| 2.5.5 Tamaño del objetivo (target size) — mínimo 44×44pt | PrimaryButton, ítems de lista tocables, BottomNavigation | Resuelve el hallazgo #3 de la revisión de wireframes |
| 2.4.6 Encabezados y etiquetas descriptivos | Cada pantalla mantiene su h1 heredado de wireframes; labels de campo siempre visibles (no placeholder-only) | Ver ValidatedTextInput en interaction-spec.md |
| 3.3.1 Identificación de errores | Todo error de validación es un mensaje de texto visible junto al campo, nunca solo color/ícono | AC3.1.2, AC2.2.2, AC9.1.3 |
| 3.3.3 Sugerencia ante errores | Los mensajes de error indican qué corregir ("Ingresa un monto válido, mayor a 0"), no solo que hay un error | V3, A3, A5 |
| 1.3.1 Info y relaciones (landmarks/estructura) | Heredado de wireframes: header/main/nav marcados por pantalla | Ver wireframes.md, nota de convención de accesibilidad |
| 4.1.3 Mensajes de estado (live regions) | Banners de error y confirmación (ej. "Notificación enviada a N vendedores") se anuncian a lectores de pantalla sin robar el foco | ValidatedTextInput, A5 |
| 1.4.4 Cambio de tamaño de texto hasta 200% sin pérdida de contenido | Layouts de una columna en todas las pantallas — no depende de tamaño fijo de texto | Diseño mobile-first ya cumple esto por defecto |

## Por pantalla

### V1/A1 — Login (Vendedor / Supervisor)

- [ ] Campo de contraseña con toggle de visibilidad accesible (accessibilityLabel "Mostrar contraseña" / "Ocultar contraseña").
- [ ] Error de credenciales anunciado por lector de pantalla al aparecer, sin mover el foco fuera del campo de contraseña.
- [ ] PIN (A1): teclado numérico nativo, no un teclado completo — reduce error de entrada.

### V2 — Home

- [ ] "Comisión ganada" es el primer elemento anunciado tras el título de la pantalla (orden de lectura = orden visual de prioridad de negocio).
- [ ] ProgressBar de presupuesto expone su valor como texto (ej. "62% del presupuesto"), no solo como barra visual.
- [ ] Ícono de venta pendiente de sincronizar (↻) lleva accessibilityLabel explicando el estado, no es solo decorativo.

### V3/A3 — Formularios con validación (Ingresar venta, Presupuestos)

- [ ] Botón deshabilitado expone su estado a lectores de pantalla (accessibilityState={{disabled: true}}), no solo opacidad visual.
- [ ] Al fallar la validación, el foco se mueve automáticamente al primer campo con error.
- [ ] El banner "Sin conexión" (V3) es informativo, no de error — se anuncia con tono neutro (live region "polite", no "assertive").

### V4 — Historial

- [ ] Estado empty tiene mensaje de texto real (no solo un ícono), legible por lector de pantalla.

### V5 — Notificaciones

- [ ] Cada grupo (Venta/Devolución/Manual) usa ícono + texto, nunca solo color, para diferenciarse (cumple 1.4.1 No dependencia del color).
- [ ] El badge de no-leídas en BottomNavigation expone el conteo como texto accesible ("3 notificaciones sin leer"), no solo un punto visual.
- [ ] La oportunidad de ganancia (FR8.3) se lee como parte de la oración de la notificación, no como un número aislado sin contexto.

### A2/A4 — Roster y Tramos (administración)

- [ ] Orden visual de tramos (A4, de mejor a peor beneficio) se refleja también en el orden de lectura de lector de pantalla, no solo visualmente.
- [ ] Advertencia de validación de orden de tramos (AC2.3.2) es un mensaje de texto explícito, mismo patrón que el resto de errores de formulario.

### A5 — Enviar notificación manual

- [ ] El modo de destinatarios (Un/Varios/Todos) usa un `RadioButton.Group` con accessibilityLabel de grupo ("Seleccionar destinatarios"), no solo tres botones sueltos.
- [ ] Confirmación de envío exitoso se anuncia como live region, sin requerir que el usuario la busque visualmente.

## Assumptions & Open Questions

1. [assumption] Esta checklist es de diseño (especificación), no de auditoría de implementación — Build and Test/Functional Design deben re-verificar contraste real y comportamiento de foco sobre el código construido.
