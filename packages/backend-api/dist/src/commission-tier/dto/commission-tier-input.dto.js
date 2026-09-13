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
exports.ReplaceTiersDto = exports.CommissionTierInputDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CommissionTierInputDto {
    channel;
    tierType;
    order;
    thresholdValue;
    commissionRate;
}
exports.CommissionTierInputDto = CommissionTierInputDto;
__decorate([
    (0, class_validator_1.IsIn)(["preventa", "autoventa"]),
    __metadata("design:type", String)
], CommissionTierInputDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["por_devolucion", "por_efectividad"]),
    __metadata("design:type", String)
], CommissionTierInputDto.prototype, "tierType", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CommissionTierInputDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CommissionTierInputDto.prototype, "thresholdValue", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CommissionTierInputDto.prototype, "commissionRate", void 0);
class ReplaceTiersDto {
    tiers;
}
exports.ReplaceTiersDto = ReplaceTiersDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CommissionTierInputDto),
    __metadata("design:type", Array)
], ReplaceTiersDto.prototype, "tiers", void 0);
