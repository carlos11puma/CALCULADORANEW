"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionLedgerModule = void 0;
const common_1 = require("@nestjs/common");
const commission_tier_module_1 = require("../commission-tier/commission-tier.module");
const notification_module_1 = require("../notification/notification.module");
const commission_ledger_controller_1 = require("./commission-ledger.controller");
const commission_ledger_repository_1 = require("./commission-ledger.repository");
const commission_ledger_service_1 = require("./commission-ledger.service");
let CommissionLedgerModule = class CommissionLedgerModule {
};
exports.CommissionLedgerModule = CommissionLedgerModule;
exports.CommissionLedgerModule = CommissionLedgerModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => commission_tier_module_1.CommissionTierModule), (0, common_1.forwardRef)(() => notification_module_1.NotificationModule)],
        controllers: [commission_ledger_controller_1.CommissionLedgerController],
        providers: [commission_ledger_service_1.CommissionLedgerService, commission_ledger_repository_1.CommissionLedgerRepository],
        exports: [commission_ledger_service_1.CommissionLedgerService],
    })
], CommissionLedgerModule);
