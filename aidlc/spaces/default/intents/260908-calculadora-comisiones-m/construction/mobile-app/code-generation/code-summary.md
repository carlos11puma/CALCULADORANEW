# Code Summary — mobile-app

## Sources

- [upstream:code-generation-plan] `construction/mobile-app/code-generation/code-generation-plan.md`
- [upstream:source-manifest] `construction/mobile-app/code-generation/source-manifest.json`

## Resumen

Se implementó `packages/mobile-app/` — app Expo/React Native + TypeScript que consume los 6 contratos de `packages/api-contract`, con persistencia local offline (`expo-sqlite`), sincronización automática, sesión segura (`expo-secure-store`), las 11 pantallas de `frontend-components.md` (V1-V6 vendedor, A1-A5 administrador/supervisor) y su pipeline de CI/CD. El trabajo se realizó en dos pasadas: una primera pasada (interrumpida por un límite de cuota) completó los Steps 1-10 del plan (estructura, modelo local, capa de acceso/API, sincronización); una segunda pasada completó los Steps 11-14 restantes (pantallas, configuración de build/CI, documentación). Ambas pasadas fueron verificadas independientemente por el orquestador — no se aceptó ningún resultado por autoreporte sin correr la suite real.

## Archivos creados (por área)

- **Estructura y configuración**: `app.config.ts`, `eas.json`, `babel.config.js`, `tsconfig.json`, `jest.config.js`, `jest.setup.ts`, `package.json`, `App.tsx`, `.github/workflows/mobile-app-ci.yml`.
- **Modelo local y acceso a datos** (`src/shared/storage/`, `src/shared/api/`, `src/shared/net/`): `pendingSalesDb.ts` (tabla `pending_sales` en `expo-sqlite`, clave `(vendorId, saleDate)`), `secureSession.ts` (wrapper de `expo-secure-store`), `apiClient.ts` (interceptores Axios — adjunta token, dispara logout en 401 salvo `/auth/login*` y `/auth/logout`), `connectivity.ts` (wrapper de `netinfo`), `contractTypes.ts`.
- **Por feature** (`src/features/{auth,history,home,manual-notification,notifications,roster,sales-entry,tiers}/`): `api.ts` (consumo de los 6 contratos), `hooks.ts` (TanStack Query), y en `sales-entry/`: `syncEngine.ts` (motor de sincronización MW8) y `useAutoSync.ts` (dispara sync al montar con conexión y en reconexión). `home/returnRateTrend.ts` (persistencia en AsyncStorage) y `notifications/grouping.ts` (agrupación de notificaciones V5).
- **Pantallas** (11 de 11, una por feature aplicable): `VendorLoginScreen.tsx`/`SupervisorLoginScreen.tsx` (V1/A1), `HomeScreen.tsx` (V2), `SalesEntryScreen.tsx` (V3), `HistoryScreen.tsx` (V4), `NotificationsScreen.tsx` (V5), `RosterScreen.tsx`/`BudgetsScreen.tsx` (A2/A3), `TiersScreen.tsx` (A4), `ManualNotificationScreen.tsx` (A5).
- **Componentes compartidos** (`src/shared/components/`): `PrimaryButton`, `ValidatedTextInput`, `OfflineBanner`, `ErrorBanner`, `Skeletons`, `ConfirmDialog`, `SessionGate`, `SyncStatusIcon`.
- **Navegación y sesión** (`src/app/navigation/{AuthStack,VendorTabs,AdminTabs,RootNavigator}/`, `src/shared/session/SessionContext.tsx`).
- **Cada módulo de código de producción tiene su archivo `*.test.ts`/`*.test.tsx` correspondiente** (patrón 1:1, ver `source-manifest.json`).

## Decisiones clave

