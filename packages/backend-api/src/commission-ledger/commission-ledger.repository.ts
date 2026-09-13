import { Injectable } from "@nestjs/common";
import { CommissionPeriod, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CommissionLedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCurrentPeriod(vendorId: string): Promise<CommissionPeriod | null> {
    return this.prisma.commissionPeriod.findFirst({ where: { vendorId, closed: false } });
  }

  findByVendorAndMonth(vendorId: string, periodMonth: string): Promise<CommissionPeriod | null> {
    return this.prisma.commissionPeriod.findUnique({ where: { vendorId_periodMonth: { vendorId, periodMonth } } });
  }

  createEmptyPeriod(vendorId: string, periodMonth: string): Promise<CommissionPeriod> {
    return this.prisma.commissionPeriod.create({ data: { vendorId, periodMonth } });
  }

  updatePeriod(
    id: string,
    data: {
      accumulatedSales: Prisma.Decimal | number;
      accumulatedReturns: Prisma.Decimal | number;
      returnRate: Prisma.Decimal | number;
      commissionEarned: Prisma.Decimal | number;
    },
  ): Promise<CommissionPeriod> {
    return this.prisma.commissionPeriod.update({ where: { id }, data });
  }

  closePeriod(id: string): Promise<CommissionPeriod> {
    return this.prisma.commissionPeriod.update({ where: { id }, data: { closed: true, closedAt: new Date() } });
  }

  findHistory(vendorId: string, limit?: number): Promise<CommissionPeriod[]> {
    return this.prisma.commissionPeriod.findMany({
      where: { vendorId, closed: true },
      orderBy: { periodMonth: "desc" },
      ...(limit ? { take: limit } : {}),
    });
  }

  sumSalesForMonth(
    vendorId: string,
    periodMonth: string,
  ): Promise<{ amount: Prisma.Decimal | null; returns: Prisma.Decimal | null }> {
    const [start, end] = monthRange(periodMonth);
    return this.prisma.dailySale
      .aggregate({
        where: { vendorId, saleDate: { gte: start, lt: end } },
        _sum: { amount: true, returns: true },
      })
      .then((r) => ({ amount: r._sum.amount, returns: r._sum.returns }));
  }

  closeDailySalesForMonth(vendorId: string, periodMonth: string): Promise<Prisma.BatchPayload> {
    const [start, end] = monthRange(periodMonth);
    return this.prisma.dailySale.updateMany({
      where: { vendorId, saleDate: { gte: start, lt: end } },
      data: { closed: true },
    });
  }

  findActiveVendors(): Promise<{ id: string }[]> {
    return this.prisma.vendor.findMany({ where: { active: true }, select: { id: true } });
  }

  findVendorsByChannel(channel: "preventa" | "autoventa"): Promise<{ id: string }[]> {
    return this.prisma.vendor.findMany({ where: { channel, active: true }, select: { id: true } });
  }
}

/** Rango [inicio, fin) de un mes en formato AAAA-MM, en UTC. */
export function monthRange(periodMonth: string): [Date, Date] {
  const [year, month] = periodMonth.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1));
  return [start, end];
}

/** Mes siguiente en formato AAAA-MM. */
export function nextMonth(periodMonth: string): string {
  const [year, month] = periodMonth.split("-").map(Number);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonthNum = month === 12 ? 1 : month + 1;
  return `${nextYear}-${String(nextMonthNum).padStart(2, "0")}`;
}

/** Mes vigente en formato AAAA-MM, en UTC. */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
