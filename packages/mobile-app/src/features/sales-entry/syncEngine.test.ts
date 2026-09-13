import { runSync, __resetSyncStateForTests } from "./syncEngine";
import * as pendingSalesDb from "../../shared/storage/pendingSalesDb";
import * as api from "./api";

jest.mock("../../shared/storage/pendingSalesDb");
jest.mock("./api");

const mockedDb = pendingSalesDb as jest.Mocked<typeof pendingSalesDb>;
const mockedApi = api as jest.Mocked<typeof api>;

describe("syncEngine.runSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetSyncStateForTests();
  });

  it("no llama a la API si no hay ventas pendientes (caso 0 pendientes)", async () => {
    mockedDb.listPendingSales.mockResolvedValue([]);
    const outcome = await runSync("v1");
    expect(outcome).toEqual({ appliedCount: 0, rejectedCount: 0, skipped: true });
    expect(mockedApi.postSalesSync).not.toHaveBeenCalled();
  });

  it("sincroniza 1 venta pendiente aplicada y la elimina de pending_sales", async () => {
    mockedDb.listPendingSales.mockResolvedValue([
      { vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0, createdAt: "x", syncAttempts: 0, rejectedReason: null },
    ]);
    mockedApi.postSalesSync.mockResolvedValue([{ saleDate: "2026-09-08", status: "applied", error: null }]);

    const outcome = await runSync("v1");

    expect(outcome).toEqual({ appliedCount: 1, rejectedCount: 0, skipped: false });
    expect(mockedDb.deletePendingSale).toHaveBeenCalledWith("v1", "2026-09-08");
    expect(mockedDb.markPendingSaleRejected).not.toHaveBeenCalled();
  });

  it("sincroniza N ventas de varios días acumulados sin conexión (AC3.3.3)", async () => {
    mockedDb.listPendingSales.mockResolvedValue([
      { vendorId: "v1", saleDate: "2026-09-06", amount: 10, returns: 0, createdAt: "x", syncAttempts: 0, rejectedReason: null },
      { vendorId: "v1", saleDate: "2026-09-07", amount: 20, returns: 0, createdAt: "x", syncAttempts: 0, rejectedReason: null },
    ]);
    mockedApi.postSalesSync.mockResolvedValue([
      { saleDate: "2026-09-06", status: "applied", error: null },
      { saleDate: "2026-09-07", status: "applied", error: null },
    ]);

    const outcome = await runSync("v1");
    expect(outcome.appliedCount).toBe(2);
    expect(mockedDb.deletePendingSale).toHaveBeenCalledTimes(2);
  });

  it("marca un ítem rechazado sin eliminarlo, con el motivo del backend", async () => {
    mockedDb.listPendingSales.mockResolvedValue([
      { vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0, createdAt: "x", syncAttempts: 0, rejectedReason: null },
    ]);
    mockedApi.postSalesSync.mockResolvedValue([
      { saleDate: "2026-09-08", status: "rejected", error: { code: "PERIOD_CLOSED", message: "Cerrado" } },
    ]);

    const outcome = await runSync("v1");

    expect(outcome).toEqual({ appliedCount: 0, rejectedCount: 1, skipped: false });
    expect(mockedDb.markPendingSaleRejected).toHaveBeenCalledWith("v1", "2026-09-08", "PERIOD_CLOSED");
    expect(mockedDb.deletePendingSale).not.toHaveBeenCalled();
  });

  it("descarta un segundo disparo mientras el primero está en vuelo (guarda R-02)", async () => {
    mockedDb.listPendingSales.mockResolvedValue([
      { vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0, createdAt: "x", syncAttempts: 0, rejectedReason: null },
    ]);
    let resolvePost: (value: unknown) => void = () => {};
    mockedApi.postSalesSync.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }) as any,
    );

    const first = runSync("v1");
    const second = await runSync("v1"); // segundo disparo "simultáneo"

    expect(second).toEqual({ appliedCount: 0, rejectedCount: 0, skipped: true });
    resolvePost([{ saleDate: "2026-09-08", status: "applied", error: null }]);
    await first;
    expect(mockedApi.postSalesSync).toHaveBeenCalledTimes(1);
  });

  it("no cambia pending_sales si la llamada de red falla (MW8 paso 4)", async () => {
    mockedDb.listPendingSales.mockResolvedValue([
      { vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0, createdAt: "x", syncAttempts: 0, rejectedReason: null },
    ]);
    mockedApi.postSalesSync.mockRejectedValue(new Error("network error"));

    await expect(runSync("v1")).rejects.toThrow("network error");
    expect(mockedDb.deletePendingSale).not.toHaveBeenCalled();
    expect(mockedDb.markPendingSaleRejected).not.toHaveBeenCalled();
  });

  it("libera la bandera de sincronización en vuelo tras un fallo, permitiendo reintentar", async () => {
    mockedDb.listPendingSales.mockResolvedValueOnce([
      { vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0, createdAt: "x", syncAttempts: 0, rejectedReason: null },
    ]);
    mockedApi.postSalesSync.mockRejectedValueOnce(new Error("network error"));
    await expect(runSync("v1")).rejects.toThrow();

    mockedDb.listPendingSales.mockResolvedValueOnce([
      { vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0, createdAt: "x", syncAttempts: 0, rejectedReason: null },
    ]);
    mockedApi.postSalesSync.mockResolvedValueOnce([{ saleDate: "2026-09-08", status: "applied", error: null }]);
    const outcome = await runSync("v1");
    expect(outcome.skipped).toBe(false);
  });
});
