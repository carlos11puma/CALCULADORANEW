# Design System Mapping — Calculadora de Comisiones (MVP)

## Sources

- [upstream:mockups] `inception/refined-mockups/mockups.md`
- [Q3] Decisión: React Native Paper con theming mínimo, en vez de construir componentes propios — menor costo dado el presupuesto mínimo/gratuito del proyecto (heredado de Feasibility/constraint-register).

## Decisión de base

React Native Paper (Material Design 3 para React Native) es la librería de componentes base para el MVP. No existe aún una guía de marca oficial de Grupo Bimbo/TIOSA para esta app (heredado del `[assumption]` de wireframes); este MVP usa un tema mínimo (color primario, tipografía) sobre Paper en vez de construir un design system propio, y ese tema se reemplaza cuando llegue la guía oficial sin tener que rehacer componentes.

## Theme tokens (placeholder, pendiente de guía oficial)

| Token | Valor MVP | Uso |
|---|---|---|
| `colors.primary` | `#E4002B` (rojo Bimbo genérico, placeholder) [assumption heredado de wireframes] | Botones primarios, header, ícono de grupo "Venta y presupuesto" |
| `colors.secondary` | `#2E7D32` (verde) | Indicadores positivos (devolución mejorando, ícono de grupo "Devolución") |
| `colors.tertiary` | `#455A64` (gris azulado) | Ícono de grupo "Del supervisor" |
| `colors.error` | `#B00020` (rojo error Material por defecto) | Bordes/mensajes de error inline |
| `colors.background` | `#FAFAFA` | Fondo de pantalla |
| `colors.surface` | `#FFFFFF` | Cards (ej. CommissionCard) |
| `typography.fontFamily` | Fuente sans-serif por defecto del sistema (Roboto en Android, San Francisco en iOS vía Paper) | Toda la app — heredado de "tipografía sans-serif legible en móvil" de wireframes |
| `typography.headlineLarge` | 28pt, bold | Monto de comisión en CommissionCard |
| `typography.titleMedium` | 18pt, semibold | Encabezados de pantalla (h1) |
| `typography.bodyMedium` | 14pt, regular | Texto de lista, labels |
| `shape.borderRadius` | 8dp | Cards, botones, inputs (default de Paper) |

## Mapeo de componentes propios → componentes de React Native Paper

| Componente del proyecto | Base de React Native Paper | Notas |
|---|---|---|
| PrimaryButton | `Button` (mode="contained") | Con `loading` prop nativo de Paper para el estado loading |
| ValidatedTextInput | `TextInput` (mode="outlined") + `HelperText` (type="error") | `HelperText` provee el mensaje inline sin componente custom |
| CommissionCard | `Card` + `Card.Content` | Skeleton de loading vía librería adicional ligera (ej. `react-native-skeleton-placeholder`) solo si el presupuesto/tiempo lo permite; alternativa de bajo costo: `ActivityIndicator` de Paper |
| ProgressBar (avance de presupuesto) | `ProgressBar` | Color dinámico: primary si <100%, secondary (verde) si ≥100% |
| NotificationGroup | `List.Section` + `List.Item` + `List.Icon` | Ícono y color por groupType vía `List.Icon` con color del theme |
| BottomNavigation (Home/Historial/🔔) | `BottomNavigation` | Badge de no-leídas vía prop nativa de badges de Paper |
| TabBar (Roster/Presupuestos/Tramos del admin) | `SegmentedButtons` o `Tabs` de Paper | Tres destinos del mismo dato administrativo, no navegación jerárquica |
| Diálogo de confirmación (cerrar sesión) | `Dialog` | Modal simple con dos acciones (Cancelar/Cerrar sesión) |
| Selector de destinatarios (A5) | `Checkbox.Item` (varios) / `RadioButton.Group` (uno/varios/todos) | Combinación de RadioButton para el modo + Checkbox para la selección múltiple |

## Fuera de alcance del MVP

- Modo oscuro: no evaluado en esta etapa; Paper lo soporta nativamente si se decide agregarlo después.
- Soporte de tablet: fuera de alcance [Q5] — el theme y los componentes de Paper son responsive por defecto, pero el MVP no diseña layouts específicos de tablet.

## Assumptions & Open Questions

1. [assumption] Los valores de color son placeholder hasta recibir la guía de marca oficial de Grupo Bimbo/TIOSA (heredado de wireframes); el cambio a Construction es solo actualizar el objeto `theme`, sin tocar componentes.
