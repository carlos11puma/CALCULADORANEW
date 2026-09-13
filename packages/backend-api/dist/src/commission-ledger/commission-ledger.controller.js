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
exports.CommissionLedgerController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const commission_ledger_service_1 = require("./commission-ledger.service");
let CommissionLedgerController = class CommissionLedgerController {
    commissionLedgerService;
    constructor(commissionLedgerService) {
        this.commissionLedgerService = commissionLedgerService;
    }
    getCurrent(user) {
        return this.commissionLedgerService.getCurrentPeriod(user.vendorId ?? "");
    }
    getHistory(user, limit) {
        const parsedLimit = limit ? parseInt(limit, 10) : undefined;
        return this.commissionLedgerService.getHistory(user.vendorId ?? "", parsedLimit);
    }
};
exports.CommissionLedgerController = CommissionLedgerController;
__decorate([
    (0, common_1.Get)("current"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommissionLedgerController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Get)("history"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommissionLedgerController.prototype, "getHistory", null);
exports.CommissionLedgerController = CommissionLedgerController = __decorate([
    (0, common_1.Controller)("commission"),
    __metadata("design:paramtypes", [commission_ledger_service_1.CommissionLedgerService])
], CommissionLedgerController);
