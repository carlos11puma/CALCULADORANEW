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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionTierController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const commission_tier_service_1 = require("./commission-tier.service");
const commission_tier_input_dto_1 = require("./dto/commission-tier-input.dto");
const commission_ledger_service_1 = require("../commission-ledger/commission-ledger.service");
let CommissionTierController = class CommissionTierController {
    tierService;
    ledgerService;
    constructor(tierService, ledgerService) {
        this.tierService = tierService;
        this.ledgerService = ledgerService;
    }
    async list(channel) {
        const resolved = channel ?? "preventa";
        return this.tierService.getTiers(resolved);
    }
    async replace(dto) {
        const channel = dto.tiers[0]?.channel;
        if (!channel) {
            return { tiers: [], inOrder: true, warning: null };
        }
        const result = await this.tierService.replaceTiers(channel, dto.tiers);
        // W5 paso 4: cambio de tramos dispara BR4.4 (recálculo completo) para cada Vendor del canal.
        await this.ledgerService.recalculateAllForChannel(channel);
        return result;
    }
};
exports.CommissionTierController = CommissionTierController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("channel")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommissionTierController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("supervisor"),
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commission_tier_input_dto_1.ReplaceTiersDto]),
    __metadata("design:returntype", Promise)
], CommissionTierController.prototype, "replace", null);
exports.CommissionTierController = CommissionTierController = __decorate([
    (0, common_1.Controller)("tiers"),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => commission_ledger_service_1.CommissionLedgerService))),
    __metadata("design:paramtypes", [commission_tier_service_1.CommissionTierService,
        commission_ledger_service_1.CommissionLedgerService])
], CommissionTierController);
