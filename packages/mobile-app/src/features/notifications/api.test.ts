import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../../shared/api/apiClient";
import { getNotifications } from "./api";

describe("features/notifications/api", () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it("retorna la lista plana de notificaciones (200, MW11)", async () => {
    mock.onGet("/notifications").reply(200, [
      { id: "n1", vendorId: "v1", type: "umbral_venta", thresholdCrossed: 100, earningOpportunity: null, message: "Alcanzaste 100%", sentAt: "2026-09-08T10:00:00Z", read: false },
    ]);
    const result = await getNotifications();
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("umbral_venta");
  });

  it("retorna una lista vacía (estado empty)", async () => {
    mock.onGet("/notifications").reply(200, []);
    expect(await getNotifications()).toEqual([]);
  });

  it("preserva earningOpportunity=null sin fallar (AC8.3.2)", async () => {
    mock.onGet("/notifications").reply(200, [
      { id: "n2", vendorId: "v1", type: "umbral_devolucion", thresholdCrossed: 7, earningOpportunity: null, message: "Bajó a 7%", sentAt: "2026-09-08T09:00:00Z", read: false },
    ]);
    const result = await getNotifications();
    expect(result[0].earningOpportunity).toBeNull();
  });

  it("propaga un error de red", async () => {
    mock.onGet("/notifications").networkError();
    await expect(getNotifications()).rejects.toBeDefined();
  });
});
