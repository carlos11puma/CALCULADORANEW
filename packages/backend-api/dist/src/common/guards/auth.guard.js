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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const public_decorator_1 = require("../decorators/public.decorator");
/**
 * Guard de autenticación global (security-design.md § guard de autenticación,
 * cierra R-02). Resuelve el token del header Authorization: Bearer y ejecuta
 * una sola consulta Prisma con include para traer Session + User relacionado
 * en un solo round-trip; rechaza con 401 si no existe, si revokedAt no es
 * nulo, o si User.active=false — en una sola consulta (NFR3.10/NFR3.11).
 */
let AuthGuard = class AuthGuard {
    prisma;
    reflector;
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request.headers?.authorization);
        if (!token) {
            throw new common_1.UnauthorizedException({ code: "UNAUTHORIZED", message: "Falta el token de sesión" });
        }
        const session = (await this.prisma.session.findUnique({
            where: { token },
            include: { user: { include: { vendor: true } } },
        }));
        if (!session || session.revokedAt || !session.user.active) {
            throw new common_1.UnauthorizedException({ code: "UNAUTHORIZED", message: "Sesión inválida o revocada" });
        }
        request.user = {
            userId: session.userId,
            role: session.user.role,
            vendorId: session.user.vendor?.id ?? null,
        };
        return true;
    }
    extractToken(authorizationHeader) {
        if (!authorizationHeader)
            return null;
        const [type, token] = authorizationHeader.split(" ");
        return type === "Bearer" && token ? token : null;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], AuthGuard);
