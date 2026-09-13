# Refined Mockups — Calculadora de Comisiones (MVP)

## Sources

- [upstream:wireframes] `ideation/rough-mockups/wireframes.md`
- [upstream:stories] `inception/user-stories/stories.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`

Solo teléfonos en este MVP (no tablet), para ambos roles. [Q5]

## App del Vendedor

### V1. Login — refina wireframe V1 [US1.1]

```
┌─────────────────────────────┐
│  Calculadora de Comisiones   │  h1
│                               │
│  Usuario                     │
│  [________________]          │  TextInput (RN Paper)
│  Contraseña                  │
│  [________________] 👁       │  TextInput con toggle mostrar/ocultar
│                               │
│  ⚠ Usuario o contraseña      │  estado error: banner inline, rojo,
│    incorrectos                │  bajo los campos, no bloquea reintento
│                               │
│        [ Ingresar ]          │  Button (primary), deshabilitado si
│                               │  campos vacíos
└─────────────────────────────┘
```

Estados: default, loading (botón muestra spinner tras tocar "Ingresar"), error (credenciales inválidas — banner inline, campos no se limpian). [FR1.3]

### V2. Home — refina wireframe V2 [US5.1, US5.2, US5.3]

```
┌─────────────────────────────┐
│ Hola, {nombre} · Ruta {ruta} │  h1
│                               │
│  ┌─────────────────────────┐ │
│  │ COMISIÓN GANADA          │ │  Card destacada (elevación alta)
│  │      $ 245.80             │ │  h2, tipografía más grande de la app
│  └─────────────────────────┘ │
│  Venta acumulada  $3,120.00  │
│  Presupuesto      $5,000.00  │
│  [▓▓▓▓▓▓░░░░] 62%             │  ProgressBar (RN Paper), color según
│                               │  % (ver design-system-mapping)
│  Indicador de devolución      │
│  6.2%  ▼ mejorando            │  badge verde si baja vs. período anterior
│                               │
│      [ Ingresar venta de hoy ]│  Button (primary), full-width
│                               │
│ Home | Historial | 🔔(3)     │  BottomNavigation con badge de no-leídas
└─────────────────────────────┘
```

Estados: loading (skeleton de la card mientras carga), error (banner "No se pudo cargar tu comisión, desliza para reintentar" si falla la consulta), success (como arriba), venta-pendiente-sync (icono ↻ junto al monto si hay ventas sin sincronizar, ver V3). [FR5.1, FR5.2, FR5.3, FR8.1]

### V3. Ingresar venta del día — refina wireframe V3 [US3.1, US3.2, US3.3]

```
┌─────────────────────────────┐
│ Ingresar venta                │  h1
│                               │
│  Fecha: hoy, {dd/mm}          │
│  Monto vendido *              │
│  [_________________]          │  TextInput numérico
│  ⚠ Ingresa un monto válido    │  error inline bajo el campo — visible
│    (mayor a 0)                 │  solo tras intento de guardar inválido
│  Devoluciones (opcional)      │
│  [_________________]          │
│                               │
│  ↻ Sin conexión: se guardará  │  banner informativo (no error) cuando
│    localmente y sincronizará  │  el dispositivo detecta que no hay red
│    cuando vuelva la señal      │  al abrir esta pantalla
│                               │
│     [ Guardar venta ]         │  deshabilitado si Monto vendido está
│                               │  vacío o ≤ 0 [Q1]
└─────────────────────────────┘
```

Estados: default, error-validación (banner inline + botón deshabilitado, no se guarda hasta corregir — AC3.1.2/AC3.3.4), offline (banner "Sin conexión" pero el flujo de guardado NO cambia — se guarda local igual que con conexión), ya-registrada-hoy (si ya existe venta hoy, el formulario carga precargado con el valor existente para edición, en vez de un formulario vacío — AC3.2.1), cerrada (si el día ya cerró, el formulario es de solo lectura con aviso "Este día ya cerró"). [FR3.1–FR3.4]

### V4. Historial — refina wireframe V4 [US6.1]

```
┌─────────────────────────────┐
│ Historial                     │  h1
│                               │
│  Agosto 2026                  │  ListItem expandible
│   Venta $9,845 · Com. $412.30 │
│  Julio 2026                   │
│   Venta $8,920 · Com. $389.10 │
│  Junio 2026                   │
│   Venta $10,110 · Com. $455.00│
│                               │
│  (vacío: "Aún no tienes       │  estado empty para vendedores nuevos
│   períodos cerrados")          │
│                               │
│ Home | Historial | 🔔(3)     │
└─────────────────────────────┘
```

