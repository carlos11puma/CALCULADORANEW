import { describe, expect, it, vi, beforeEach } from "vitest";
import { CommissionLedgerService } from "../../src/commission-ledger/commission-ledger.service";
import { autoventaVendor, currentPeriodFixture, preventaTiersInOrder, preventaVendor } from "../../__fixtures__";

describe("CommissionLedgerService", () => {
  let repository: any;
  let prisma: any;
  let tierService: any;
  let notificationService: any;
  let service: CommissionLedgerService;

  beforeEach(() => {
    repository = {
      findCurrentPeriod: vi.fn(),
      findByVendorAndMonth: vi.fn(),
      createEmptyPeriod: vi.fn(),
      updatePeriod: vi.fn(),
      closePeriod: vi.fn(),
      findHistory: vi.fn(),
      sumSalesForMonth: vi.fn(),
      closeDailySalesForMonth: vi.fn(),
      findActiveVendors: vi.fn(),
      findVendorsByChannel: vi.fn(),
    };
    prisma = { vendor: { findUniqueOrThrow: vi.fn() } };
    tierService = { getTiers: vi.fn(), resolveApplicableTier: vi.fn() };
    notificationService = { evaluateSalesThresholds: vi.fn().mockResolvedValue([]), evaluateReturnThresholds: vi.fn().mockResolvedValue([]) };
    service = new CommissionLedgerService(repository, prisma, tierService, notificationService);
  });

  it("getCurrentPeriod crea el período al vuelo si no existe (W8 paso 2)", async () => {
    repository.findCurrentPeriod.mockResolvedValue(null);
    repository.createEmptyPeriod.mockResolvedValue(currentPeriodFixture);
    prisma.vendor.findUniqueOrThrow.mockResolvedValue(preventaVendor);

    const result = await service.getCurrentPeriod(preventaVendor.id);

    expect(repository.createEmptyPeriod).toHaveBeenCalled();
    expect(result.budgetProgress).toBeCloseTo((10000 / 100000) * 100);
  });

  it("BR4.1/BR4.3 — preventa: comisión = venta acumulada × tasa del tramo de devolución aplicable", async () => {
    repository.findCurrentPeriod.mockResolvedValue(currentPeriodFixture);
    repository.sumSalesForMonth.mockResolvedValue({ amount: 10000, returns: 300 }); // 3% devolución
    prisma.vendor.findUniqueOrThrow.mockResolvedValue(preventaVendor);
    tierService.getTiers.mockResolvedValue({ tiers: preventaTiersInOrder });
    tierService.resolveApplicableTier.mockReturnValue(preventaTiersInOrder[0]); // rate 0.05
    repository.updatePeriod.mockImplementation((id: string, data: any) => Promise.resolve({ ...currentPeriodFixture, ...data }));

    const result = await service.recalculateForVendor(preventaVendor.id);

    expect(result.commissionEarned).toBeCloseTo(10000 * 0.05);
    expect(result.returnRate).toBeCloseTo(0.03);
  });

  it("BR8.1 — returnRate es 0 cuando accumulatedSales es 0 (evita división por cero)", async () => {
    repository.findCurrentPeriod.mockResolvedValue(currentPeriodFixture);
    repository.sumSalesForMonth.mockResolvedValue({ amount: 0, returns: 0 });
    prisma.vendor.findUniqueOrThrow.mockResolvedValue(preventaVendor);
    tierService.getTiers.mockResolvedValue({ tiers: preventaTiersInOrder });
    tierService.resolveApplicableTier.mockReturnValue(null);
    repository.updatePeriod.mockImplementation((id: string, data: any) => Promise.resolve({ ...currentPeriodFixture, ...data }));

    const result = await service.recalculateForVendor(preventaVendor.id);

    expect(result.returnRate).toBe(0);
    expect(result.commissionEarned).toBe(0);
  });

  it("BR4.1 — autoventa: métrica de efectividad = accumulatedSales/budget×100", async () => {
    repository.findCurrentPeriod.mockResolvedValue({ ...currentPeriodFixture, vendorId: autoventaVendor.id });
    repository.sumSalesForMonth.mockResolvedValue({ amount: 47500, returns: 0 });
    prisma.vendor.findUniqueOrThrow.mockResolvedValue(autoventaVendor);
    tierService.getTiers.mockResolvedValue({ tiers: [] });
    tierService.resolveApplicableTier.mockReturnValue(null);
    repository.updatePeriod.mockImplementation((id: string, data: any) => Promise.resolve({ ...currentPeriodFixture, ...data }));

    await service.recalculateForVendor(autoventaVendor.id);

    expect(tierService.resolveApplicableTier).toHaveBeenCalledWith([], "por_efectividad", 95);
  });

  it("recalculateForVendor evalúa umbrales de venta y devolución tras recalcular (W6 paso 7)", async () => {
    repository.findCurrentPeriod.mockResolvedValue(currentPeriodFixture);
    repository.sumSalesForMonth.mockResolvedValue({ amount: 10000, returns: 300 });
    prisma.vendor.findUniqueOrThrow.mockResolvedValue(preventaVendor);
    tierService.getTiers.mockResolvedValue({ tiers: preventaTiersInOrder });
    tierService.resolveApplicableTier.mockReturnValue(preventaTiersInOrder[0]);
    repository.updatePeriod.mockImplementation((id: string, data: any) => Promise.resolve({ ...currentPeriodFixture, ...data }));

    await service.recalculateForVendor(preventaVendor.id);

    expect(notificationService.evaluateSalesThresholds).toHaveBeenCalled();
    expect(notificationService.evaluateReturnThresholds).toHaveBeenCalled();
  });

  it("Fix (Deployment Execution, 260909, décimo hallazgo) — getCurrentPeriod convierte los campos Decimal de Prisma a number, nunca deja pasar el string que produce su toJSON()", async () => {
    // Simula lo que realmente devuelve Prisma para un campo Decimal ya serializado: un
    // string, no un number — así fallaba en la app real (`.toFixed is not a function`),
    // aunque los fixtures de los demás tests (con `number` de JS) nunca lo detectaron.
    const periodWithDecimalStrings = {
      ...currentPeriodFixture,
      accumulatedSales: "10000.00" as unknown as number,
      accumulatedReturns: "500.00" as unknown as number,
      returnRate: "0.050000" as unknown as number,
      commissionEarned: "500.00" as unknown as number,
    };
    repository.findCurrentPeriod.mockResolvedValue(periodWithDecimalStrings);
    prisma.vendor.findUniqueOrThrow.mockResolvedValue(preventaVendor);

    const result = await service.getCurrentPeriod(preventaVendor.id);

    expect(result.accumulatedSales).toBe(10000);
    expect(result.accumulatedReturns).toBe(500);
    expect(result.returnRate).toBe(0.05);
    expect(result.commissionEarned).toBe(500);
    expect(typeof result.commissionEarned).toBe("number");
  });

  it("BR3.4 — isDateInClosedPeriod detecta un período cerrado para la fecha dada", async () => {
    repository.findByVendorAndMonth.mockResolvedValue({ closed: true });
    const result = await service.isDateInClosedPeriod(preventaVendor.id, new Date("2026-08-15T00:00:00.000Z"));
    expect(result).toBe(true);
  });

  it("BR3.4 — isDateInClosedPeriod retorna false cuando no hay período o está abierto", async () => {
    repository.findByVendorAndMonth.mockResolvedValue(null);
    const result = await service.isDateInClosedPeriod(preventaVendor.id, new Date("2026-09-15T00:00:00.000Z"));
    expect(result).toBe(false);
  });

  it("BR4.5/NFR6.3 — closeOverduePeriods cierra un período vigente cuyo mes ya terminó y abre el siguiente", async () => {
    repository.findActiveVendors.mockResolvedValue([{ id: preventaVendor.id }]);
    repository.findCurrentPeriod.mockResolvedValue({ ...currentPeriodFixture, periodMonth: "2026-07" });
    repository.findByVendorAndMonth.mockResolvedValue(null);

    const result = await service.closeOverduePeriods();

    expect(repository.closePeriod).toHaveBeenCalled();
    expect(repository.createEmptyPeriod).toHaveBeenCalled();
    expect(result.periodsClosedCount).toBe(1);
    expect(result.periodsCreatedCount).toBe(1);
  });

  it("BR4.5 — closeOverduePeriods es idempotente: no vuelve a cerrar un período ya vigente del mes actual", async () => {
    repository.findActiveVendors.mockResolvedValue([{ id: preventaVendor.id }]);
    repository.findCurrentPeriod.mockResolvedValue(currentPeriodFixture); // periodMonth = mes actual del fixture (2026-09), no vencido siempre

    await service.closeOverduePeriods();

    // Cuando el período vigente NO es anterior al mes en curso, no se cierra.
    expect(repository.closePeriod).not.toHaveBeenCalled();
  });
});
