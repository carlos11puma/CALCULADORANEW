import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CommissionPeriod, Vendor } from "@prisma/client";
import { CommissionTierService } from "../commission-tier/commission-tier.service";
import { NotificationService } from "../notification/notification.service";
import { PrismaService } from "../prisma/prisma.service";
import { CommissionLedgerRepository, currentMonth, nextMonth } from "./commission-ledger.repository";

export interface CommissionPeriodView extends CommissionPeriod {
  budgetProgress: number;
}

const TIER_TYPE_BY_CHANNEL: Record<"preventa" | "autoventa", "por_devolucion" | "por_efectividad"> = {
  preventa: "por_devolucion",
  autoventa: "por_efectividad",
};

/**
 * CommissionLedgerComponent — BR4.1-BR4.5 (cálculo y cierre), BR6.1
 * (historial), BR8.1 (indicador de devolución). W8, W9, W10.
 */
@Injectable()
export class CommissionLedgerService {
  private readonly logger = new Logger(CommissionLedgerService.name);

  constructor(
    private readonly repository: CommissionLedgerRepository,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => CommissionTierService))
    private readonly tierService: CommissionTierService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  /** W8: resuelve (o crea al vuelo) el período vigente del vendedor. */
  async getCurrentPeriod(vendorId: string): Promise<CommissionPeriodView> {
    let period = await this.repository.findCurrentPeriod(vendorId);
    if (!period) {
      period = await this.repository.createEmptyPeriod(vendorId, currentMonth());
    }
    const vendor = await this.findVendorOrThrow(vendorId);
    return this.toPeriodView(period, vendor);
  }

  /** BR6.1 — historial: solo períodos cerrados, más recientes primero. */
  async getHistory(vendorId: string, limit?: number): Promise<CommissionPeriod[]> {
    const periods = await this.repository.findHistory(vendorId, limit);
    // Fix (Deployment Execution, 260909, décimo hallazgo): ver toPeriodView() — sin esta
    // conversión, los campos Decimal llegan como string al cliente y crashean la app.
    return periods.map((period) => this.toNumericPeriod(period));
  }

  /** BR4.4 — recálculo completo (nunca incremental) del período vigente de un vendedor. */
  async recalculateForVendor(vendorId: string): Promise<CommissionPeriodView> {
    const vendor = await this.findVendorOrThrow(vendorId);
    let period = await this.repository.findCurrentPeriod(vendorId);
    const month = currentMonth();
    if (!period) {
      period = await this.repository.createEmptyPeriod(vendorId, month);
    }

    const sums = await this.repository.sumSalesForMonth(vendorId, period.periodMonth);
    const accumulatedSales = Number(sums.amount ?? 0);
    const accumulatedReturns = Number(sums.returns ?? 0);

    // BR8.1 — división por cero: returnRate = 0 cuando no hay venta acumulada.
    const returnRate = accumulatedSales === 0 ? 0 : accumulatedReturns / accumulatedSales;

    // BR4.1 — métrica según canal.
    const tierType = TIER_TYPE_BY_CHANNEL[vendor.channel];
    const metric = vendor.channel === "preventa" ? returnRate * 100 : (accumulatedSales / Number(vendor.budget)) * 100;

    const { tiers } = await this.tierService.getTiers(vendor.channel);
    const applicableTier = this.tierService.resolveApplicableTier(tiers, tierType, metric);

    // BR4.3 — comisión ganada = venta acumulada × tasa del tramo aplicable (0 si ningún tramo aplica).
    const commissionEarned = applicableTier ? accumulatedSales * Number(applicableTier.commissionRate) : 0;

    const updated = await this.repository.updatePeriod(period.id, {
      accumulatedSales,
      accumulatedReturns,
      returnRate,
      commissionEarned,
    });

    // W6/W7 paso de evaluación de umbrales (BR7.1/BR7.2, BR8.2/BR8.3) — efecto secundario, no bloqueante.
    await this.notificationService.evaluateSalesThresholds(vendor, updated);
    await this.notificationService.evaluateReturnThresholds(vendor, updated);

    return this.toPeriodView(updated, vendor);
  }

  /** W5 paso 4 — cambio de tramos de un canal dispara BR4.4 para cada Vendor de ese canal. */
  async recalculateAllForChannel(channel: "preventa" | "autoventa"): Promise<void> {
    const vendors = await this.repository.findVendorsByChannel(channel);
    for (const vendor of vendors) {
      await this.recalculateForVendor(vendor.id);
    }
  }

  /** BR3.4 — ¿la fecha dada cae en un período ya cerrado del vendedor? */
  async isDateInClosedPeriod(vendorId: string, saleDate: Date): Promise<boolean> {
    const periodMonth = `${saleDate.getUTCFullYear()}-${String(saleDate.getUTCMonth() + 1).padStart(2, "0")}`;
    const period = await this.repository.findByVendorAndMonth(vendorId, periodMonth);
    return Boolean(period?.closed);
  }

  /**
   * BR4.5/NFR6.3 — job diario (no solo mensual) que evalúa la condición de
   * estado "¿existe un período vigente cuyo mes ya terminó?" — idempotente,
   * se auto-recupera de un reinicio perdido en la ventana exacta de fin de mes.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async closeOverduePeriods(): Promise<{ periodsClosedCount: number; periodsCreatedCount: number }> {
    const startedAt = Date.now();
    const month = currentMonth();
    const vendors = await this.repository.findActiveVendors();
    let periodsClosedCount = 0;
    let periodsCreatedCount = 0;

    for (const vendor of vendors) {
      const period = await this.repository.findCurrentPeriod(vendor.id);
      if (period && period.periodMonth < month) {
        await this.repository.closeDailySalesForMonth(vendor.id, period.periodMonth);
        await this.repository.closePeriod(period.id);
        periodsClosedCount += 1;

        const following = nextMonth(period.periodMonth);
        const existingNext = await this.repository.findByVendorAndMonth(vendor.id, following);
        if (!existingNext) {
          await this.repository.createEmptyPeriod(vendor.id, following);
          periodsCreatedCount += 1;
        }
      } else if (!period) {
        await this.repository.createEmptyPeriod(vendor.id, month);
        periodsCreatedCount += 1;
      }
    }

    this.logger.log(
      JSON.stringify({
        event: "monthly-close",
        startedAt: new Date(startedAt).toISOString(),
        periodsClosedCount,
        periodsCreatedCount,
        durationMs: Date.now() - startedAt,
      }),
    );

    return { periodsClosedCount, periodsCreatedCount };
  }

  private budgetProgress(period: CommissionPeriod, vendor: Vendor): number {
    return (Number(period.accumulatedSales) / Number(vendor.budget)) * 100;
  }

  /**
   * Fix (Deployment Execution, 260909, décimo hallazgo): los campos `Decimal` de Prisma
   * (`accumulatedSales`, `accumulatedReturns`, `returnRate`, `commissionEarned`) son
   * instancias de `decimal.js`, no `number` — su `toJSON()` devuelve un STRING (ej.
   * `"0.00"`), así que sin esta conversión la respuesta HTTP manda esos campos como
   * texto. La app (`HomeScreen.tsx`/`HistoryScreen.tsx`) llama `.toFixed()` directamente
   * sobre ellos asumiendo que son `number`; sobre un string eso lanza
   * `TypeError: ... .toFixed is not a function` sin capturar, lo que crashea la app —
   * bug real detectado en el smoke test de Deployment Execution al loguear a Elizabeth
   * por primera vez contra datos reales (ningún test existente lo detectó porque los
   * fixtures de prueba usan `number` de JS directamente, nunca un `Prisma.Decimal` real
   * serializado a JSON).
   */
  private toNumericPeriod(period: CommissionPeriod): CommissionPeriod {
    return {
      ...period,
      accumulatedSales: Number(period.accumulatedSales) as unknown as CommissionPeriod["accumulatedSales"],
      accumulatedReturns: Number(period.accumulatedReturns) as unknown as CommissionPeriod["accumulatedReturns"],
      returnRate: Number(period.returnRate) as unknown as CommissionPeriod["returnRate"],
      commissionEarned: Number(period.commissionEarned) as unknown as CommissionPeriod["commissionEarned"],
    };
  }

  private toPeriodView(period: CommissionPeriod, vendor: Vendor): CommissionPeriodView {
    return { ...this.toNumericPeriod(period), budgetProgress: this.budgetProgress(period, vendor) };
  }

  private async findVendorOrThrow(vendorId: string): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
    return vendor;
  }
}
