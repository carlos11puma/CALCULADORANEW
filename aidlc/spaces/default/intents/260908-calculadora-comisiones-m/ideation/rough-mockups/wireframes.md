# Wireframes — Calculadora de Comisiones (rough)

Convención de accesibilidad por pantalla: nivel de encabezado (h1–h3), regiones de referencia (header/main/nav/footer) y punto de entrada por teclado/tab. [Q6]

## App del Vendedor

### V1. Login

```
┌─────────────────────────────┐
│  [header] Calculadora        │  h1: "Calculadora de Comisiones"
│           de Comisiones      │
│                               │
│  [main]                      │
│   Usuario: [____________]    │  primer campo enfocable (entrada por teclado)
│   Contraseña: [_________]    │
│                               │
│        [ Ingresar ]          │
│                               │
└─────────────────────────────┘
```
Landmarks: header, main. Entrada por teclado: campo "Usuario". [Q1][Q2]

### V2. Home (lo primero que ve el vendedor: cuánto lleva ganado)

```
┌─────────────────────────────┐
│ [header] Hola, {nombre}      │  h1: nombre del vendedor / ruta
│                               │
│ [main]                       │
│  ┌─────────────────────────┐ │
│  │ COMISIÓN GANADA          │ │  h2 "Comisión ganada" — dato principal
│  │      $ 245.80             │ │
│  └─────────────────────────┘ │
│  Venta acumulada: $3,120.00  │
│  Presupuesto:      $5,000.00 │
│  [▓▓▓▓▓▓░░░░] 62%            │
│                               │
│      [ Ingresar venta de hoy ]│  botón principal, primer foco tras header
│                               │
│ [nav] Home | Historial | 🔔  │  footer/nav con 3 destinos
└─────────────────────────────┘
```
Landmarks: header, main, nav (footer). Entrada por teclado: botón "Ingresar venta de hoy". [Q2][Q3]

### V3. Ingresar venta del día

```
┌─────────────────────────────┐
│ [header] Ingresar venta      │  h1
│                               │
│ [main]                       │
│  Fecha: hoy (auto)           │
│  Monto vendido: [_________]  │  primer campo enfocable
│  Devoluciones (opc.): [____] │
│                               │
│        [ Guardar venta ]     │
│                               │
│  ↳ al guardar: recalcula     │
│    comisión y vuelve a Home  │
└─────────────────────────────┘
```
Landmarks: header, main. Entrada por teclado: campo "Monto vendido". [Q2]

### V4. Historial (períodos anteriores)

```
┌─────────────────────────────┐
│ [header] Historial            │  h1
│                               │
│ [main]                       │
│  Agosto 2026   $412.30       │  h3 por período, lista
│  Julio 2026    $389.10       │
│  Junio 2026    $455.00       │
│                               │
│ [nav] Home | Historial | 🔔  │
└─────────────────────────────┘
```
Landmarks: header, main, nav. [Q1]

### V5. Notificaciones

```
┌─────────────────────────────┐
│ [header] Notificaciones       │  h1
│                               │
│ [main]                       │
│  🔔 Estás a $200 de tu meta  │  h3 por notificación, lista
│  🔔 Nueva comisión calculada │
│                               │
│ [nav] Home | Historial | 🔔  │
└─────────────────────────────┘
```
Landmarks: header, main, nav. [Q1]

## Panel del Administrador (Carlos)

### A1. Login con PIN

```
┌─────────────────────────────┐
│ [header] Administración       │  h1
│                               │
│ [main]                       │
│   PIN: [ • • • • ]           │  primer campo enfocable
│        [ Ingresar ]          │
└─────────────────────────────┘
```
Landmarks: header, main. Entrada por teclado: campo PIN. [Q2]

### A2. Roster de vendedores (vista principal del admin)

```
┌─────────────────────────────┐
│ [header] Roster · 26 rutas    │  h1
│                               │
│ [main]                       │
│  Ruta 014461 · Juan Pérez    │  h3 por vendedor, lista
│   Preventa · Ppto $5,000     │
│  Ruta 014462 · Ana Ruiz      │
│   Autoventa · Ppto $4,200    │
│  ...                          │
│                               │
│        [ + Agregar ]         │
│                               │
│ [nav] Roster | Presupuestos | Tramos │
└─────────────────────────────┘
```
Landmarks: header, main, nav. Entrada por teclado: botón "+ Agregar". [Q3]

### A3. Presupuestos y A4. Tramos de comisión

Siguen la misma estructura de lista editable que A2 (heredada de la app web actual "Mi Comisión"), con formulario de edición por fila. [Q3][upstream:intent-statement]

## Estilo visual

Paleta de trabajo: rojo característico de marca Bimbo (`#E4002B` aprox.) sobre fondo claro, tipografía sans-serif legible en móvil. [assumption] No se recibieron assets oficiales de marca (logo, guía de estilo, códigos hex exactos) — validar con la guía real de Grupo Bimbo/TIOSA antes de Construction. [Q4]

## Assumptions & Open Questions

1. [assumption] Colores de marca son un placeholder (rojo Bimbo genérico) hasta recibir la guía oficial.

## Review

**Reviewer:** aidlc-product-lead-agent
**Iteration:** 1

Fortalezas: la jerarquía de información en Home (V2) pone la comisión ganada como el dato más prominente, coherente con la métrica de éxito "uso en campo" de Intent Capture. El flujo de dos roles (vendedor/admin) está claramente separado.

Hallazgos (no bloquean esta etapa, pasan a Functional/UX Design en Inception):
1. V3 (Ingresar venta) no define el estado de error — ¿qué ve el vendedor si ingresa un monto negativo, vacío, o si pierde conexión al guardar? Sin esto, QA no podría escribir un caso de prueba de validación.
2. No hay pantalla ni botón de cierre de sesión (logout) en ninguno de los dos roles — un vendedor que comparte el dispositivo con otro vendedor no tiene forma visible de salir.
3. La nota de accesibilidad cubre jerarquía de encabezados y landmarks, pero no tamaño mínimo de área táctil (44×44pt aprox.) para los botones principales en móvil — recomendado agregarlo en Refined Mockups.

**Verdict:** READY

Los wireframes son suficientes para avanzar a diseño funcional; los tres hallazgos anteriores deben resolverse antes de Refined Mockups/Functional Design.
