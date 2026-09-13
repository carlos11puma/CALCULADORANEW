import { BadRequestException, Injectable } from "@nestjs/common";
import { CommissionPeriod, Notification, Vendor } from "@prisma/client";
import { CommissionTierService } from "../commission-tier/commission-tier.service";
import { NotificationRepository } from "./notification.repository";

export const SALES_THRESHOLDS = [95, 97, 100, 103, 105, 110] as const;
export const RETURN_THRESHOLDS = [8.5, 8, 7.5, 7, 6, 5] as const;

/**
 * NotificationComponent — BR7.1/BR7.2 (umbral de venta), BR8.2/BR8.3
 * (umbral de devolución + oportunidad de ganancia), BR9.2 (resolución de
 * destinatarios de notificación manual). W11, W12, W13.
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly tierService: CommissionTierService,
  ) {}

  listForVendor(vendorId: string): Promise<Notification[]> {
    return this.repository.findByVendor(vendorId);
  }

  /** BR7.1/BR7.2 — umbral de venta/presupuesto: cruce hacia arriba, sin reenvío. */
  async evaluateSalesThresholds(vendor: Vendor, period: CommissionPeriod): Promise<Notification[]> {
    const budgetProgress = (Number(period.accumulatedSales) / Number(vendor.budget)) * 100;
    const created: Notification[] = [];

    for (const threshold of SALES_THRESHOLDS) {
      if (budgetProgress < threshold) continue;

      const existing = await this.repository.existsForPeriod(
        vendor.id,
        "umbral_venta",
        threshold,
        period.periodMonth,
      );
      if (existing) continue;

      const notification = await this.repository.create({
        vendorId: vendor.id,
        type: "umbral_venta",
        thresholdCrossed: threshold,
        message: `Venta acumulada alcanzó ${threshold}% del presupuesto asignado.`,
        periodMonth: period.periodMonth,
      });
      created.push(notification);
    }

    return created;
  }

  /** BR8.1 (returnRate ya calculado por CommissionLedgerService) + BR8.2/BR8.3. */
  async evaluateReturnThresholds(vendor: Vendor, period: CommissionPeriod): Promise<Notification[]> {
    const returnRatePct = Number(period.returnRate) * 100;
    const created: Notification[] = [];

    const { tiers, inOrder } = await this.tierService.getTiers(vendor.channel);
    const applicableTier = this.tierService.resolveApplicableTier(tiers, "por_devolucion", returnRatePct);

    for (const threshold of RETURN_THRESHOLDS) {
      if (returnRatePct >= threshold) continue;

      const existing = await this.repository.existsForPeriod(
        vendor.id,
        "umbral_devolucion",
        threshold,
        period.periodMonth,
      );
      if (existing) continue;

      const earningOpportunity = inOrder ? this.buildEarningOpportunity(tiers, applicableTier, period) : undefined;

      const notification = await this.repository.create({
        vendorId: vendor.id,
        type: "umbral_devolucion",
        thresholdCrossed: threshold,
        earningOpportunity,
        message: `Indicador de devolución mejoró por debajo de ${threshold}%.`,
        periodMonth: period.periodMonth,
      });
      created.push(notification);
    }

    return created;
  }

  /** BR8.3 — solo cuando los tramos de devolución del canal están en orden. */
  private buildEarningOpportunity(
    tiers: Awaited<ReturnType<CommissionTierService["getTiers"]>>["tiers"],
    currentTier: ReturnType<CommissionTierService["resolveApplicableTier"]>,
    period: CommissionPeriod,
  ): { nextTierThreshold: number; potentialGain: number } | undefined {
    const nextTier = this.tierService.findNextBetterTier(tiers, "por_devolucion", currentTier);
    if (!nextTier) return undefined;

    const currentRate = currentTier ? Number(currentTier.commissionRate) : 0;
    const potentialGain = (Number(nextTier.commissionRate) - currentRate) * Number(period.accumulatedSales);

    return {
      nextTierThreshold: Number(nextTier.thresholdValue),
      potentialGain,
    };
  }

  /** BR9.2 — resolución de destinatarios de notificación manual (W13). */
  async sendManual(message: string, recipients: "all" | string[]): Promise<number> {
    if (!message.trim()) {
      throw new BadRequestException({ code: "VALIDATION_ERROR", message: "El mensaje no puede estar vacío" });
    }
    if (Array.isArray(recipients) && recipients.length === 0) {
      throw new BadRequestException({ code: "VALIDATION_ERROR", message: "La lista de destinatarios no puede estar vacía" });
    }

    const vendors =
      recipients === "all"
        ? await this.repository.findActiveVendors()
        : await this.repository.findActiveVendorsByIds(recipients);

    const currentMonth = new Date().toISOString().slice(0, 7);
    for (const vendor of vendors) {
      await this.repository.create({
        vendorId: vendor.id,
        type: "manual",
        message,
        periodMonth: currentMonth,
      });
    }

    return vendors.length;
  }
}
