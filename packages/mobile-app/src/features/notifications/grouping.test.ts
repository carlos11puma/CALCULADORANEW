import { groupNotifications } from "./grouping";
import type { AppNotification } from "../../shared/api/contractTypes";

function makeNotification(overrides: Partial<AppNotification>): AppNotification {
  return {
    id: "n1",
    vendorId: "v1",
    type: "manual",
    thresholdCrossed: null,
    earningOpportunity: null,
    message: "mensaje",
    sentAt: "2026-09-01T10:00:00.000Z",
    read: false,
    ...overrides,
  };
}

describe("groupNotifications", () => {
  it("retorna arreglo vacío para una lista vacía", () => {
    expect(groupNotifications([])).toEqual([]);
  });

  it("agrupa por type en las tres secciones con título/ícono correctos", () => {
    const notifications = [
      makeNotification({ id: "a", type: "umbral_venta" }),
      makeNotification({ id: "b", type: "umbral_devolucion" }),
      makeNotification({ id: "c", type: "manual" }),
    ];
    const groups = groupNotifications(notifications);
    expect(groups.map((g) => g.key)).toEqual(["umbral_venta", "umbral_devolucion", "manual"]);
    expect(groups.find((g) => g.key === "umbral_venta")?.title).toBe("VENTA Y PRESUPUESTO");
    expect(groups.find((g) => g.key === "umbral_devolucion")?.icon).toBe("📉");
  });

  it("omite grupos sin notificaciones", () => {
    const groups = groupNotifications([makeNotification({ type: "manual" })]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("manual");
  });

  it("ordena cada grupo por sentAt descendente", () => {
    const older = makeNotification({ id: "older", type: "manual", sentAt: "2026-01-01T00:00:00.000Z" });
    const newer = makeNotification({ id: "newer", type: "manual", sentAt: "2026-06-01T00:00:00.000Z" });
    const groups = groupNotifications([older, newer]);
    expect(groups[0].items.map((n) => n.id)).toEqual(["newer", "older"]);
  });

  it("preserva earningOpportunity tal como lo entrega el backend (AC8.3.1/AC8.3.2)", () => {
    const withOpportunity = makeNotification({
      type: "umbral_devolucion",
      earningOpportunity: { nextTierThreshold: 5, potentialGain: 100 },
    });
    const withoutOpportunity = makeNotification({
      id: "n2",
      type: "umbral_devolucion",
      earningOpportunity: null,
    });
    const groups = groupNotifications([withOpportunity, withoutOpportunity]);
    const items = groups[0].items;
    expect(items.find((n) => n.id === "n1")?.earningOpportunity).toEqual({
      nextTierThreshold: 5,
      potentialGain: 100,
    });
    expect(items.find((n) => n.id === "n2")?.earningOpportunity).toBeNull();
  });
});
