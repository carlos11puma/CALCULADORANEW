import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../../shared/api/apiClient";
import { postSale, postSalesSync } from "./api";

describe("features/sales-entry/api", () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it("postSale guarda la venta del día (200, MW6)", async () => {
    mock.onPost("/sales", { saleDate: "2026-09-08", amount: 100, returns: 5 }).reply(200, {
      id: "s1",
      vendorId: "v1",
      saleDate: "2026-09-08",
      amount: 100,
      returns: 5,
      syncStatus: "synced",
      closed: false,
    });
    const result = await postSale({ saleDate: "2026-09-08", amount: 100, returns: 5 });
    expect(result.syncStatus).toBe("synced");
  });

  it("postSale propaga 400 de validación (MW6 paso 4)", async () => {
    mock.onPost("/sales").reply(400, { code: "VALIDATION_ERROR", message: "Monto inválido" });
    await expect(postSale({ saleDate: "2026-09-08", amount: -1, returns: 0 })).rejects.toBeDefined();
  });

  it("postSale propaga 409 PERIOD_CLOSED (MW6 paso 5)", async () => {
    mock.onPost("/sales").reply(409, { code: "PERIOD_CLOSED", message: "Este día ya cerró" });
    await expect(postSale({ saleDate: "2026-09-08", amount: 10, returns: 0 })).rejects.toMatchObject({
      response: { status: 409 },
    });
  });

  it("postSalesSync envía el lote y retorna un resultado por ítem (MW8)", async () => {
    mock.onPost("/sales/sync").reply(200, [
      { saleDate: "2026-09-06", status: "applied", error: null },
      { saleDate: "2026-09-07", status: "rejected", error: { code: "PERIOD_CLOSED", message: "Cerrado" } },
    ]);
    const result = await postSalesSync([
      { saleDate: "2026-09-06", amount: 10, returns: 0 },
      { saleDate: "2026-09-07", amount: 20, returns: 0 },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe("applied");
    expect(result[1].status).toBe("rejected");
  });

  it("postSalesSync propaga un fallo de red (MW8 paso 4, no cambia pending_sales)", async () => {
    mock.onPost("/sales/sync").networkError();
    await expect(postSalesSync([{ saleDate: "2026-09-06", amount: 10, returns: 0 }])).rejects.toBeDefined();
  });
});
