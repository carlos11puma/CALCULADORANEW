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
exports.SalesEntryService = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const commission_ledger_service_1 = require("../commission-ledger/commission-ledger.service");
const sales_entry_repository_1 = require("./sales-entry.repository");
const daily_sale_input_dto_1 = require("./dto/daily-sale-input.dto");
/**
 * SalesEntryComponent — W6 (registrar/corregir venta del día, con conexión)
 * y W7 (sincronizar lote offline). BR3.4 (período cerrado), BR3.5 (última
 * escritura gana, sin detección de conflicto — también cubre el cruce W6
 * vs. W7 sobre la misma fecha, R-02 de functional-spec.md).
 */
let SalesEntryService = class SalesEntryService {
    repository;
    commissionLedgerService;
    constructor(repository, commissionLedgerService) {
        this.repository = repository;
        this.commissionLedgerService = commissionLedgerService;
    }
    /** W6 — registrar o corregir la venta del día, con conexión. */
    async recordSale(vendorId, dto) {
        const saleDate = new Date(`${dto.saleDate}T00:00:00.000Z`);
        if (await this.commissionLedgerService.isDateInClosedPeriod(vendorId, saleDate)) {
            throw new common_1.ConflictException({ code: "PERIOD_CLOSED", message: "El período de esa fecha ya cerró" });
        }
        const existing = await this.repository.findByVendorAndDate(vendorId, saleDate);
        if (existing?.closed) {
            throw new common_1.ConflictException({ code: "DAY_CLOSED", message: "El día ya cerró; el valor quedó fijo" });
        }
        const saved = existing
            ? await this.repository.update(existing.id, dto.amount, dto.returns)
            : await this.repository.create(vendorId, saleDate, dto.amount, dto.returns);
        // W6 paso 6/7 — recálculo completo (BR4.4) + evaluación de umbrales (BR7.1/BR7.2, BR8.2/BR8.3).
        await this.commissionLedgerService.recalculateForVendor(vendorId);
        return saved;
    }
    /** W7 — sincronizar un lote de ventas guardadas offline, cada una de un día distinto. */
    async syncBatch(vendorId, rawItems) {
        const results = [];
        let anyApplied = false;
        for (const raw of rawItems) {
            // W7 paso 2a — validación de forma por ítem (BR3.1); un ítem inválido se
            // marca rejected sin bloquear el resto del lote.
            const item = (0, class_transformer_1.plainToInstance)(daily_sale_input_dto_1.DailySaleInputDto, raw);
            const errors = await (0, class_validator_1.validate)(item);
            if (errors.length > 0) {
                const saleDateRaw = typeof raw?.saleDate === "string" ? raw.saleDate : "";
                results.push({
                    saleDate: saleDateRaw,
                    status: "rejected",
                    error: { code: "VALIDATION_ERROR", message: "monto o devoluciones inválidos" },
                });
                continue;
            }
            const saleDate = new Date(`${item.saleDate}T00:00:00.000Z`);
            if (await this.commissionLedgerService.isDateInClosedPeriod(vendorId, saleDate)) {
                results.push({ saleDate: item.saleDate, status: "rejected", error: { code: "PERIOD_CLOSED", message: "El período de esa fecha ya cerró" } });
                continue;
            }
            const existing = await this.repository.findByVendorAndDate(vendorId, saleDate);
            if (existing?.closed) {
                results.push({ saleDate: item.saleDate, status: "rejected", error: { code: "DAY_CLOSED", message: "El día ya cerró" } });
                continue;
            }
            // BR3.5 — la sincronización más reciente sobrescribe, sin detección de conflicto.
            if (existing) {
                await this.repository.update(existing.id, item.amount, item.returns);
            }
            else {
                await this.repository.create(vendorId, saleDate, item.amount, item.returns);
            }
            results.push({ saleDate: item.saleDate, status: "applied" });
            anyApplied = true;
        }
        // W7 paso 3 — un solo recálculo por vendedor, no uno por ítem.
        if (anyApplied) {
            await this.commissionLedgerService.recalculateForVendor(vendorId);
        }
        return results;
    }
};
exports.SalesEntryService = SalesEntryService;
exports.SalesEntryService = SalesEntryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sales_entry_repository_1.SalesEntryRepository,
        commission_ledger_service_1.CommissionLedgerService])
], SalesEntryService);
