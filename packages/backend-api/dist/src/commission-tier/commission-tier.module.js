"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionTierModule = void 0;
const common_1 = require("@nestjs/common");
const commission_tier_controller_1 = require("./commission-tier.controller");
const commission_tier_repository_1 = require("./commission-tier.repository");
const commission_tier_service_1 = require("./commission-tier.service");
const commission_ledger_module_1 = require("../commission-ledger/commission-ledger.module");
let CommissionTierModule = class CommissionTierModule {
};
exports.CommissionTierModule = CommissionTierModule;
exports.CommissionTierModule = CommissionTierModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => commission_ledger_module_1.CommissionLedgerModule)],
        controllers: [commission_tier_controller_1.CommissionTierController],
        providers: [commission_tier_service_1.CommissionTierService, commission_tier_repository_1.CommissionTierRepository],
        exports: [commission_tier_service_1.CommissionTierService, commission_tier_repository_1.CommissionTierRepository],
    })
], CommissionTierModule);
