import { Injectable } from "@nestjs/common";
import { Notification, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByVendor(vendorId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { vendorId },
      orderBy: { sentAt: "desc" },
    });
  }

  existsForPeriod(
    vendorId: string,
    type: "umbral_venta" | "umbral_devolucion" | "manual",
    thresholdCrossed: number,
    periodMonth: string,
  ): Promise<Notification | null> {
    return this.prisma.notification.findFirst({
      where: { vendorId, type, thresholdCrossed, periodMonth },
    });
  }

  create(data: {
    vendorId: string;
    type: "umbral_venta" | "umbral_devolucion" | "manual";
    thresholdCrossed?: number | null;
    earningOpportunity?: Prisma.InputJsonValue | undefined;
    message: string;
    periodMonth: string;
  }): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  findActiveVendors(): Promise<{ id: string }[]> {
    return this.prisma.vendor.findMany({ where: { active: true }, select: { id: true } });
  }

  findActiveVendorsByIds(ids: string[]): Promise<{ id: string }[]> {
    return this.prisma.vendor.findMany({ where: { id: { in: ids }, active: true }, select: { id: true } });
  }
}
