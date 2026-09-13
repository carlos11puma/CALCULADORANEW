import { CommissionPeriod } from "@prisma/client";
import { CommissionTierService } from "../commission-tier/commission-tier.service";
import { NotificationService } from "../notification/notification.service";
import { PrismaService } from "../prisma/prisma.service";
import { CommissionLedgerRepository } from "./commission-ledger.repository";
export interface CommissionPeriodView extends CommissionPeriod {
    budgetProgress: number;
}
/**
 * CommissionLedgerComponent — BR4.1-BR4.5 (cálculo y cierre), BR6.1
 * (historial), BR8.1 (indicador de devolución). W8, W9, W10.
 */
export declare class CommissionLedgerService {
    private readonly repository;
    private readonly prisma;
    private readonly tierService;
    private readonly notificationService;
    private readonly logger;
    constructor(repository: CommissionLedgerRepository, prisma: PrismaService, tierService: CommissionTierService, notificationService: NotificationService);
    /** W8: resuelve (o crea al vuelo) el período vigente del vendedor. */
    getCurrentPeriod(vendorId: string): Promise<CommissionPeriodView>;
    /** BR6.1 — historial: solo períodos cerrados, más recientes primero. */
    getHistory(vendorId: string, limit?: number): Promise<CommissionPeriod[]>;
    /** BR4.4 — recálculo completo (nunca incremental) del período vigente de un vendedor. */
    recalculateForVendor(vendorId: string): Promise<CommissionPeriodView>;
    /** W5 paso 4 — cambio de tramos de un canal dispara BR4.4 para cada Vendor de ese canal. */
    recalculateAllForChannel(channel: "preventa" | "autoventa"): Promise<void>;
    /** BR3.4 — ¿la fecha dada cae en un período ya cerrado del vendedor? */
    isDateInClosedPeriod(vendorId: string, saleDate: Date): Promise<boolean>;
    /**
     * BR4.5/NFR6.3 — job diario (no solo mensual) que evalúa la condición de
     * estado "¿existe un período vigente cuyo mes ya terminó?" — idempotente,
     * se auto-recupera de un reinicio perdido en la ventana exacta de fin de mes.
     */
    closeOverduePeriods(): Promise<{
        periodsClosedCount: number;
        periodsCreatedCount: number;
    }>;
    private budgetProgress;
    private findVendorOrThrow;
}
