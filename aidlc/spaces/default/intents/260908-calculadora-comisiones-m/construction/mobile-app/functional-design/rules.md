# Functional Design — mobile-app — Reglas de Negocio

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:backend-rules] `construction/backend-api/functional-design/rules.md`

`mobile-app` es una unidad `ui` (ver `unit-of-work.md` § U3 — Límites: "solo presentación e interacción; toda validación de negocio real ... se apoya en backend-api; esta unidad no duplica reglas de cálculo de comisión"). Esta unidad no posee reglas de **cálculo** propias — el conjunto que gobierna el negocio (`BRx.y` de cálculo, cierre de período, sincronización, umbrales) vive íntegramente en `construction/backend-api/functional-design/rules.md`. Lo que sí es propio de esta unidad es un pequeño conjunto de reglas de **validación de UX inmediata**: gating de botones y campos que la app aplica en el cliente antes de siquiera intentar la llamada a la API, listadas abajo. Cada una es deliberadamente redundante con la validación real que `backend-api` vuelve a aplicar del lado del servidor (nunca la reemplaza ni decide nada de negocio) — existen para dar retroalimentación inmediata al usuario sin esperar un viaje de red.

```yaml
rules:
  - id: BR1.6
    statement: El botón "Ingresar" de V1 permanece deshabilitado hasta que los campos usuario y contraseña tengan contenido.
    category: validation
    applies_to: VendorLoginScreen (V1)
    trigger: cambio en los campos de usuario/contraseña
    logic: "IF username está vacío OR password está vacío THEN deshabilitar el botón Ingresar"
    violation_behaviour: el botón no responde al toque (no hay submit posible)
    source: FR1.3
  - id: BR1.7
    statement: El botón "Ingresar" de A1 permanece deshabilitado hasta que el PIN tenga exactamente 4 dígitos.
    category: validation
    applies_to: SupervisorLoginScreen (A1)
    trigger: cambio en el campo de PIN
    logic: "IF pin.length != 4 THEN deshabilitar el botón Ingresar"
    violation_behaviour: el botón no responde al toque
    source: FR1.2
  - id: BR2.4
    statement: El formulario de alta de vendedor de A2 exige ruta, nombre y canal no vacíos antes de permitir "Agregar".
    category: validation
    applies_to: RosterScreen (A2)
    trigger: intento de guardar el formulario de alta
    logic: "IF route está vacío OR name está vacío OR channel no seleccionado THEN bloquear el envío y mostrar el campo faltante"
    violation_behaviour: el formulario no se envía, se resalta el campo faltante
    source: FR2.1
  - id: BR2.5
    statement: El campo "Presupuesto" de A3 exige un valor mayor a 0 antes de permitir "Guardar".
    category: validation
    applies_to: BudgetsScreen (A3)
    trigger: intento de guardar el presupuesto editado
    logic: "IF budget vacío OR budget <= 0 THEN mostrar '⚠ El presupuesto debe ser mayor a 0' y deshabilitar Guardar"
    violation_behaviour: banner inline bloqueante, no se envía la petición
    source: FR2.2
  - id: BR2.6
    statement: Cada tramo editado en A4 exige un umbral y una comisión no vacíos ni negativos antes de permitir guardar el conjunto del canal.
    category: validation
    applies_to: TiersScreen (A4)
    trigger: intento de guardar el conjunto de tramos
    logic: "IF algún tramo tiene thresholdValue vacío/negativo OR commissionRate vacío/negativo THEN bloquear el envío"
    violation_behaviour: el formulario no se envía hasta corregir el tramo señalado
    source: FR2.3
  - id: BR3.6
    statement: El botón "Guardar venta" de V3 permanece deshabilitado si el monto vendido está vacío o es menor o igual a 0.
    category: validation
    applies_to: SalesEntryScreen (V3)
    trigger: cambio en el campo Monto vendido, o intento de guardado
    logic: "IF amount vacío OR amount <= 0 THEN deshabilitar Guardar venta; si el usuario ya intentó guardar, mostrar '⚠ Ingresa un monto válido (mayor a 0)'"
    violation_behaviour: banner inline, no se guarda hasta corregir (ni local ni remoto)
    source: FR3.2
  - id: BR9.3
    statement: El botón "Enviar notificación" de A5 permanece deshabilitado si el mensaje está vacío o no hay destinatarios seleccionados.
    category: validation
    applies_to: ManualNotificationScreen (A5)
    trigger: cambio en el campo de mensaje o en la selección de destinatarios
    logic: "IF message.trim() vacío OR (mode != 'all' AND selectedVendorIds vacío) THEN deshabilitar Enviar notificación"
    violation_behaviour: el botón no responde al toque; si se fuerza el envío (ej. teclado), banner '⚠ Escribe un mensaje antes de enviar'
    source: FR9.1
```

## Resumen

| ID | Categoría | Aplica a | Qué valida |
|---|---|---|---|
| BR1.6 | validation | V1 | Usuario/contraseña no vacíos antes de habilitar login |
| BR1.7 | validation | A1 | PIN de 4 dígitos antes de habilitar login |
| BR2.4 | validation | A2 | Ruta/nombre/canal no vacíos antes de agregar vendedor |
| BR2.5 | validation | A3 | Presupuesto > 0 antes de guardar |
| BR2.6 | validation | A4 | Umbral/comisión de tramo no vacíos ni negativos antes de guardar |
| BR3.6 | validation | V3 | Monto de venta > 0 antes de habilitar guardado |
| BR9.3 | validation | A5 | Mensaje no vacío y al menos un destinatario antes de enviar |

Ninguna de estas reglas decide un resultado de negocio (comisión, cierre de período, envío real de notificación) — todas son gates de UX inmediata que `backend-api` vuelve a validar de forma autoritativa del lado del servidor (ver, por ejemplo, `AC2.2.2`, `AC3.1.2`, `AC9.1.3` en `traceability.json`, cubiertas como `N/A` porque su resultado de negocio real es propiedad de `backend-api`, no de esta unidad). No tienen un criterio de aceptación (`ACx.y.z`) propio en `stories.md` — están explicadas en `traceability.json` § `reverse` en vez de mapeadas a un AC, siguiendo el mismo patrón usado para las reglas sin AC propio en `backend-api`.
