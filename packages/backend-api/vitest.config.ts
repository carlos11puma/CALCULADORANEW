import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

// Runner de este workspace únicamente — no toca api-contract ni mobile-app.
// Comando unit-scoped exacto: `npm test --workspace=packages/backend-api`.
// swc (vía unplugin-swc) reemplaza el transform por defecto de Vitest
// (esbuild) SOLO para emitir metadata de decoradores (emitDecoratorMetadata)
// — esbuild no la soporta, y sin ella el contenedor de inyección de
// dependencias de NestJS no puede resolver los parámetros de constructor
// por tipo en las pruebas de integración (@nestjs/testing + supertest).
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["./__tests__/setup.ts"],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.module.ts", "src/main.ts", "src/**/*.dto.ts"],
      // Piso de cobertura heredado del Testing Contract (mvp): 80% líneas/statements/functions, 70% branches.
      // NUNCA relajar este umbral para hacer pasar un paso (construction.md, project.md, team.md § Testing Posture).
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
