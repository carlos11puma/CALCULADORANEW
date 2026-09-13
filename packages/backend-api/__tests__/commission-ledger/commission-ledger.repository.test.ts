import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { CommissionLedgerRepository, currentMonth, monthRange, nextMonth } from "../../src/commission-ledger/commission-ledger.repository";
import { currentPeriodFixture, preventaVendor } from "../../__fixtures__";

describe("CommissionLedgerRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: CommissionLedgerRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new CommissionLedgerRepository(prisma as any);
  });

  it("findCurrentPeriod busca el período no cerrado del vendedor", async () => {
    prisma.commissionPeriod.findFirst.mockResolvedValue(currentPeriodFixture);
    const result = await repository.findCurrentPeriod(preventaVendor.id);
    expect(result).toEqual(currentPeriodFixture);
    expect(prisma.commissionPeriod.findFirst).toHaveBeenCalledWith({ where: { vendorId: preventaVendor.id, closed: false } });
  });

  it("findHistory filtra por closed=true y ordena por periodMonth descendente (BR6.1)", async () => {
    prisma.commissionPeriod.findMany.mockResolvedValue([]);
    await repository.findHistory(preventaVendor.id, 5);
    expect(prisma.commissionPeriod.findMany).toHaveBeenCalledWith({
      where: { vendorId: preventaVendor.id, closed: true },
      orderBy: { periodMonth: "desc" },
      take: 5,
    });
  });

  it("createEmptyPeriod crea el período en cero", async () => {
    prisma.commissionPeriod.create.mockResolvedValue(currentPeriodFixture);
    const result = await repository.createEmptyPeriod(preventaVendor.id, "2026-09");
    expect(result).toEqual(currentPeriodFixture);
  });

  it("closePeriod fija closed=true y closedAt", async () => {
    prisma.commissionPeriod.update.mockResolvedValue({ ...currentPeriodFixture, closed: true, closedAt: new Date() });
    const result = await repository.closePeriod("period_1");
    expect(result.closed).toBe(true);
    expect(result.closedAt).not.toBeNull();
  });

  it("sumSalesForMonth agrega amount/returns dentro del rango del mes", async () => {
    prisma.dailySale.aggregate.mockResolvedValue({ _sum: { amount: 5000, returns: 100 } } as any);
    const result = await repository.sumSalesForMonth(preventaVendor.id, "2026-09");
    expect(result).toEqual({ amount: 5000, returns: 100 });
  });

  it("monthRange calcula el rango [inicio, fin) correcto, incluyendo cambio de año", () => {
    const [start, end] = monthRange("2026-12");
    expect(start.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("nextMonth calcula el mes siguiente, incluyendo cambio de año", () => {
    expect(nextMonth("2026-09")).toBe("2026-10");
    expect(nextMonth("2026-12")).toBe("2027-01");
  });

  it("currentMonth retorna el formato AAAA-MM", () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/);
  });
});
