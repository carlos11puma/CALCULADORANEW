# Functional Design — mobile-app — Preguntas

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:unit-of-work-story-map] `inception/units-generation/unit-of-work-story-map.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:mockups] `inception/refined-mockups/mockups.md`
- [upstream:design-system-mapping] `inception/refined-mockups/design-system-mapping.md`
- [upstream:accessibility-checklist] `inception/refined-mockups/accessibility-checklist.md`
- [upstream:backend-functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:backend-rules] `construction/backend-api/functional-design/rules.md`

`mobile-app` es una unidad `ui` — solo presentación e interacción; no duplica reglas de cálculo ni de validación de negocio (esas viven en `backend-api`, ver `rules.md`). Estas preguntas cubren las decisiones de UI/cliente que `backend-api` no resuelve por sí sola: almacenamiento local, estrategia de sincronización desde la perspectiva del cliente, detección de conectividad, manejo de notificaciones push, y persistencia de sesión.

## Q1 — Almacenamiento local de ventas pendientes de sincronizar (FR3.4, AC3.3.1, AC3.3.2, AC3.3.3)

El vendedor puede acumular más de un día de venta sin conexión (hallazgo #1 de Requirements, resuelto en `backend-api` como: `POST /sales/sync` acepta un lote y W7 procesa cada entrada por fecha, con BR3.4/BR3.5 resolviendo cierre de período y conflictos). Falta decidir cómo `mobile-app` almacena ese lote localmente antes de sincronizar.

- A. `expo-sqlite` — una tabla local `pending_sales(saleDate, amount, returns, createdAt)`; permite consultas estructuradas (ej. "cuántos días pendientes hay") y es la opción recomendada dado que el volumen por vendedor es bajo pero la estructura (una fila por fecha, con posible edición antes de sincronizar) se beneficia de un motor real en vez de serializar/deserializar JSON en cada operación.
- B. `AsyncStorage` con una clave JSON serializada (`pending_sales` → array de objetos) — más simple de implementar, sin dependencia nativa adicional, pero cada lectura/escritura serializa el array completo (aceptable dado el volumen esperado: máximo unos pocos días pendientes por vendedor).
- C. No estoy seguro — que Functional Design proponga la opción por defecto (A) y la justifique.
- X. Other (please specify)

[Answer]: A. `expo-sqlite`

## Q2 — Estrategia de sincronización al recuperar conexión (AC3.3.2, AC3.3.3)

- A. Automática en segundo plano: la app detecta la reconexión (ver Q3) y dispara `POST /sales/sync` con todas las ventas pendientes sin acción del usuario; mientras se sincroniza, el ícono ↻ de V2/V3 indica "sincronizando"; si falla, permanece como pendiente y se reintenta en el próximo evento de reconexión o al reabrir la app.
- B. Manual: el usuario ve un banner "N ventas pendientes de sincronizar" con un botón explícito "Sincronizar ahora" — más predecible para el usuario pero contradice la expectativa de FR3.4 ("sincronizando con el servidor cuando la conexión se restablezca", que sugiere automático).
- C. No estoy seguro — que Functional Design proponga la opción por defecto (A) y la justifique.
- X. Other (please specify)

[Answer]: A. Automática en segundo plano

## Q3 — Detección de conectividad (V2 ícono ↻, V3 banner "Sin conexión")

- A. `@react-native-community/netinfo` — escucha nativa de cambios de red (wifi/datos/sin señal), dispara el evento de reconexión que activa Q2; es el estándar de facto en apps React Native para este propósito.
- B. Detección reactiva únicamente al intentar la petición HTTP (si falla por timeout/red, se asume offline) — sin librería adicional, pero no detecta la reconexión de forma proactiva, solo en el próximo intento del usuario.
- C. No estoy seguro — que Functional Design proponga la opción por defecto (A) y la justifique.
- X. Other (please specify)

[Answer]: A. `@react-native-community/netinfo`

## Q4 — Notificaciones push y manejo del badge de no-leídas (V5, FR7.1/FR8.2/FR9.1)

- A. `expo-notifications` recibe el push (foreground/background), incrementa el badge local inmediatamente al recibir, y al abrir la pantalla V5 hace `GET` de la lista completa desde `backend-api` (fuente de verdad del estado leído/no-leído) y limpia el badge — el badge local es solo una señal optimista entre push y apertura de la pantalla.
- B. El badge se calcula únicamente a partir de la respuesta del `GET` de notificaciones (sin contador local incremental por push) — más simple, pero el badge no se actualiza hasta el próximo refresco de la pantalla Home, lo cual contradice la mención de "tiempo real" implícita en el mockup V2.
- C. No estoy seguro — que Functional Design proponga la opción por defecto (A) y la justifique.
- X. Other (please specify)

[Answer]: A. `expo-notifications` + badge optimista

## Q5 — Persistencia de sesión y expiración inesperada del token (FR1.4, AC1.1.3)

`backend-api` usa un token opaco de sesión sin expiración fija programática (NFR3.10/BR1.4/BR1.5 de `nfr-requirements`/`rules.md`) pero puede ser revocado del lado del servidor (ej. `revokedAt`, o el supervisor desactiva al vendedor). Falta decidir cómo reacciona `mobile-app` si una petición devuelve 401 con una sesión que la app creía válida.

- A. El token se guarda en `expo-secure-store` (almacenamiento cifrado nativo, apropiado para un token de sesión de larga duración) y cualquier respuesta 401 fuerza un logout silencioso — limpia el token local y redirige a V1 (Login) con un mensaje "Tu sesión expiró, ingresa de nuevo", sin perder las ventas pendientes de sincronizar (Q1 las preserva localmente hasta el próximo login exitoso).
- B. El token se guarda en `AsyncStorage` (sin cifrado) y un 401 solo muestra un banner de error en la pantalla actual, sin redirigir automáticamente — más simple, pero deja al vendedor en una pantalla que ya no puede operar y expone el token en almacenamiento no cifrado (riesgo de seguridad, dado que NFR3 exige credenciales cifradas).
- C. No estoy seguro — que Functional Design proponga la opción por defecto (A) y la justifique.
- X. Other (please specify)

[Answer]: A. `expo-secure-store` + logout silencioso

## Consolidated Summary Confirmation

Al confirmar, se registran las siguientes decisiones para `mobile-app`:
1. Almacenamiento local de ventas pendientes: `expo-sqlite` con tabla `pending_sales`.
2. Sincronización automática en segundo plano al detectar reconexión, con indicador visual de progreso.
3. Detección de conectividad vía `@react-native-community/netinfo`.
4. Notificaciones: `expo-notifications` con badge optimista local, reconciliado contra el backend al abrir V5.
5. Sesión persistida en `expo-secure-store`; un 401 fuerza logout silencioso preservando las ventas pendientes locales.

- A. Looks correct
- B. Needs changes

[Answer]: Looks correct
