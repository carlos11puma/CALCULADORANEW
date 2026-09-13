import { CommissionPeriod, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class CommissionLedgerRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findCurrentPeriod(vendorId: string): Promise<CommissionPeriod | null>;
    findByVendorAndMonth(vendorId: string, periodMonth: string): Promise<CommissionPeriod | null>;
    createEmptyPeriod(vendorId: string, periodMonth: string): Promise<CommissionPeriod>;
    updatePeriod(id: string, data: {
        accumulatedSales: Prisma.Decimal | number;
        accumulatedReturns: Prisma.Decimal | number;
        returnRate: Prisma.Decimal | number;
        commissionEarned: Prisma.Decimal | number;
    }): Promise<CommissionPeriod>;
    closePeriod(id: string): Promise<CommissionPeriod>;
    findHistory(vendorId: string, limit?: number): Promise<CommissionPeriod[]>;
    sumSalesForMonth(vendorId: string, periodMonth: string): Promise<{
        amount: Prisma.Decimal | null;
        returns: Prisma.Decimal | null;
    }>;
    closeDailySalesForMonth(vendorId: string, periodMonth: string): Promise<Prisma.BatchPayload>;
    findActiveVendors(): Promise<{
        id: string;
    }[]>;
    findVendorsByChannel(channel: "preventa" | "autoventa"): Promise<{
        id: string;
    }[]>;
}
/** Rango [inicio, fin) de un mes en formato AAAA-MM, en UTC. */
export declare function monthRange(periodMonth: string): [Date, Date];
/** Mes siguiente en formato AAAA-MM. */
export declare function nextMonth(periodMonth: string): string;
/** Mes vigente en formato AAAA-MM, en UTC. */
export declare function currentMonth(): string;