- **`pending_sales` con clave `(vendorId, saleDate)`**: cierra el hallazgo R-01 de la revisión de `functional-design/functional-spec.md` (riesgo de dispositivo compartido entre vendedores).
- **Guarda de sincronización en vuelo fijada de forma síncrona**: el conjunto `inFlight` se marca *antes* de cualquier `await` en `runSync()` — ver "Errores encontrados y corregidos" abajo. Cierra el hallazgo R-02.
- **`useAutoSync` dispara también al montar la app con conexión disponible**, no solo en el evento de reconexión — cierra el hallazgo R-03.
- **`returnRateTrend` persistido en `AsyncStorage`** por vendedor entre sesiones — cierra el hallazgo R-04.
- **Interceptor de Axios excluye tanto `/auth/login*` como `/auth/logout`** del auto-redirect por 401 — cierra el hallazgo R-01 de la revisión de `nfr-design/security-design.md`.
- **`android.usesCleartextTraffic: false` y sin excepciones ATS en iOS** en `app.config.ts` — cierra el hallazgo R-01 de esa misma revisión.
- **CI/CD**: lista literal de paths que cuentan como "cambio nativo" (`app.json`/`app.config.{ts,js}`/`eas.json`/`package.json`/`babel.config.js`/`android/`/`ios/`) vs. "solo JS/TS", implementada en `.github/workflows/mobile-app-ci.yml` — cierra el hallazgo R-01 de la revisión de `infrastructure-design/cicd-pipeline.md`.
- **`AdminTabs` usa `SegmentedButtons` con estado interno** en vez de tres rutas de navegación separadas, siguiendo literalmente la especificación de `frontend-components.md` para el panel de administrador.
- **CI sin paso `npm run lint`**: ningún workspace del monorepo (tampoco `backend-api`) tiene configuración real de ESLint todavía, pese al mandato de `team.md` § Code Style; se usa `tsc --noEmit` como gate equivalente mientras esa configuración no exista. Gap preexistente, no introducido por esta unidad — documentado también en el README del workspace.

## Errores encontrados y corregidos (verificación independiente del orquestador)

1. **`apiClient.test.ts` usaba `await import(...)` dinámico dentro de `afterEach`**, lo que fallaba con `TypeError: A dynamic import callback was invoked without --experimental-vm-modules` bajo la configuración de Babel/Jest del proyecto (8 de 69 pruebas fallando en la primera verificación). Corregido reemplazándolo por el `import` estático ya presente en el archivo.
2. **Condición de carrera real en la guarda anti-duplicado de `syncEngine.ts` (R-02)**: `inFlight.add(vendorId)` se fijaba después de un `await listPendingSales(...)`, por lo que un segundo disparo lanzado sin esperar al primero (el escenario exacto que la guarda dice prevenir) pasaba la verificación `inFlight.has()` antes de que el primer disparo alcanzara a marcar la bandera — ambos disparos terminaban esperando la misma promesa de `postSalesSync` sin resolver, colgando la prueba (timeout de 5000ms). Corregido moviendo `inFlight.add(vendorId)` a ejecución síncrona, inmediatamente después de la verificación `has()` y antes de cualquier `await`.

Ambos fueron defectos genuinos del código generado, no fallas del entorno de prueba — se corrigieron directamente en el código de producción/pruebas, no se relajó ningún umbral ni se marcó ninguna prueba como skip.

## Desviaciones documentadas

- CI sin `npm run lint` (ver arriba, gap preexistente del monorepo).
- `eas-cli` invocado vía `npx eas-cli@13` en el workflow en vez de como devDependency del workspace — evita una dependencia nueva solo para CI; consistente con `"cli": {"version": ">= 13.0.0"}` de `eas.json`.
- Ningún stub forzado por el entorno (a diferencia de `backend-api`/Prisma): todos los módulos nativos (`expo-sqlite`, `expo-secure-store`, `expo-notifications`, `netinfo`, `expo-constants`, `@react-native-async-storage/async-storage`) se mockean con las utilidades de prueba estándar de sus propios paquetes o con mocks en memoria — ninguno requirió una implementación manual sustituta.
- `jest.config.js` tiene `forceExit: true`: `@tanstack/react-query` deja listeners de `AppState`/`NetInfo` abiertos en el entorno `jest-expo`/jsdom incluso con `gcTime: 0` en las pruebas; no afecta la validez de ninguna aserción (todas las suites terminan y aciertan en segundos), es la mitigación estándar de la comunidad React Native para este patrón conocido de handles nativos no cerrados por el runtime de pruebas.

## Cobertura de pruebas (verificada de forma independiente por el orquestador — no autoreportada)

Comando: `npm test --workspace=packages/mobile-app -- --coverage` (desde la raíz del monorepo).

```
Test Suites: 43 passed, 43 total
Tests:       187 passed, 187 total
Snapshots:   0 total
```

Cobertura global: **94.14% statements / 87.36% branches / 91.61% functions / 95.66% lines** — supera el piso 80%/70%/80%/80% del Testing Contract (`team.md` § Testing Posture, heredado de `org.md` para alcance `mvp`).

`npx tsc --noEmit` corre limpio (0 errores) desde `packages/mobile-app/`.

## Trazabilidad historia → implementación

Ver `traceability.json` de esta etapa para el mapeo completo AC/BR/NFR → archivo de código o de prueba concreto.
