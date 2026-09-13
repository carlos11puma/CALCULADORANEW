import { describe, expect, it, vi, beforeEach } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { VendorDirectoryService } from "../../src/vendor-directory/vendor-directory.service";
import { preventaVendor } from "../../__fixtures__";

describe("VendorDirectoryService", () => {
  let repository: any;
  let commissionLedgerService: any;
  let service: VendorDirectoryService;

  beforeEach(() => {
    repository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      countUsernameLike: vi.fn().mockResolvedValue(0),
      createVendorWithUser: vi.fn(),
      update: vi.fn(),
    };
    commissionLedgerService = { recalculateForVendor: vi.fn() };
    service = new VendorDirectoryService(repository, commissionLedgerService);
  });

  it("W4 — crea un Vendor con budget válido, generando username único", async () => {
    repository.createVendorWithUser.mockResolvedValue(preventaVendor);
    const result = await service.create({ route: "Ruta 1", name: "Juan Pérez", channel: "preventa", budget: 1000 });
    expect(result).toEqual(preventaVendor);
    expect(repository.createVendorWithUser).toHaveBeenCalledWith(
      expect.objectContaining({ route: "Ruta 1", name: "Juan Pérez", channel: "preventa", budget: 1000 }),
    );
  });

  it("rechaza con VALIDATION_ERROR cuando budget es negativo (AC2.2.2/BR2.1)", async () => {
    await expect(service.create({ route: "R", name: "N", channel: "preventa", budget: -5 })).rejects.toThrow(BadRequestException);
  });

  it("rechaza con VALIDATION_ERROR cuando budget es cero", async () => {
    await expect(service.create({ route: "R", name: "N", channel: "preventa", budget: 0 })).rejects.toThrow(BadRequestException);
  });

  it("W4 — recalcula la comisión vigente cuando budget cambia al editar", async () => {
    repository.findById.mockResolvedValue(preventaVendor);
    repository.update.mockResolvedValue({ ...preventaVendor, budget: 5000 });

    await service.update(preventaVendor.id, { route: "Ruta 12", name: "Juan Pérez", channel: "preventa", budget: 5000 });

    expect(commissionLedgerService.recalculateForVendor).toHaveBeenCalledWith(preventaVendor.id);
  });

  it("W4/R-01 — recalcula la comisión vigente cuando channel cambia (aunque budget no cambie)", async () => {
    repository.findById.mockResolvedValue(preventaVendor);
    repository.update.mockResolvedValue({ ...preventaVendor, channel: "autoventa" });

    await service.update(preventaVendor.id, { route: "Ruta 12", name: "Juan Pérez", channel: "autoventa", budget: 100000 });

    expect(commissionLedgerService.recalculateForVendor).toHaveBeenCalled();
  });

  it("no recalcula cuando ni budget ni channel cambian", async () => {
    repository.findById.mockResolvedValue(preventaVendor);
    repository.update.mockResolvedValue(preventaVendor);

    await service.update(preventaVendor.id, { route: "Ruta nueva", name: "Juan Pérez", channel: "preventa", budget: 100000 });

    expect(commissionLedgerService.recalculateForVendor).not.toHaveBeenCalled();
  });

  it("rechaza con 404 al editar un vendedor que no existe", async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.update("no-existe", { route: "R", name: "N", channel: "preventa", budget: 100 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
