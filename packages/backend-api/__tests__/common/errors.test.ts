import { describe, expect, it } from "vitest";
import { ErrorCode } from "../../src/common/errors";

describe("ErrorCode", () => {
  it("expone los códigos estables del contrato (contract-summary.md)", () => {
    expect(ErrorCode.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
    expect(ErrorCode.PERIOD_CLOSED).toBe("PERIOD_CLOSED");
    expect(ErrorCode.TIER_ORDER_WARNING).toBe("TIER_ORDER_WARNING");
  });

  it("todos los valores son strings no vacíos", () => {
    for (const value of Object.values(ErrorCode)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
