/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-modules-core|expo-notifications|expo-secure-store|expo-sqlite|expo-status-bar|@react-navigation|react-native-paper|react-native-vector-icons|react-native-safe-area-context|react-native-screens)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/app/index.tsx",
    "!src/app/navigation/**/index.tsx",
    "!src/**/*.d.ts",
    "!src/shared/__fixtures__/**",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 70,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // @tanstack/react-query (Steps 7-8, hooks de negocio) deja handles nativos abiertos en el
  // entorno jsdom de jest-expo (listeners de AppState/NetInfo que `onlineManager`/`focusManager`
  // registran internamente al importarse, incluso con `gcTime: 0` en las pruebas) — no afecta
  // la corrección de las pruebas (todas terminan y aciertan en <3s), solo impide que el proceso
  // de Jest salga solo. `forceExit` es la mitigación estándar recomendada por la comunidad de
  // React Native para este patrón conocido.
  forceExit: true,
};
