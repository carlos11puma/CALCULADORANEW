import { defineConfig } from "vitest/config";

// Runner de este workspace únicamente — no toca el resto del monorepo.
// Comando unit-scoped exacto: `npm test --workspace=packages/api-contract`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["scripts/**/*.ts"],
      // Piso de cobertura heredado del Testing Contract (mvp): 80% de líneas.
      // NUNCA relajar este umbral para hacer pasar un paso (construction.md, project.md).
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
