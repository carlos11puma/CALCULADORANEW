import { registerRootComponent } from "expo";

import App from "./App";

// Punto de entrada explícito (en vez de apuntar "main" directo a
// "node_modules/expo/AppEntry.js") — necesario en este monorepo porque npm
// workspaces hoistea "expo" a node_modules de la raíz: la ruta relativa
// "packages/mobile-app/node_modules/expo/AppEntry.js" no existe físicamente,
// lo cual rompe `expo export`/`eas update` ("Cannot resolve entry file") aunque
// `expo start` y `eas build` (que sí resuelven módulos vía Node) funcionaran
// bien. Ver operation/deployment-pipeline/decision-plataforma-android.md,
// sexto hallazgo (2026-09-13).
registerRootComponent(App);
