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
exports.VendorDirectoryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VendorDirectoryRepository = class VendorDirectoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.vendor.findMany({ orderBy: { name: "asc" } });
    }
    findById(id) {
        return this.prisma.vendor.findUnique({ where: { id } });
    }
    countUsernameLike(prefix) {
        return this.prisma.user.count({ where: { username: { startsWith: prefix } } });
    }
    async createVendorWithUser(input) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    role: "vendedor",
                    username: input.username,
                    passwordHash: input.passwordHash,
                    active: true,
                },
            });
            return tx.vendor.create({
                data: {
                    userId: user.id,
                    route: input.route,
                    name: input.name,
                    channel: input.channel,
                    budget: input.budget,
                    active: true,
                },
            });
        });
    }
    update(id, input) {
        return this.prisma.vendor.update({ where: { id }, data: input });
    }
};
exports.VendorDirectoryRepository = VendorDirectoryRepository;
exports.VendorDirectoryRepository = VendorDirectoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorDirectoryRepository);