Estados: default (lista), empty (vendedor sin períodos cerrados aún), loading (skeleton de 3 filas). [FR6.1]

### V5. Notificaciones — refina wireframe V5, agrupada por tipo [Q2][US7.1, US8.2, US9.1]

```
┌─────────────────────────────┐
│ Notificaciones                │  h1
│                               │
│  VENTA Y PRESUPUESTO          │  h2 de grupo, ícono 🎯, color primario
│  🎯 Alcanzaste 100% de tu     │
│     presupuesto                │
│  🎯 Alcanzaste 95% de tu      │
│     presupuesto                │
│                               │
│  DEVOLUCIÓN                   │  h2 de grupo, ícono 📉, color verde
│  📉 Tu devolución bajó a      │
│     7.5% — podrías ganar      │
│     $18.50 más si llegas a 7% │  incluye oportunidad de ganancia [FR8.3]
│                               │
│  DEL SUPERVISOR               │  h2 de grupo, ícono 📣, color secundario
│  📣 "¡Incentivo doble esta    │
│     semana en Ruta 014461!"   │
│                               │
│ Home | Historial | 🔔        │  badge de no-leídas se limpia al abrir
└─────────────────────────────┘
```

Estados: default (agrupado, más reciente primero dentro de cada grupo), empty ("Aún no tienes notificaciones"), no-leída (punto/negrita) vs. leída (texto normal). [FR7.1, FR8.2, FR8.3, FR9.1]

### V6. Cierre de sesión (nuevo — resuelve hallazgo #2 de la revisión de wireframes) [US1.2]

Botón "Cerrar sesión" visible en un menú accesible desde el header de Home (ícono de perfil/tres puntos), no una pantalla aparte — confirma con un diálogo simple antes de cerrar sesión.

## Panel del Administrador (Carlos)

### A1. Login con PIN — refina wireframe A1 [US1.3]

```
┌─────────────────────────────┐
│ Administración                 │  h1
│                               │
│   PIN                         │
│   [ • • • • ]                 │  input numérico tipo PIN, teclado
│                               │  numérico nativo
│  ⚠ PIN incorrecto             │  error inline, no bloquea reintento
│                               │
│        [ Ingresar ]          │  deshabilitado hasta 4 dígitos
└─────────────────────────────┘
```

### A2. Roster de vendedores — refina wireframe A2 [US2.1]

```
┌─────────────────────────────┐
│ Roster · 26 rutas             │  h1
│                               │
│  Ruta 014461 · Juan Pérez    │  ListItem con acción de edición
│   Preventa · Ppto $5,000     │  (ícono lápiz al deslizar o tocar)
│  Ruta 014462 · Ana Ruiz      │
│   Autoventa · Ppto $4,200    │
│  ...                          │
│                               │
│        [ + Agregar ]         │  FAB o botón full-width
│                               │
│  Roster | Presupuestos | Tramos │  TabBar (no BottomNavigation — son
│                               │  3 vistas del mismo dato administrativo)
└─────────────────────────────┘
```

Estados: default, loading (skeleton), empty (solo aplica antes de la primera carga de datos, no es un caso realista de negocio). [FR2.1]

### A3. Presupuestos — refina wireframe A3 [US2.2]

Misma estructura de lista editable que A2, con formulario de edición por fila: campo "Presupuesto" numérico. Estado de error: "⚠ El presupuesto debe ser mayor a 0" inline, botón "Guardar" deshabilitado hasta corregir (mismo patrón que V3, Q1). [FR2.2, AC2.2.2]

### A4. Tramos de comisión — refina wireframe A4 [US2.3]

```
┌─────────────────────────────┐
│ Tramos · Canal: [Preventa ▾] │  h1 + selector de canal
│                               │  (Preventa = por devolución,
│                               │   Autoventa = por efectividad)
│  Tramo 1: Devolución < 8.5%  │  ListItem editable, orden visual
│   → Comisión: 2.0%            │  de mejor a peor beneficio
│  Tramo 2: Devolución < 7%    │  (de arriba hacia abajo)
│   → Comisión: 2.5%            │
│  Tramo 3: Devolución < 5%    │
│   → Comisión: 3.0%            │
│                               │
│  ⚠ Los tramos deben quedar   │  validación de orden (AC2.3.2):
│    ordenados de menor a mayor │  se muestra si el supervisor reordena
│    beneficio para que la app  │  o edita un umbral fuera de secuencia
│    calcule bien la oportunidad │
│    de ganancia                │
│                               │
│        [ + Agregar tramo ]   │
│                               │
│  Roster | Presupuestos | Tramos │
└─────────────────────────────┘
```

