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
exports.SalesEntryController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const daily_sale_input_dto_1 = require("./dto/daily-sale-input.dto");
const sales_entry_service_1 = require("./sales-entry.service");
let SalesEntryController = class SalesEntryController {
    salesEntryService;
    constructor(salesEntryService) {
        this.salesEntryService = salesEntryService;
    }
    recordSale(user, dto) {
        return this.salesEntryService.recordSale(user.vendorId ?? "", dto);
    }
    // Body intencionalmente sin decorar con class-validator: W7 exige que un
    // ítem inválido del lote se marque `status=rejected` y el resto del lote
    // continúe procesándose (BR3.1 por ítem) — el ValidationPipe global
    // rechazaría toda la petición ante el primer ítem inválido, lo cual
    // violaría ese contrato. La validación por ítem ocurre en el servicio.
    syncSales(user, items) {
        return this.salesEntryService.syncBatch(user.vendorId ?? "", items);
    }
};
exports.SalesEntryController = SalesEntryController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, daily_sale_input_dto_1.DailySaleInputDto]),
    __metadata("design:returntype", void 0)
], SalesEntryController.prototype, "recordSale", null);
__decorate([
    (0, common_1.Post)("sync"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", void 0)
], SalesEntryController.prototype, "syncSales", null);
exports.SalesEntryController = SalesEntryController = __decorate([
    (0, common_1.Controller)("sales"),
    __metadata("design:paramtypes", [sales_entry_service_1.SalesEntryService])
], SalesEntryController);
