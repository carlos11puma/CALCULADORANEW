import { Notification, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class NotificationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByVendor(vendorId: string): Promise<Notification[]>;
    existsForPeriod(vendorId: string, type: "umbral_venta" | "umbral_devolucion" | "manual", thresholdCrossed: number, periodMonth: string): Promise<Notification | null>;
    create(data: {
        vendorId: string;
        type: "umbral_venta" | "umbral_devolucion" | "manual";
        thresholdCrossed?: number | null;
        earningOpportunity?: Prisma.InputJsonValue | undefined;
        message: string;
        periodMonth: string;
    }): Promise<Notification>;
    findActiveVendors(): Promise<{
        id: string;
    }[]>;
    findActiveVendorsByIds(ids: string[]): Promise<{
        id: string;
    }[]>;
}
