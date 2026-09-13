import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../../shared/api/apiClient";
import { getTiers, replaceTiers } from "./api";

describe("features/tiers/api", () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it("getTiers retorna los tramos del canal e inOrder (200, MW14)", async () => {
    mock.onGet("/tiers", { params: { channel: "preventa" } }).reply(200, {
      tiers: [{ id: "t1", channel: "preventa", tierType: "por_devolucion", order: 1, thresholdValue: 8.5, commissionRate: 2.0 }],
      inOrder: true,
    });
    const result = await getTiers("preventa");
    expect(result.inOrder).toBe(true);
    expect(result.tiers).toHaveLength(1);
  });

  it("replaceTiers guarda el conjunto completo y retorna 200 sin warning cuando queda en orden", async () => {
    mock.onPut("/tiers").reply(200, {
      tiers: [],
      inOrder: true,
      warning: null,
    });
    const result = await replaceTiers([
      { channel: "preventa", tierType: "por_devolucion", order: 1, thresholdValue: 8.5, commissionRate: 2.0 },
    ]);
    expect(result.warning).toBeNull();
  });

  it("replaceTiers retorna warning=TIER_ORDER_WARNING sin bloquear el guardado (MW14 paso 4)", async () => {
    mock.onPut("/tiers").reply(200, { tiers: [], inOrder: false, warning: "TIER_ORDER_WARNING" });
    const result = await replaceTiers([
      { channel: "preventa", tierType: "por_devolucion", order: 1, thresholdValue: 5, commissionRate: 3.0 },
    ]);
    expect(result.warning).toBe("TIER_ORDER_WARNING");
  });

  it("replaceTiers propaga 400 si un tramo tiene umbral/comisión vacío o negativo (MW14 paso 5)", async () => {
    mock.onPut("/tiers").reply(400, { code: "VALIDATION_ERROR", message: "Tramo inválido" });
    await expect(
      replaceTiers([{ channel: "preventa", tierType: "por_devolucion", order: 1, thresholdValue: -1, commissionRate: 1 }]),
    ).rejects.toBeDefined();
  });
});
