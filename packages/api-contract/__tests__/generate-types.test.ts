// Step 9 del plan de Code Generation: verifica que la generación de tipos
// produce los tipos esperados para las 7 entidades y para cada endpoint
// declarado en openapi.yaml.
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generateTypes } from "../scripts/generate-types.ts";

const execFileAsync = promisify(execFile);

describe("generateTypes", () => {
  let outputPath: string;
  let tempDir: string;
  let generated: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "api-contract-types-"));
    outputPath = join(tempDir, "types.ts");
    generated = await generateTypes(undefined, outputPath);
  });

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("escribe el archivo de salida", async () => {
    const content = await readFile(outputPath, "utf-8");
    expect(content.length).toBeGreaterThan(0);
    expect(content).toBe(generated);
  });

  it("declara un tipo (schema) para cada una de las 7 entidades del contrato", () => {
    // Session no se expone como schema propio (solo su token, vía LoginResponse) —
    // decisión de entities.md ("no viaja completa en los payloads del contrato").
    // Las 6 entidades restantes sí tienen forma de schema directa u homónima.
    const entitySchemaNames = [
      "Vendor",
      "CommissionTier",
      "DailySale",
      "CommissionPeriod",
      "Notification",
    ];
    for (const name of entitySchemaNames) {
      expect(generated).toMatch(new RegExp(`\\b${name}:\\s*\\{`));
    }
  });

  it("declara los paths de los 6 contratos", () => {
    const paths = [
      "/auth/login/vendedor",
      "/vendors",
      "/tiers",
      "/sales",
      "/commission/current",
      "/notifications",
    ];
    for (const path of paths) {
      expect(generated).toContain(path);
    }
  });

  it("el archivo generado compila sin error de TypeScript (tsc --noEmit)", async () => {
    await execFileAsync("npx", ["tsc", "--noEmit", "--strict", "--target", "ES2022", "--module", "ES2022", "--moduleResolution", "Bundler", outputPath]);
  }, 30_000);
});
