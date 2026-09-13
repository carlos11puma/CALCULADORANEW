import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
/**
 * Guard de autenticación global (security-design.md § guard de autenticación,
 * cierra R-02). Resuelve el token del header Authorization: Bearer y ejecuta
 * una sola consulta Prisma con include para traer Session + User relacionado
 * en un solo round-trip; rechaza con 401 si no existe, si revokedAt no es
 * nulo, o si User.active=false — en una sola consulta (NFR3.10/NFR3.11).
 */
export declare class AuthGuard implements CanActivate {
    private readonly prisma;
    private readonly reflector;
    constructor(prisma: PrismaService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
}
