# NFR Design — mobile-app — Componentes Lógicos

## Sources

- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`
- [upstream:frontend-components] `construction/mobile-app/functional-design/frontend-components.md`
- [Q3] `nfr-design-questions.md`

## Organización por feature (Q3)

```
src/
├─ app/                     # navegación raíz (AuthStack, VendorTabs, AdminTabs), providers globales
├─ shared/
│  ├─ api/apiClient.ts       # instancia Axios + interceptores (security-design.md)
│  ├─ storage/secureSession.ts  # wrapper de expo-secure-store
│  ├─ storage/pendingSalesDb.ts # wrapper de expo-sqlite (tabla pending_sales)
│  ├─ net/connectivity.ts    # listener de @react-native-community/netinfo
│  └─ components/            # PrimaryButton, ValidatedTextInput, OfflineBanner, ErrorBanner, etc.
├─ features/
│  ├─ auth/                  # V1, A1, V6 — VendorLoginScreen, SupervisorLoginScreen, logout
│  ├─ home/                  # V2 — HomeScreen, hook useCommissionCurrent (TanStack Query)
│  ├─ sales-entry/           # V3 — SalesEntryScreen, sync engine (MW7/MW8)
│  ├─ history/                # V4 — HistoryScreen
│  ├─ notifications/          # V5 — NotificationsScreen, badge de expo-notifications
│  ├─ roster/                  # A2, A3 — RosterScreen, BudgetsScreen (comparten datos de vendors)
│  ├─ tiers/                   # A4 — TiersScreen
│  └─ manual-notification/     # A5 — ManualNotificationScreen
```

Cada carpeta de `features/` agrupa su pantalla, sus hooks de TanStack Query (`api/`) y su estado local propio — sin una carpeta `store/` global: el único estado verdaderamente transversal (sesión, contador de `pending_sales`) vive en `shared/` porque lo consumen múltiples features (ej. el header de sesión en todas las pantallas, el ícono ↻ en Home y en Sales Entry).

## Dominios de falla

| Componente | Falla si… | Efecto aislado a |
|---|---|---|
| `shared/api/apiClient` | El backend no responde o responde 5xx | Cualquier feature que dependa de red — cada pantalla ya maneja su propio estado `error` (`functional-spec.md`), sin caída global de la app |
| `shared/storage/pendingSalesDb` | El dispositivo se queda sin espacio de almacenamiento (caso extremo, fuera del volumen esperado) | Solo `sales-entry` (guardado offline) — el resto de la app sigue funcionando con conexión |
| `shared/net/connectivity` | El listener de `netinfo` no dispara (bug de la librería en un dispositivo específico) | Degrada a sincronización manual implícita (el usuario reabre la app, que también intenta sincronizar al arrancar — hallazgo R-03 de `functional-design.md`) en vez de fallar silenciosamente |
| `shared/storage/secureSession` | `expo-secure-store` no está disponible (dispositivo sin Keychain/Keystore funcional, caso extremo) | Bloquea el login — sin degradación posible, es la única forma soportada de persistir sesión (Q5 de Functional Design) |

## Recursos compartidos

- Instancia única de `apiClient` (Axios) — todas las features la importan, ninguna crea su propio cliente HTTP.
- Instancia única de `QueryClient` (TanStack Query), provista en `app/` — todas las queries/mutaciones de las features la comparten, permitiendo la invalidación cruzada entre features (ej. `sales-entry` invalida la query de `home`).
- Conexión única a `pendingSalesDb` (expo-sqlite) — un solo archivo de base de datos local para toda la app, aunque solo `sales-entry` la usa activamente en el MVP.

## Assumptions & Open Questions

None.
