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
exports.CommissionTierService = void 0;
const common_1 = require("@nestjs/common");
const commission_tier_repository_1 = require("./commission-tier.repository");
const EXPECTED_TIER_TYPE = {
    preventa: "por_devolucion",
    autoventa: "por_efectividad",
};
/**
 * CommissionTierComponent — resolución del tramo aplicable (BR4.1, BR4.2) y
 * determinación de "en orden" (ADR-003). Tramos ordenados por `order`
 * ascendente = de mejor a peor beneficio; "en orden" significa que
 * commissionRate no aumenta a medida que `order` crece (el tramo 1 es el de
 * mejor tasa) — decisión de Code Generation para hacer operativo ADR-003,
 * documentada aquí porque `rules.md`/`entities.md` no fijan la métrica exacta.
 */
let CommissionTierService = class CommissionTierService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getTiers(channel) {
        const tiers = await this.repository.findByChannel(channel);
        return { tiers, inOrder: this.isInOrder(tiers) };
    }
    async replaceTiers(channel, tiers) {
        for (const tier of tiers) {
            if (tier.channel !== channel) {
                throw new common_1.BadRequestException({
                    code: "VALIDATION_ERROR",
                    message: "Todos los tramos del lote deben pertenecer al mismo canal",
                });
            }
            if (tier.tierType !== EXPECTED_TIER_TYPE[channel]) {
                throw new common_1.BadRequestException({
                    code: "VALIDATION_ERROR",
                    message: `tierType debe ser ${EXPECTED_TIER_TYPE[channel]} para el canal ${channel}`,
                });
            }
        }
        const saved = await this.repository.replaceChannel(channel, tiers);
        const inOrder = this.isInOrder(saved);
        return { tiers: saved, inOrder, warning: inOrder ? null : "TIER_ORDER_WARNING" };
    }
    /** BR4.2: el tramo aplicable es el de mejor beneficio cuyo umbral la métrica vigente satisface. */
    resolveApplicableTier(tiers, tierType, metric) {
        const sorted = [...tiers].filter((t) => t.tierType === tierType).sort((a, b) => a.order - b.order);
        for (const tier of sorted) {
            const threshold = Number(tier.thresholdValue);
            if (tierType === "por_efectividad" && metric >= threshold) {
                return tier;
            }
            if (tierType === "por_devolucion" && metric < threshold) {
                return tier;
            }
        }
        return null;
    }
    /** ADR-003: tramos ordenados de mejor a peor beneficio (commissionRate no creciente conforme `order` crece). */
    isInOrder(tiers) {
        if (tiers.length <= 1)
            return true;
        const sorted = [...tiers].sort((a, b) => a.order - b.order);
        for (let i = 1; i < sorted.length; i++) {
            if (Number(sorted[i].commissionRate) > Number(sorted[i - 1].commissionRate)) {
                return false;
            }
        }
        return true;
    }
    /** Tramo inmediatamente mejor que el tramo aplicable actual (para BR8.3 earningOpportunity). */
    findNextBetterTier(tiers, tierType, currentTier) {
        const sorted = [...tiers].filter((t) => t.tierType === tierType).sort((a, b) => a.order - b.order);
        if (sorted.length === 0)
            return null;
        if (!currentTier)
            return sorted[0] ?? null;
        const currentIndex = sorted.findIndex((t) => t.id === currentTier.id);
        if (currentIndex <= 0)
            return null; // ya está en el mejor tramo
        return sorted[currentIndex - 1];
    }
};
exports.CommissionTierService = CommissionTierService;
exports.CommissionTierService = CommissionTierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [commission_tier_repository_1.CommissionTierRepository])
], CommissionTierService);
