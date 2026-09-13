# Code Generation — mobile-app — Unit Test Instructions

## Framework y configuración

- **Runner**: `jest` con el preset `jest-expo` (estándar de Expo para pruebas unitarias sin simulador/dispositivo físico) + `@testing-library/react-native` para render y consultas de componentes.
- **Configuración**: `packages/mobile-app/jest.config.js` — piso de cobertura 80% líneas/statements/functions, 70% branches (mismo piso que `api-contract`/`backend-api`, heredado de `team.md` § Testing Posture); `collectCoverageFrom: ["src/**/*.{ts,tsx}"]`, excluyendo `src/app/index.tsx`/archivos de solo navegación (cableado declarativo sin lógica propia) y tipos (`*.d.ts`).
- **Comando exacto de esta unidad**: `npm test --workspace=packages/mobile-app` — ejecuta toda la suite de `packages/mobile-app` únicamente.
- **Sin simulador/dispositivo**: todas las pruebas corren en Node (jsdom vía `jest-expo`) — ninguna prueba depende de un simulador iOS/Android real ni de EAS Build; los módulos nativos (`expo-sqlite`, `expo-secure-store`, `expo-notifications`, `@react-native-community/netinfo`) se mockean.

## Volumen esperado (estrategia standard)

5-8 pruebas por componente/módulo (11 pantallas + ~6 módulos de `shared/`) más pruebas de integración en los límites clave (cada feature con llamada a la API) — sumado al piso de cobertura de 80% del alcance `mvp`. Rango aproximado: 60-90 pruebas unitarias más ~15-20 pruebas de integración por feature (camino feliz + 2 casos de borde, mandato de `phases/construction.md` § Testing Standards).

## Cobertura esperada por capa

| Capa | Qué cubrir |
|---|---|
| Data model local (Step 3-4) | Wrapper de `pendingSalesDb` — insertar/actualizar por `(vendorId, saleDate)`, listar, eliminar tras sync |
| Repository / data access (Step 5-6) | Interceptores de Axios (token, 401→logout salvo excepciones), wrapper de `secureSession`, módulos `api.ts` por feature con Axios mockeado |
| Business logic (Step 7-8) | Hooks de TanStack Query, motor de sincronización (MW8, casos 0/1/N pendientes, `applied`/`rejected`, guarda de sincronización en vuelo), agrupación de notificaciones, `returnRateTrend` |
| API / endpoint — consumo (Step 9-10) | Cada módulo `api.ts` cubre los métodos usados por los workflows; pruebas de integración por feature con respuestas HTTP simuladas |
| Frontend behavior (Step 11-12) | Cada una de las 11 pantallas: estados de `functional-spec.md` (loading/error/empty/offline/readonly según aplique), gating de botones según las 7 reglas de `rules.md` |

## Mocking/stubbing

- `expo-sqlite` se mockea con una implementación en memoria (o `expo-sqlite`'s modo `:memory:` si el preset de test lo soporta) en pruebas de `pendingSalesDb` — nunca escribe al sistema de archivos real durante pruebas.
- `expo-secure-store` se mockea (Map en memoria) — nunca usa el Keychain/Keystore real durante pruebas.
- `expo-notifications` se mockea — las pruebas de V5 verifican la lógica de agrupación/badge, no la integración real de push.
- `@react-native-community/netinfo` se mockea para simular transiciones de conectividad de forma determinística.
- Axios se mockea (`jest.mock` o `axios-mock-adapter`) en pruebas unitarias de hooks/módulos `api.ts`; las pruebas de integración por feature pueden usar MSW (Mock Service Worker) para simular el servidor HTTP de forma más realista sin acoplarse a la implementación interna de Axios.
- React Native Paper y la navegación (`@react-navigation`) se usan reales en las pruebas de render (no mockeadas) salvo que una prueba específica necesite aislar un componente de su árbol de navegación.

## Gestión de datos de prueba

- Fixtures compartidos en `packages/mobile-app/src/shared/__fixtures__/` (vendedor de ejemplo, respuestas de ejemplo de los 6 contratos, ventas pendientes de ejemplo) — reutilizados entre pruebas de hooks y de pantallas para mantener consistencia con los ejemplos ya usados en `functional-spec.md`/`mockups.md`.
- Cada suite de integración por feature resetea sus mocks (Axios/MSW, `pendingSalesDb` en memoria) entre pruebas — ninguna prueba depende del orden de ejecución de otra.
