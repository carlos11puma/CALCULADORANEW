import { describe, expect, it, vi, beforeEach } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { NotificationService } from "../../src/notification/notification.service";
import { autoventaVendor, currentPeriodFixture, preventaTiersInOrder, preventaTiersOutOfOrder, preventaVendor } from "../../__fixtures__";

describe("NotificationService", () => {
  let repository: { existsForPeriod: any; create: any; findActiveVendors: any; findActiveVendorsByIds: any; findByVendor: any };
  let tierService: { getTiers: any; resolveApplicableTier: any; findNextBetterTier: any };
  let service: NotificationService;

  beforeEach(() => {
    repository = {
      existsForPeriod: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((data) => Promise.resolve({ id: "n1", ...data })),
      findActiveVendors: vi.fn(),
      findActiveVendorsByIds: vi.fn(),
      findByVendor: vi.fn(),
    };
    tierService = {
      getTiers: vi.fn().mockResolvedValue({ tiers: preventaTiersInOrder, inOrder: true }),
      resolveApplicableTier: vi.fn().mockReturnValue(preventaTiersInOrder[1]),
      findNextBetterTier: vi.fn().mockReturnValue(preventaTiersInOrder[0]),
    };
    service = new NotificationService(repository as any, tierService as any);
  });

  it("BR7.1 — crea Notification cuando la venta acumulada cruza un umbral de presupuesto", async () => {
    const period = { ...currentPeriodFixture, accumulatedSales: 96000, vendorId: autoventaVendor.id };
    const created = await service.evaluateSalesThresholds(autoventaVendor, period);
    expect(created.length).toBeGreaterThan(0);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ vendorId: autoventaVendor.id, type: "umbral_venta" }),
    );
  });

  it("BR7.2 — no reenvía un umbral de venta ya notificado en el período vigente", async () => {
    repository.existsForPeriod.mockResolvedValue({ id: "existing" });
    const period = { ...currentPeriodFixture, accumulatedSales: 96000, vendorId: autoventaVendor.id };
    const created = await service.evaluateSalesThresholds(autoventaVendor, period);
    expect(created).toHaveLength(0);
  });

  it("BR8.2 — crea Notification cuando el indicador de devolución mejora por debajo de un umbral", async () => {
    const period = { ...currentPeriodFixture, returnRate: 0.04, vendorId: preventaVendor.id };
    const created = await service.evaluateReturnThresholds(preventaVendor, period);
    expect(created.length).toBeGreaterThan(0);
  });

  it("BR8.3 — incluye earningOpportunity cuando los tramos están en orden", async () => {
    const period = { ...currentPeriodFixture, returnRate: 0.04, vendorId: preventaVendor.id };
    await service.evaluateReturnThresholds(preventaVendor, period);
    const createCall = repository.create.mock.calls.find((c: any) => c[0].type === "umbral_devolucion");
    expect(createCall?.[0].earningOpportunity).toBeDefined();
  });

  it("BR8.3 — omite earningOpportunity cuando los tramos están fuera de orden", async () => {
    tierService.getTiers.mockResolvedValue({ tiers: preventaTiersOutOfOrder, inOrder: false });
    const period = { ...currentPeriodFixture, returnRate: 0.04, vendorId: preventaVendor.id };
    await service.evaluateReturnThresholds(preventaVendor, period);
    const createCall = repository.create.mock.calls.find((c: any) => c[0].type === "umbral_devolucion");
    expect(createCall?.[0].earningOpportunity).toBeUndefined();
  });

  it("BR9.2 — 'all' notifica a todo Vendor activo", async () => {
    repository.findActiveVendors.mockResolvedValue([{ id: "v1" }, { id: "v2" }]);
    const count = await service.sendManual("aviso", "all");
    expect(count).toBe(2);
    expect(repository.create).toHaveBeenCalledTimes(2);
  });

  it("BR9.2 — lista explícita solo notifica a los ids que resuelven a Vendor activo", async () => {
    repository.findActiveVendorsByIds.mockResolvedValue([{ id: "v1" }]);
    const count = await service.sendManual("aviso", ["v1", "no-existe"]);
    expect(count).toBe(1);
  });

  it("rechaza con VALIDATION_ERROR cuando el mensaje está vacío", async () => {
    await expect(service.sendManual("   ", "all")).rejects.toThrow(BadRequestException);
  });

  it("rechaza con VALIDATION_ERROR cuando la lista de destinatarios está vacía", async () => {
    await expect(service.sendManual("aviso", [])).rejects.toThrow(BadRequestException);
  });
});
