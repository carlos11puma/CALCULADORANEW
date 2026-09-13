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
exports.VendorDirectoryService = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const commission_ledger_service_1 = require("../commission-ledger/commission-ledger.service");
const vendor_directory_repository_1 = require("./vendor-directory.repository");
/**
 * VendorDirectoryComponent — W4 (gestión de roster y presupuesto).
 * Ninguna credencial de login viene en el contrato de VendorInput (contract-summary.md
 * Contrato 2) — al crear un Vendor se genera un username único a partir del
 * nombre y una contraseña temporal aleatoria (hasheada, bcrypt costo 10);
 * no hay flujo de recuperación en este MVP (Q4 de functional-design-questions.md),
 * así que el supervisor comunica esa contraseña inicial fuera de banda.
 * Documentado como desviación explícita en el reporte de Code Generation.
 */
let VendorDirectoryService = class VendorDirectoryService {
    repository;
    commissionLedgerService;
    constructor(repository, commissionLedgerService) {
        this.repository = repository;
        this.commissionLedgerService = commissionLedgerService;
    }
    listAll() {
        return this.repository.findAll();
    }
    async create(input) {
        this.assertValidBudget(input.budget);
        const username = await this.generateUniqueUsername(input.name);
        const temporaryPassword = this.generateTemporaryPassword();
        const passwordHash = await auth_service_1.AuthService.hash(temporaryPassword);
        return this.repository.createVendorWithUser({
            username,
            passwordHash,
            route: input.route,
            name: input.name,
            channel: input.channel,
            budget: input.budget,
        });
    }
    async update(vendorId, input) {
        this.assertValidBudget(input.budget);
        const existing = await this.repository.findById(vendorId);
        if (!existing) {
            throw new common_1.NotFoundException({ code: "NOT_FOUND", message: "Vendedor no existe" });
        }
        const budgetChanged = Number(existing.budget) !== input.budget;
        const channelChanged = existing.channel !== input.channel;
        const updated = await this.repository.update(vendorId, input);
        // W4 paso 3 (ampliado por R-01 del reviewer): budget O channel cambiado dispara BR4.4.
        if (budgetChanged || channelChanged) {
            await this.commissionLedgerService.recalculateForVendor(vendorId);
        }
        return updated;
    }
    assertValidBudget(budget) {
        if (budget === undefined || budget === null || budget <= 0) {
            throw new common_1.BadRequestException({
                code: "VALIDATION_ERROR",
                message: "El presupuesto debe ser mayor a cero",
                details: [{ field: "budget", reason: "budget debe ser >= 0.01" }],
            });
        }
    }
    async generateUniqueUsername(name) {
        const base = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, ".")
            .replace(/^\.+|\.+$/g, "");
        const count = await this.repository.countUsernameLike(base);
        return count === 0 ? base : `${base}.${count + 1}`;
    }
    generateTemporaryPassword() {
        return Math.random().toString(36).slice(-10);
    }
};
exports.VendorDirectoryService = VendorDirectoryService;
exports.VendorDirectoryService = VendorDirectoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vendor_directory_repository_1.VendorDirectoryRepository,
        commission_ledger_service_1.CommissionLedgerService])
], VendorDirectoryService);
