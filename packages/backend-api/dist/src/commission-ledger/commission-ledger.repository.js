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
exports.CommissionLedgerRepository = void 0;
exports.monthRange = monthRange;
exports.nextMonth = nextMonth;
exports.currentMonth = currentMonth;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommissionLedgerRepository = class CommissionLedgerRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findCurrentPeriod(vendorId) {
        return this.prisma.commissionPeriod.findFirst({ where: { vendorId, closed: false } });
    }
    findByVendorAndMonth(vendorId, periodMonth) {
        return this.prisma.commissionPeriod.findUnique({ where: { vendorId_periodMonth: { vendorId, periodMonth } } });
    }
    createEmptyPeriod(vendorId, periodMonth) {
        return this.prisma.commissionPeriod.create({ data: { vendorId, periodMonth } });
    }
    updatePeriod(id, data) {
        return this.prisma.commissionPeriod.update({ where: { id }, data });
    }
    closePeriod(id) {
        return this.prisma.commissionPeriod.update({ where: { id }, data: { closed: true, closedAt: new Date() } });
    }
    findHistory(vendorId, limit) {
        return this.prisma.commissionPeriod.findMany({
            where: { vendorId, closed: true },
            orderBy: { periodMonth: "desc" },
            ...(limit ? { take: limit } : {}),
        });
    }
    sumSalesForMonth(vendorId, periodMonth) {
        const [start, end] = monthRange(periodMonth);
        return this.prisma.dailySale
            .aggregate({
            where: { vendorId, saleDate: { gte: start, lt: end } },
            _sum: { amount: true, returns: true },
        })
            .then((r) => ({ amount: r._sum.amount, returns: r._sum.returns }));
    }
    closeDailySalesForMonth(vendorId, periodMonth) {
        const [start, end] = monthRange(periodMonth);
        return this.prisma.dailySale.updateMany({
            where: { vendorId, saleDate: { gte: start, lt: end } },
            data: { closed: true },
        });
    }
    findActiveVendors() {
        return this.prisma.vendor.findMany({ where: { active: true }, select: { id: true } });
    }
    findVendorsByChannel(channel) {
        return this.prisma.vendor.findMany({ where: { channel, active: true }, select: { id: true } });
    }
};
exports.CommissionLedgerRepository = CommissionLedgerRepository;
exports.CommissionLedgerRepository = CommissionLedgerRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionLedgerRepository);
/** Rango [inicio, fin) de un mes en formato AAAA-MM, en UTC. */
function monthRange(periodMonth) {
    const [year, month] = periodMonth.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1));
    return [start, end];
}
/** Mes siguiente en formato AAAA-MM. */
function nextMonth(periodMonth) {
    const [year, month] = periodMonth.split("-").map(Number);
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthNum = month === 12 ? 1 : month + 1;
    return `${nextYear}-${String(nextMonthNum).padStart(2, "0")}`;
}
/** Mes vigente en formato AAAA-MM, en UTC. */
function currentMonth() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
