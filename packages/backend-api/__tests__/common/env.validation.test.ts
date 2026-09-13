import { describe, expect, it } from "vitest";
import { validate } from "../../src/config/env.validation";

describe("env.validation (NFR3.12 — fail-fast)", () => {
  it("acepta una configuración válida con DATABASE_URL", () => {
    const result = validate({ DATABASE_URL: "postgresql://user:pass@host/db", NODE_ENV: "production", PORT: "3000" });
    expect(result.DATABASE_URL).toBe("postgresql://user:pass@host/db");
  });

  it("lanza al faltar DATABASE_URL — el proceso no debe arrancar", () => {
    expect(() => validate({})).toThrow(/DATABASE_URL/);
  });

  it("lanza cuando NODE_ENV tiene un valor no permitido", () => {
    expect(() => validate({ DATABASE_URL: "postgresql://x", NODE_ENV: "staging-invalido" })).toThrow();
  });

  it("lanza cuando PORT no es un entero válido", () => {
    expect(() => validate({ DATABASE_URL: "postgresql://x", PORT: "no-es-numero" })).toThrow();
  });
});
