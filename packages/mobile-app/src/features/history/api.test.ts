import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../../shared/api/apiClient";
import { getCommissionHistory } from "./api";

describe("features/history/api", () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it("retorna la lista de períodos cerrados (200, MW10)", async () => {
    mock.onGet("/commission/history").reply(200, [
      { id: "p1", vendorId: "v1", periodMonth: "2026-08", accumulatedSales: 9845, accumulatedReturns: 0, returnRate: 0, commissionEarned: 412.3, budgetProgress: 100, closed: true, closedAt: "2026-09-01T00:00:00Z" },
    ]);
    const result = await getCommissionHistory();
    expect(result).toHaveLength(1);
  });

  it("retorna una lista vacía (estado empty, MW10 paso 3)", async () => {
    mock.onGet("/commission/history").reply(200, []);
    expect(await getCommissionHistory()).toEqual([]);
  });

  it("envía el parámetro limit cuando se provee", async () => {
    mock.onGet("/commission/history", { params: { limit: 3 } }).reply(200, []);
    await expect(getCommissionHistory(3)).resolves.toEqual([]);
  });

  it("propaga un error de red", async () => {
    mock.onGet("/commission/history").networkError();
    await expect(getCommissionHistory()).rejects.toBeDefined();
  });
});
