# mobile-app — Calculadora de Comisiones

App móvil (Expo + React Native + TypeScript) para vendedores (V1-V6) y supervisores/administradores
(A1-A5) de Calculadora de Comisiones. Consume los 6 contratos de `packages/api-contract` vía
Axios; guarda ventas localmente en `expo-sqlite` cuando no hay conexión y las sincroniza
automáticamente al recuperarla.

## Requisitos

- Node.js 22, npm (workspaces del monorepo raíz).
- Sin simulador/dispositivo necesario para desarrollar o correr las pruebas — todo el ciclo
  descrito abajo corre en Node.

## Instalación

Desde la raíz del monorepo (`/`):

```bash
npm install
npm run build --workspace=packages/api-contract
```

## Correr localmente (Expo Dev Client)

```bash
npm run start --workspace=packages/mobile-app
```

Esto abre el bundler de Metro; escanea el QR con el Expo Dev Client (build de desarrollo
generado por `eas build --profile development`) en un dispositivo o emulador real. Este
repositorio **no incluye** un simulador — levantar el Dev Client requiere un dispositivo físico
o un simulador/emulador configurado localmente por quien lo ejecute; no forma parte del ciclo de
pruebas automatizado (ver más abajo).

Atajos equivalentes: `npm run android --workspace=packages/mobile-app` / `npm run ios
--workspace=packages/mobile-app` (requieren Android Studio / Xcode configurados localmente).

## Variables de entorno

| Variable | Dónde se define | Uso |
|---|---|---|
| `API_BASE_URL` | `eas.json` → `build.<profile>.env` (perfiles `development`/`preview`/`production`) | Base URL del backend; leída en runtime vía `expo-constants` → `Constants.expoConfig.extra.apiBaseUrl` (`app.config.ts`) |
| `EAS_PROJECT_ID` | Variable de entorno al invocar `eas`/CI | ID del proyecto EAS, inyectado en `app.config.ts` → `extra.eas.projectId` |
| `EXPO_TOKEN` | GitHub Actions Secret (nunca en el código) | Autenticación de `eas-cli` en CI (`.github/workflows/mobile-app-ci.yml`) |

Ninguna de estas se hardcodea en el código fuente (`project.md` § Forbidden — nunca commitear
secretos/config de entorno); en pruebas, `API_BASE_URL` se resuelve a
`https://api-test.calculadora-comisiones.local` vía el mock de `expo-constants` en
`jest.setup.ts`, y nunca sale de la máquina de pruebas (todas las llamadas HTTP van mockeadas).

## Pruebas

Comando exacto (desde la raíz del monorepo, `unit-test-instructions.md`):

```bash
npm test --workspace=packages/mobile-app -- --coverage
```

Corre con `jest` + preset `jest-expo` (sin simulador/dispositivo — jsdom en Node) y
`@testing-library/react-native`. Todos los módulos nativos (`expo-sqlite`, `expo-secure-store`,
`expo-notifications`, `@react-native-community/netinfo`, `@react-native-async-storage/async-storage`,
`expo-constants`) están mockeados en `jest.setup.ts`; `expo-sqlite` usa un mock en memoria propio
(`src/shared/__fixtures__/expoSqliteMock.ts`) que nunca escribe al sistema de archivos real.

Piso de cobertura (`jest.config.js` → `coverageThreshold`, `team.md` § Testing Posture): 80%
líneas/statements/functions, 70% branches — ejecutado en CI antes de merge
(`.github/workflows/mobile-app-ci.yml`).

Otros comandos: `npm run test:watch --workspace=packages/mobile-app` (modo watch),
`npm run typecheck --workspace=packages/mobile-app` (`tsc --noEmit`).

## Estructura del proyecto

