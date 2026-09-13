import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../../shared/api/apiClient";
import { getCurrentCommission } from "./api";

describe("features/home/api", () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it("retorna el CommissionPeriod vigente (200)", async () => {
    mock.onGet("/commission/current").reply(200, {
      id: "c1",
      vendorId: "v1",
      periodMonth: "2026-09",
      accumulatedSales: 3120,
      accumulatedReturns: 100,
      returnRate: 6.2,
      commissionEarned: 245.8,
      budgetProgress: 62,
      closed: false,
      closedAt: null,
    });
    const result = await getCurrentCommission();
    expect(result.commissionEarned).toBe(245.8);
  });

  it("propaga un error de red (V2 estado error, MW4 paso 3)", async () => {
    mock.onGet("/commission/current").networkError();
    await expect(getCurrentCommission()).rejects.toBeDefined();
  });

  it("propaga un 5xx del servidor", async () => {
    mock.onGet("/commission/current").reply(500, { code: "INTERNAL", message: "Error" });
    await expect(getCurrentCommission()).rejects.toBeDefined();
  });
});
