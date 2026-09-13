import { CommissionPeriod, Notification, Vendor } from "@prisma/client";
import { CommissionTierService } from "../commission-tier/commission-tier.service";
import { NotificationRepository } from "./notification.repository";
export declare const SALES_THRESHOLDS: readonly [95, 97, 100, 103, 105, 110];
export declare const RETURN_THRESHOLDS: readonly [8.5, 8, 7.5, 7, 6, 5];
/**
 * NotificationComponent — BR7.1/BR7.2 (umbral de venta), BR8.2/BR8.3
 * (umbral de devolución + oportunidad de ganancia), BR9.2 (resolución de
 * destinatarios de notificación manual). W11, W12, W13.
 */
export declare class NotificationService {
    private readonly repository;
    private readonly tierService;
    constructor(repository: NotificationRepository, tierService: CommissionTierService);
    listForVendor(vendorId: string): Promise<Notification[]>;
    /** BR7.1/BR7.2 — umbral de venta/presupuesto: cruce hacia arriba, sin reenvío. */
    evaluateSalesThresholds(vendor: Vendor, period: CommissionPeriod): Promise<Notification[]>;
    /** BR8.1 (returnRate ya calculado por CommissionLedgerService) + BR8.2/BR8.3. */
    evaluateReturnThresholds(vendor: Vendor, period: CommissionPeriod): Promise<Notification[]>;
    /** BR8.3 — solo cuando los tramos de devolución del canal están en orden. */
    private buildEarningOpportunity;
    /** BR9.2 — resolución de destinatarios de notificación manual (W13). */
    sendManual(message: string, recipients: "all" | string[]): Promise<number>;
}