```
src/
├─ app/                     — composición raíz (App, navegación) — logical-components.md
│  ├─ index.tsx             — QueryClientProvider + PaperProvider + SessionProvider + RootNavigator
│  └─ navigation/
│     ├─ AuthStack/         — V1 (login vendedor), A1 (login PIN supervisor)
│     ├─ VendorTabs/        — V2/V4/V5 (BottomNavigation) + V3 (modal)
│     ├─ AdminTabs/         — A2/A3/A4 (SegmentedButtons) + A5 (push)
│     └─ RootNavigator/     — decide Auth/Vendor/Admin según SessionContext
├─ features/<feature>/      — un directorio por feature (auth, home, sales-entry, history,
│                             notifications, roster, tiers, manual-notification)
│  ├─ api.ts                — llamadas HTTP puras a los 6 contratos (sin lógica de negocio)
│  ├─ hooks.ts               — queries/mutaciones de TanStack Query (performance-design.md)
│  ├─ <Screen>.tsx           — componente(s) de pantalla (React Native Paper)
│  └─ *.test.ts(x)          — pruebas adjuntas a cada módulo
└─ shared/
   ├─ api/                  — apiClient.ts (Axios + interceptores), contractTypes.ts
   ├─ storage/              — pendingSalesDb.ts (expo-sqlite), secureSession.ts (expo-secure-store)
   ├─ net/                  — connectivity.ts (netinfo)
   ├─ session/              — SessionContext.tsx (estado de sesión transversal)
   ├─ components/           — PrimaryButton, ValidatedTextInput, OfflineBanner, ErrorBanner,
   │                          Skeletons, ConfirmDialog, SessionGate, SyncStatusIcon
   └─ theme.ts
```

## CI/CD

`.github/workflows/mobile-app-ci.yml` implementa `infrastructure-design/cicd-pipeline.md`:

1. **PR / push a `main`** (filtrado a `packages/mobile-app/**` y `packages/api-contract/**`):
   `npm ci` → build de `api-contract` → `typecheck` → `npm test -- --coverage`. Check
   requerido de GitHub — bloquea el merge si falla.
2. **Tras un push exitoso a `main`**: el job `publish-preview` **clasifica el cambio** — si
   toca `app.json`, `app.config.ts`/`.js`, `eas.json`, `package.json`, `babel.config.js`, o
   `android/`/`ios/` dentro de `packages/mobile-app`, se trata como **cambio nativo** y corre
   `eas build --profile preview --non-interactive --no-wait`; cualquier otro cambio (típicamente
   `src/**/*.{ts,tsx}`) se trata como **solo JS/TS** y corre
   `eas update --branch preview --auto --non-interactive` (cierra R-01 de la revisión de
   `cicd-pipeline.md` con la lista exacta de paths).
3. **Producción**: el job `publish-production` repite la misma clasificación pero está atado al
   GitHub Environment `production` (required reviewer: Carlos) — no corre sin su aprobación
   manual explícita, igual que `backend-api`.
4. **Rollback**: `eas update:republish` desde el canal `production` para un rollback OTA. Un
   build nativo con un defecto **no se puede forzar a reinstalar** vía EAS Internal
   Distribution (limitación operativa aceptada para el MVP, R-02 de la revisión de
   `cicd-pipeline.md`, dado el bajo volumen de builds nativos esperado): el procedimiento manual
   es recontactar a los vendedores con el link/QR del nuevo build.

**Desviación documentada**: el workflow no incluye un paso `npm run lint` porque este monorepo
aún no tiene un archivo de configuración de ESLint en ningún workspace (tampoco lo tiene
`backend-api`, ver su propio `.github/workflows/backend-api-ci.yml`) — `team.md` § Code Style
exige ESLint, pero configurarlo es trabajo pendiente fuera del alcance de esta unidad;
`typecheck` sí corre y bloquea el merge en su lugar.

## Restricciones del entorno de desarrollo de esta unidad

Este ciclo de Code Generation se ejecutó en un sandbox sin simulador Android/iOS ni acceso de
red a EAS Build — por eso ninguna prueba ni comando de este README invoca `eas build`, `expo
start`, ni nada que requiera un dispositivo o la red de EAS. Todo el código (incluida la
navegación con `@react-navigation`) se verificó exclusivamente con `jest`/`jest-expo` en Node.
