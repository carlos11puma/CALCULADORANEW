import { describe, expect, it, vi, beforeEach } from "vitest";
import { ConflictException } from "@nestjs/common";
import { SalesEntryService } from "../../src/sales-entry/sales-entry.service";
import { dailySaleFixture, preventaVendor } from "../../__fixtures__";

describe("SalesEntryService", () => {
  let repository: any;
  let commissionLedgerService: any;
  let service: SalesEntryService;

  beforeEach(() => {
    repository = { findByVendorAndDate: vi.fn(), create: vi.fn(), update: vi.fn() };
    commissionLedgerService = { isDateInClosedPeriod: vi.fn().mockResolvedValue(false), recalculateForVendor: vi.fn() };
    service = new SalesEntryService(repository, commissionLedgerService);
  });

  it("W6 — crea la venta del día cuando no existe registro previo", async () => {
    repository.findByVendorAndDate.mockResolvedValue(null);
    repository.create.mockResolvedValue(dailySaleFixture);

    const result = await service.recordSale(preventaVendor.id, { saleDate: "2026-09-05", amount: 1000, returns: 50 });

    expect(result).toEqual(dailySaleFixture);
    expect(commissionLedgerService.recalculateForVendor).toHaveBeenCalledWith(preventaVendor.id);
  });

  it("W6 — corrige la venta del día cuando ya existe y está abierta", async () => {
    repository.findByVendorAndDate.mockResolvedValue({ ...dailySaleFixture, closed: false });
    repository.update.mockResolvedValue({ ...dailySaleFixture, amount: 1200 });

    const result = await service.recordSale(preventaVendor.id, { saleDate: "2026-09-05", amount: 1200, returns: 50 });

    expect(result.amount).toBe(1200);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rechaza con 409 DAY_CLOSED cuando el día ya cerró (FR3.3/BR3.2)", async () => {
    repository.findByVendorAndDate.mockResolvedValue({ ...dailySaleFixture, closed: true });
    await expect(
      service.recordSale(preventaVendor.id, { saleDate: "2026-09-05", amount: 1200, returns: 50 }),
    ).rejects.toThrow(ConflictException);
  });

  it("BR3.4 — rechaza con 409 PERIOD_CLOSED cuando la fecha cae en un período ya cerrado", async () => {
    commissionLedgerService.isDateInClosedPeriod.mockResolvedValue(true);
    await expect(
      service.recordSale(preventaVendor.id, { saleDate: "2026-08-05", amount: 1000, returns: 0 }),
    ).rejects.toThrow(ConflictException);
  });

  it("W7 — sincroniza un lote aplicando cada ítem válido de fecha distinta", async () => {
    repository.findByVendorAndDate.mockResolvedValue(null);
    repository.create.mockResolvedValue(dailySaleFixture);

    const results = await service.syncBatch(preventaVendor.id, [
      { saleDate: "2026-09-01", amount: 100, returns: 0 },
      { saleDate: "2026-09-02", amount: 200, returns: 10 },
    ]);

    expect(results).toEqual([
      { saleDate: "2026-09-01", status: "applied" },
      { saleDate: "2026-09-02", status: "applied" },
    ]);
    // W7 paso 3 — un solo recálculo por vendedor, no uno por ítem.
    expect(commissionLedgerService.recalculateForVendor).toHaveBeenCalledTimes(1);
  });

  it("W7 — marca rejected un ítem cuya fecha cae en un período cerrado, sin afectar los demás (BR3.4)", async () => {
    commissionLedgerService.isDateInClosedPeriod.mockImplementation(async (_v: string, d: Date) => d.getUTCMonth() === 7);
    repository.findByVendorAndDate.mockResolvedValue(null);
    repository.create.mockResolvedValue(dailySaleFixture);

    const results = await service.syncBatch(preventaVendor.id, [
      { saleDate: "2026-08-15", amount: 100, returns: 0 },
      { saleDate: "2026-09-02", amount: 200, returns: 10 },
    ]);

    expect(results[0]).toMatchObject({ status: "rejected", error: { code: "PERIOD_CLOSED" } });
    expect(results[1]).toMatchObject({ status: "applied" });
  });

  it("W7 — marca rejected un ítem con forma inválida (BR3.1) sin bloquear el resto del lote", async () => {
    repository.findByVendorAndDate.mockResolvedValue(null);
    repository.create.mockResolvedValue(dailySaleFixture);

    const results = await service.syncBatch(preventaVendor.id, [
      { saleDate: "2026-09-01", amount: -5, returns: 0 },
      { saleDate: "2026-09-02", amount: 200, returns: 10 },
    ]);

    expect(results[0]).toMatchObject({ status: "rejected", error: { code: "VALIDATION_ERROR" } });
    expect(results[1]).toMatchObject({ status: "applied" });
  });

  it("BR3.5 — la sincronización más reciente sobrescribe un registro existente sin detección de conflicto", async () => {
    repository.findByVendorAndDate.mockResolvedValue(dailySaleFixture);
    repository.update.mockResolvedValue({ ...dailySaleFixture, amount: 999 });

    const results = await service.syncBatch(preventaVendor.id, [{ saleDate: "2026-09-05", amount: 999, returns: 0 }]);

    expect(repository.update).toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(results[0].status).toBe("applied");
  });
});
