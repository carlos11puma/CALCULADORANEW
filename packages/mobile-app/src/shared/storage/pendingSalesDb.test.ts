import {
  upsertPendingSale,
  listPendingSales,
  getPendingSale,
  deletePendingSale,
  markPendingSaleRejected,
  __resetDbForTests,
} from "./pendingSalesDb";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expoSqliteMock } = require("../__fixtures__/expoSqliteMock");

describe("pendingSalesDb", () => {
  beforeEach(() => {
    expoSqliteMock.__resetAll();
    __resetDbForTests();
  });

  it("inserta una nueva venta pendiente y la puede leer de vuelta", async () => {
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 5 });
    const found = await getPendingSale("v1", "2026-09-08");
    expect(found).toMatchObject({ vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 5 });
    expect(found?.syncAttempts).toBe(0);
  });

  it("upsert sobre la misma fecha/vendedor sobrescribe, no duplica (MW7 paso 3)", async () => {
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0 });
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 150, returns: 10 });
    const all = await listPendingSales("v1");
    expect(all).toHaveLength(1);
    expect(all[0].amount).toBe(150);
  });

  it("distingue filas por vendorId aunque compartan la misma fecha (defensa R-01)", async () => {
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0 });
    await upsertPendingSale({ vendorId: "v2", saleDate: "2026-09-08", amount: 200, returns: 0 });
    expect(await listPendingSales("v1")).toHaveLength(1);
    expect(await listPendingSales("v2")).toHaveLength(1);
  });

  it("lista solo las ventas pendientes del vendorId solicitado", async () => {
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-01", amount: 10, returns: 0 });
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-02", amount: 20, returns: 0 });
    await upsertPendingSale({ vendorId: "v2", saleDate: "2026-09-01", amount: 30, returns: 0 });
    const v1Rows = await listPendingSales("v1");
    expect(v1Rows).toHaveLength(2);
    expect(v1Rows.every((r) => r.vendorId === "v1")).toBe(true);
  });

  it("elimina una fila tras sincronización exitosa (MW8, applied)", async () => {
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0 });
    await deletePendingSale("v1", "2026-09-08");
    expect(await getPendingSale("v1", "2026-09-08")).toBeNull();
  });

  it("marca una fila como rechazada sin eliminarla (MW8, rejected)", async () => {
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0 });
    await markPendingSaleRejected("v1", "2026-09-08", "PERIOD_CLOSED");
    const found = await getPendingSale("v1", "2026-09-08");
    expect(found?.rejectedReason).toBe("PERIOD_CLOSED");
    expect(found?.syncAttempts).toBe(1);
  });

  it("getPendingSale retorna null si no existe la fila", async () => {
    expect(await getPendingSale("v1", "2026-09-08")).toBeNull();
  });

  it("rechaza un monto <= 0 con un error explícito (fail fast)", async () => {
    await expect(
      upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 0, returns: 0 }),
    ).rejects.toThrow(/amount/);
  });
});
