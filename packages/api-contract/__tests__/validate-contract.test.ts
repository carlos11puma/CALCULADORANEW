// Step 7 del plan de Code Generation: pruebas de validez del documento
// OpenAPI consolidado — parseo, referencias, cobertura de las 6 rutas de
// contrato, y reglas de negocio de forma reflejadas en el schema.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validateContract } from "../scripts/validate-contract.ts";

const here = dirname(fileURLToPath(import.meta.url));
const OPENAPI_PATH = resolve(here, "..", "openapi", "openapi.yaml");
const FIXTURES_DIR = resolve(here, "..", "__fixtures__");

function readFixture(name: string): string {
  return readFileSync(resolve(FIXTURES_DIR, name), "utf-8");
}

describe("validateContract — openapi.yaml real", () => {
  const yamlText = readFileSync(OPENAPI_PATH, "utf-8");

  it("parsea sin error como YAML/OpenAPI válido", () => {
    const result = validateContract(yamlText);
    expect(result.document).toBeTruthy();
  });

  it("no tiene referencias $ref rotas", () => {
    const result = validateContract(yamlText);
    const brokenRefIssues = result.issues.filter((i) => i.code === "BROKEN_REF");
    expect(brokenRefIssues).toEqual([]);
  });

  it("cubre las 6 rutas de contrato (Auth, VendorDirectory, CommissionTier, SalesEntry, CommissionLedger, Notification)", () => {
    const result = validateContract(yamlText);
    const missing = result.issues.filter((i) => i.code === "MISSING_CONTRACT");
    expect(missing).toEqual([]);
  });

  it("refleja BR2.1 (presupuesto positivo) en VendorInput.budget", () => {
    const result = validateContract(yamlText);
    expect(result.issues.filter((i) => i.code === "BR2.1")).toEqual([]);
  });

  it("refleja BR2.2 (tramo con todos los campos requeridos) en CommissionTierInput", () => {
    const result = validateContract(yamlText);
    expect(result.issues.filter((i) => i.code === "BR2.2")).toEqual([]);
  });

  it("refleja BR3.1 (monto/devoluciones no negativos) en DailySaleInput", () => {
    const result = validateContract(yamlText);
    expect(result.issues.filter((i) => i.code === "BR3.1")).toEqual([]);
  });

  it("refleja BR9.1 (mensaje y destinatarios requeridos) en ManualNotificationInput", () => {
    const result = validateContract(yamlText);
    expect(result.issues.filter((i) => i.code === "BR9.1")).toEqual([]);
  });

  it("es válido en conjunto (sin ningún issue)", () => {
    const result = validateContract(yamlText);
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });
});

describe("validateContract — fixtures inválidos deliberados", () => {
  it("rechaza un documento con una referencia $ref rota", () => {
    const result = validateContract(readFixture("broken-ref.yaml"));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "BROKEN_REF")).toBe(true);
  });

  it("rechaza un CommissionTierInput sin campos requeridos (BR2.2)", () => {
    const result = validateContract(readFixture("missing-required-field.yaml"));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "BR2.2")).toBe(true);
  });

  it("rechaza YAML sintácticamente inválido", () => {
    const result = validateContract("openapi: 3.0.3\npaths: [\n  broken");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "PARSE_ERROR")).toBe(true);
  });
});