La representación visual en orden (de mejor a peor beneficio, de arriba hacia abajo) es la forma en que esta pantalla ayuda al supervisor a configurar tramos correctamente ordenados — el detalle exacto de la regla de validación (bloquear vs. advertir) queda pendiente de Domain Design (hallazgo heredado de Requirements/User Stories). [FR2.3, AC2.3.2]

### A5. Enviar notificación manual (nuevo, cubre US9.1)

```
┌─────────────────────────────┐
│ Enviar notificación            │  h1
│                               │
│  Destinatarios                │
│  ( ) Un vendedor              │  selector de modo
│  ( ) Varios vendedores        │
│  (•) Todos los vendedores     │
│  [ selector de vendedores ]   │  visible solo si "Un/Varios"
│                               │
│  Mensaje                      │
│  [_________________________] │  TextInput multilínea
│  ⚠ Escribe un mensaje antes   │  error inline (AC9.1.3)
│    de enviar                  │
│                               │
│      [ Enviar notificación ] │  deshabilitado si mensaje vacío o
│                               │  no hay destinatarios seleccionados
└─────────────────────────────┘
```

Estados: default, error-validación (mensaje vacío o sin destinatarios), success (confirmación breve "Notificación enviada a N vendedores"). [FR9.1]

## Assumptions & Open Questions

1. [assumption] El ícono/color exacto por grupo de notificación (V5) es un placeholder de este mockup; el color final depende de la guía de marca oficial pendiente (heredado de wireframes).
2. [Q1] Confirmado: error de venta = inline + botón deshabilitado.
3. [Q5] Confirmado: solo teléfonos, sin soporte de tablet en este MVP.

## Review

**Reviewer:** aidlc-product-lead-agent
**Iteration:** 1

Fortalezas: los tres hallazgos de la revisión de wireframes quedaron resueltos explícitamente — estado de error de V3 (banner inline + botón deshabilitado), cierre de sesión (V6) y tamaño de área táctil (accessibility-checklist.md, 44×44pt). La pantalla de Notificaciones (V5) traduce correctamente la decisión de agrupación por tipo del usuario y conecta FR8.3 (oportunidad de ganancia) al texto de la notificación en vez de dejarlo como un dato aislado. A4 (Tramos) usa el orden visual como ayuda de diseño para la regla de negocio de AC2.3.2 sin inventar la validación exacta, que correctamente queda para Domain Design.

Hallazgos (no bloquean esta etapa; pasan a Functional Design / Domain Design / Construction):
1. mockups.md introduce dos pantallas nuevas no presentes en wireframes.md ni en stories.md como historias explícitas: V6 (menú de cierre de sesión) y A5 (enviar notificación manual). V6 es una resolución directa de un hallazgo ya aprobado (logout); A5 sí corresponde a US9.1 pero no tenía mockup en Rough Mockups — es una adición legítima en esta etapa (refinar cubre huecos de fidelidad visual), no una desviación de alcance, pero debe quedar trazada en Domain/Functional Design como parte de FR9/US9.1, no como pantalla "nueva" sin origen.
2. interaction-spec.md no incluye un componente para el selector de canal de A4 (`[Preventa ▾]`) ni para el `RadioButton.Group` de destinatarios de A5 — quedan solo mencionados en mockups.md y design-system-mapping.md; Functional Design debe completar sus specs de componente si el equipo de Construction los necesita antes de codificar.
3. accessibility-checklist.md marca todos los ítems como checklist de diseño (no auditoría); es correcto para esta etapa, pero Build and Test debe convertir cada ítem en un caso de prueba verificable, no solo una revisión visual.

**Verdict:** READY

Los mockups, la especificación de interacción, el mapeo de sistema de diseño y la checklist de accesibilidad son suficientes y consistentes con requirements.md y stories.md para avanzar a Domain Design; los hallazgos anteriores son refinamientos de detalle, no huecos de alcance.
