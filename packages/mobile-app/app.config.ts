import type { ExpoConfig, ConfigContext } from "expo/config";

// app.config.ts — configuración de Expo para Calculadora de Comisiones (mobile-app).
// `API_BASE_URL` se inyecta por perfil de build/canal de update vía eas.json (extra.API_BASE_URL),
// nunca hardcodeada aquí (project.md § Forbidden — nunca commitear secretos/config de entorno).
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Calculadora de Comisiones",
  slug: "calculadora-comisiones",
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
      projectId: process.env.EAS_PROJECT_ID ?? "00000000-0000-0000-0000-000000000000",
    },
  },
  plugins: ["expo-notifications", "expo-secure-store", "expo-sqlite"],
  updates: {
    // Canal resuelto por perfil de EAS Build / EAS Update (cicd-pipeline.md).
    url: "https://u.expo.dev/00000000-0000-0000-0000-000000000000",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
});
