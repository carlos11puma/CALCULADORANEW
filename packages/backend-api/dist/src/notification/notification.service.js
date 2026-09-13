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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.RETURN_THRESHOLDS = exports.SALES_THRESHOLDS = void 0;
const common_1 = require("@nestjs/common");
const commission_tier_service_1 = require("../commission-tier/commission-tier.service");
const notification_repository_1 = require("./notification.repository");
exports.SALES_THRESHOLDS = [95, 97, 100, 103, 105, 110];
exports.RETURN_THRESHOLDS = [8.5, 8, 7.5, 7, 6, 5];
/**
 * NotificationComponent — BR7.1/BR7.2 (umbral de venta), BR8.2/BR8.3
 * (umbral de devolución + oportunidad de ganancia), BR9.2 (resolución de
 * destinatarios de notificación manual). W11, W12, W13.
 */
let NotificationService = class NotificationService {
    repository;
    tierService;
    constructor(repository, tierService) {
        this.repository = repository;
        this.tierService = tierService;
    }
    listForVendor(vendorId) {
        return this.repository.findByVendor(vendorId);
    }
    /** BR7.1/BR7.2 — umbral de venta/presupuesto: cruce hacia arriba, sin reenvío. */
    async evaluateSalesThresholds(vendor, period) {
        const budgetProgress = (Number(period.accumulatedSales) / Number(vendor.budget)) * 100;
        const created = [];
        for (const threshold of exports.SALES_THRESHOLDS) {
            if (budgetProgress < threshold)
                continue;
            const existing = await this.repository.existsForPeriod(vendor.id, "umbral_venta", threshold, period.periodMonth);
            if (existing)
                continue;
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
    async evaluateReturnThresholds(vendor, period) {
        const returnRatePct = Number(period.returnRate) * 100;
        const created = [];
        const { tiers, inOrder } = await this.tierService.getTiers(vendor.channel);
        const applicableTier = this.tierService.resolveApplicableTier(tiers, "por_devolucion", returnRatePct);
        for (const threshold of exports.RETURN_THRESHOLDS) {
            if (returnRatePct >= threshold)
                continue;
            const existing = await this.repository.existsForPeriod(vendor.id, "umbral_devolucion", threshold, period.periodMonth);
            if (existing)
                continue;
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
    buildEarningOpportunity(tiers, currentTier, period) {
        const nextTier = this.tierService.findNextBetterTier(tiers, "por_devolucion", currentTier);
        if (!nextTier)
            return undefined;
        const currentRate = currentTier ? Number(currentTier.commissionRate) : 0;
        const potentialGain = (Number(nextTier.commissionRate) - currentRate) * Number(period.accumulatedSales);
        return {
            nextTierThreshold: Number(nextTier.thresholdValue),
            potentialGain,
        };
    }
    /** BR9.2 — resolución de destinatarios de notificación manual (W13). */
    async sendManual(message, recipients) {
        if (!message.trim()) {
            throw new common_1.BadRequestException({ code: "VALIDATION_ERROR", message: "El mensaje no puede estar vacío" });
        }
        if (Array.isArray(recipients) && recipients.length === 0) {
            throw new common_1.BadRequestException({ code: "VALIDATION_ERROR", message: "La lista de destinatarios no puede estar vacía" });
        }
        const vendors = recipients === "all"
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_repository_1.NotificationRepository,
        commission_tier_service_1.CommissionTierService])
], NotificationService);
