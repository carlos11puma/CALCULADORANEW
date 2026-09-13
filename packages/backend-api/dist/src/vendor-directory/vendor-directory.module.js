"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectoryModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const commission_ledger_module_1 = require("../commission-ledger/commission-ledger.module");
const vendor_directory_controller_1 = require("./vendor-directory.controller");
const vendor_directory_repository_1 = require("./vendor-directory.repository");
const vendor_directory_service_1 = require("./vendor-directory.service");
let VendorDirectoryModule = class VendorDirectoryModule {
};
exports.VendorDirectoryModule = VendorDirectoryModule;
exports.VendorDirectoryModule = VendorDirectoryModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, commission_ledger_module_1.CommissionLedgerModule],
        controllers: [vendor_directory_controller_1.VendorDirectoryController],
        providers: [vendor_directory_service_1.VendorDirectoryService, vendor_directory_repository_1.VendorDirectoryRepository],
        exports: [vendor_directory_repository_1.VendorDirectoryRepository],
    })
], VendorDirectoryModule);
