"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CommissionLedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionLedgerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const commission_tier_service_1 = require("../commission-tier/commission-tier.service");
const notification_service_1 = require("../notification/notification.service");
const prisma_service_1 = require("../prisma/prisma.service");
const commission_ledger_repository_1 = require("./commission-ledger.repository");
const TIER_TYPE_BY_CHANNEL = {
    preventa: "por_devolucion",
    autoventa: "por_efectividad",
};
/**
 * CommissionLedgerComponent — BR4.1-BR4.5 (cálculo y cierre), BR6.1
 * (historial), BR8.1 (indicador de devolución). W8, W9, W10.
 */
let CommissionLedgerService = CommissionLedgerService_1 = class CommissionLedgerService {
    repository;
    prisma;
    tierService;
    notificationService;
    logger = new common_1.Logger(CommissionLedgerService_1.name);
    constructor(repository, prisma, tierService, notificationService) {
        this.repository = repository;
        this.prisma = prisma;
        this.tierService = tierService;
        this.notificationService = notificationService;
    }
    /** W8: resuelve (o crea al vuelo) el período vigente del vendedor. */
    async getCurrentPeriod(vendorId) {
        let period = await this.repository.findCurrentPeriod(vendorId);
        if (!period) {
            period = await this.repository.createEmptyPeriod(vendorId, (0, commission_ledger_repository_1.currentMonth)());
        }
        const vendor = await this.findVendorOrThrow(vendorId);
        return { ...period, budgetProgress: this.budgetProgress(period, vendor) };
    }
    /** BR6.1 — historial: solo períodos cerrados, más recientes primero. */
    getHistory(vendorId, limit) {
        return this.repository.findHistory(vendorId, limit);
    }
    /** BR4.4 — recálculo completo (nunca incremental) del período vigente de un vendedor. */
    async recalculateForVendor(vendorId) {
        const vendor = await this.findVendorOrThrow(vendorId);
        let period = await this.repository.findCurrentPeriod(vendorId);
        const month = (0, commission_ledger_repository_1.currentMonth)();
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
        return { ...updated, budgetProgress: this.budgetProgress(updated, vendor) };
    }
    /** W5 paso 4 — cambio de tramos de un canal dispara BR4.4 para cada Vendor de ese canal. */
    async recalculateAllForChannel(channel) {
        const vendors = await this.repository.findVendorsByChannel(channel);
        for (const vendor of vendors) {
            await this.recalculateForVendor(vendor.id);
        }
    }
    /** BR3.4 — ¿la fecha dada cae en un período ya cerrado del vendedor? */
    async isDateInClosedPeriod(vendorId, saleDate) {
        const periodMonth = `${saleDate.getUTCFullYear()}-${String(saleDate.getUTCMonth() + 1).padStart(2, "0")}`;
        const period = await this.repository.findByVendorAndMonth(vendorId, periodMonth);
        return Boolean(period?.closed);
    }
    /**
     * BR4.5/NFR6.3 — job diario (no solo mensual) que evalúa la condición de
     * estado "¿existe un período vigente cuyo mes ya terminó?" — idempotente,
     * se auto-recupera de un reinicio perdido en la ventana exacta de fin de mes.
     */
    async closeOverduePeriods() {
        const startedAt = Date.now();
        const month = (0, commission_ledger_repository_1.currentMonth)();
        const vendors = await this.repository.findActiveVendors();
        let periodsClosedCount = 0;
        let periodsCreatedCount = 0;
        for (const vendor of vendors) {
            const period = await this.repository.findCurrentPeriod(vendor.id);
            if (period && period.periodMonth < month) {
                await this.repository.closeDailySalesForMonth(vendor.id, period.periodMonth);
                await this.repository.closePeriod(period.id);
                periodsClosedCount += 1;
                const following = (0, commission_ledger_repository_1.nextMonth)(period.periodMonth);
                const existingNext = await this.repository.findByVendorAndMonth(vendor.id, following);
                if (!existingNext) {
                    await this.repository.createEmptyPeriod(vendor.id, following);
                    periodsCreatedCount += 1;
                }
            }
            else if (!period) {
                await this.repository.createEmptyPeriod(vendor.id, month);
                periodsCreatedCount += 1;
            }
        }
        this.logger.log(JSON.stringify({
            event: "monthly-close",
            startedAt: new Date(startedAt).toISOString(),
            periodsClosedCount,
            periodsCreatedCount,
            durationMs: Date.now() - startedAt,
        }));
        return { periodsClosedCount, periodsCreatedCount };
    }
    budgetProgress(period, vendor) {
        return (Number(period.accumulatedSales) / Number(vendor.budget)) * 100;
    }
    async findVendorOrThrow(vendorId) {
        const vendor = await this.prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
        return vendor;
    }
};
exports.CommissionLedgerService = CommissionLedgerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommissionLedgerService.prototype, "closeOverduePeriods", null);
exports.CommissionLedgerService = CommissionLedgerService = CommissionLedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => commission_tier_service_1.CommissionTierService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [commission_ledger_repository_1.CommissionLedgerRepository,
        prisma_service_1.PrismaService,
        commission_tier_service_1.CommissionTierService,
        notification_service_1.NotificationService])
], CommissionLedgerService);
