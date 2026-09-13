# NFR Design — mobile-app — Preguntas

## Sources

- [upstream:performance-requirements] `construction/mobile-app/nfr-requirements/performance-requirements.md`
- [upstream:security-requirements] `construction/mobile-app/nfr-requirements/security-requirements.md`
- [upstream:tech-stack-decisions] `construction/mobile-app/nfr-requirements/tech-stack-decisions.md`
- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`

## Q1 — Manejo de estado/datos remotos

¿Qué librería se usa para implementar el feedback optimista (<100ms, NFR1.5) y la invalidación automática de la consulta de comisión tras guardar/sincronizar una venta (MW4/MW6/MW8)?

- A. TanStack Query (React Query) — cache de datos remotos con invalidación declarativa por query key y soporte nativo de mutaciones optimistas.
- B. Context API + estado manual — sin dependencia adicional, pero requiere escribir a mano la invalidación/reintento/cache.
- C. No estoy seguro — que NFR Design proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. TanStack Query (React Query)

## Q2 — Cliente HTTP y sesión

¿Cómo se adjunta el token de `expo-secure-store` a cada petición y se detecta el 401 de MW9 (logout silencioso)?

- A. Cliente Axios con interceptores — un interceptor de request agrega el header `Authorization`; un interceptor de response detecta 401 y dispara el logout silencioso de forma centralizada.
- B. `fetch` nativo envuelto a mano — sin dependencia adicional, pero cada llamada repite el manejo de header/401 o pasa por un wrapper propio equivalente.
- C. No estoy seguro — que NFR Design proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. Cliente Axios con interceptores

## Q3 — Organización de módulos

¿Cómo se organiza el código fuente — por pantalla/feature o por capa técnica?

- A. Por feature (`screens/`, `api/`, `storage/` dentro de cada dominio) — ej. `features/sales-entry/{SalesEntryScreen,api,pendingSalesStore}`.
- B. Por capa técnica (`screens/`, `api/`, `hooks/`, `store/` globales) — estructura tradicional por tipo de archivo.
- C. No estoy seguro — que NFR Design proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. Por feature

## Q4 — Enforcement de HTTPS (cierra R-01 de NFR Requirements)

¿Cómo se fuerza HTTPS obligatorio a nivel de configuración nativa, no solo por convención en el código?

- A. Network Security Config (Android) + ATS por defecto (iOS) — `usesCleartextTraffic=false` explícito en la configuración de Expo; sin excepciones de ATS en iOS.
- B. Solo por convención en el código (siempre usar `https://`) — sin configuración nativa adicional.
- C. No estoy seguro — que NFR Design proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. Network Security Config (Android) + ATS por defecto (iOS)

## Consolidated Summary Confirmation

Al confirmar, se registran las siguientes decisiones para `mobile-app`:
1. TanStack Query para datos remotos, cache e invalidación optimista.
2. Cliente Axios con interceptores de request (token) y response (401 → logout silencioso).
3. Organización de código por feature.
4. HTTPS forzado por configuración nativa (Network Security Config + ATS), cerrando R-01 de NFR Requirements.

- A. Looks correct
- B. Needs changes

[Answer]: Looks correct
