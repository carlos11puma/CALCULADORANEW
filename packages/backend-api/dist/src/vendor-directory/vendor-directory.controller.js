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
exports.VendorDirectoryController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const vendor_input_dto_1 = require("./dto/vendor-input.dto");
const vendor_directory_service_1 = require("./vendor-directory.service");
let VendorDirectoryController = class VendorDirectoryController {
    vendorDirectoryService;
    constructor(vendorDirectoryService) {
        this.vendorDirectoryService = vendorDirectoryService;
    }
    list() {
        return this.vendorDirectoryService.listAll();
    }
    create(dto) {
        return this.vendorDirectoryService.create(dto);
    }
    update(vendorId, dto) {
        return this.vendorDirectoryService.update(vendorId, dto);
    }
};
exports.VendorDirectoryController = VendorDirectoryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VendorDirectoryController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vendor_input_dto_1.VendorInputDto]),
    __metadata("design:returntype", void 0)
], VendorDirectoryController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":vendorId"),
    __param(0, (0, common_1.Param)("vendorId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vendor_input_dto_1.VendorInputDto]),
    __metadata("design:returntype", void 0)
], VendorDirectoryController.prototype, "update", null);
exports.VendorDirectoryController = VendorDirectoryController = __decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("supervisor"),
    (0, common_1.Controller)("vendors"),
    __metadata("design:paramtypes", [vendor_directory_service_1.VendorDirectoryService])
], VendorDirectoryController);
