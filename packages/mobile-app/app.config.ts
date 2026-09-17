import type { ExpoConfig, ConfigContext } from "expo/config";

// app.config.ts — configuración de Expo para Calculadora de Comisiones (mobile-app). Reintento de
// build nativo tras falla de red transitoria en el worker de EAS (2026-09-13, séptimo hallazgo).
// Segundo reintento (2026-09-17, duodécimo hallazgo): el build del commit 3616735 (que agregó
// expo-updates) falló por otra falla de red transitoria del lado de EAS, ahora descargando
// SQLite para expo-sqlite (`java.net.SocketException: Network is unreachable`), no relacionada
// con el cambio de código. Este comentario fuerza un commit que toca app.config.ts (path nativo)
// para disparar un build nuevo vía mobile-app-ci.yml sin tocar lógica.
// `API_BASE_URL` se inyecta por perfil de build/canal de update vía eas.json (extra.API_BASE_URL),
// nunca hardcodeada aquí (project.md § Forbidden — nunca commitear secretos/config de entorno).
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Calculadora de Comisiones",
  // Debe coincidir exactamente con el slug real del proyecto EAS (expo.dev, cuenta
  // CarlosPuma11) — Expo le agregó un sufijo aleatorio porque el nombre simple ya estaba
  // tomado. No cambiar sin volver a verificar en el dashboard de Expo.
  slug: "calculadora-comisiones-dsebrhufex4isgu0uooa9",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  scheme: "calculadora-comisiones",
  icon: "./assets/icon.png",
  splash: {
    backgroundColor: "#FAFAFA",
  },
  // Distribución interna vía EAS (unit-of-work.md) — no se publica en tiendas públicas.
  android: {
    package: "com.tiosa.calculadoracomisiones",
    // NFR3.14/R-01 de security-design.md: bloquea cualquier intento de tráfico HTTP plano
    // a nivel de red — el SO rechaza la conexión aunque el código de la app construyera
    // por error una URL http://. Soportado nativamente por Expo SDK 51 (managed workflow),
    // sin config plugin adicional (verificado contra la versión pinneada en package.json,
    // cierra R-02 de nfr-design/security-design.md).
    usesCleartextTraffic: false,
  },
  ios: {
    bundleIdentifier: "com.tiosa.calculadoracomisiones",
    supportsTablet: false,
    // Sin excepciones NSAppTransportSecurity/NSAllowsArbitraryLoads: App Transport Security
    // bloquea HTTP plano por defecto en iOS 13+ (tech-stack-decisions.md, NFR5).
  },
  extra: {
    // Sobrescrito por perfil en eas.json (build.<profile>.env / EAS Update channel env).
    apiBaseUrl: process.env.API_BASE_URL ?? "https://api.calculadora-comisiones.local",
    eas: {
      // ID real del proyecto EAS de Carlos (expo.dev, cuenta CarlosPuma11), creado 2026-09-13.
      projectId: process.env.EAS_PROJECT_ID ?? "47dc62ba-90ee-4558-bd17-10aa8660c090",
    },
  },
  // "expo-sqlite" se sacó de esta lista (2026-09-13): solo hace falta declararlo como plugin
  // para el soporte de SQLite en web (WASM), que este proyecto no usa (solo Android — ver
  // operation/deployment-pipeline/decision-plataforma-android.md). Declarado, `expo config`
  // intenta cargarlo fuera de Metro y falla al resolver un archivo con variantes por
  // plataforma (`SQLiteDatabase.ios.ts`/`.android.ts`/`.web.ts`), rompiendo `eas build` en
  // modo no interactivo. El uso en runtime de expo-sqlite (pendingSalesDb.ts) no depende de
  // este plugin — sigue funcionando igual sin declararlo.
  plugins: ["expo-notifications", "expo-secure-store"],
  updates: {
    // Canal resuelto por perfil de EAS Build / EAS Update (cicd-pipeline.md).
    url: "https://u.expo.dev/47dc62ba-90ee-4558-bd17-10aa8660c090",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
});
