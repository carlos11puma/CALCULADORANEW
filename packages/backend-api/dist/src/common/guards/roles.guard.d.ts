import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
/**
 * Autorización por rol (security-design.md § autorización por rol) — lee
 * request.user.role, ya resuelto por AuthGuard, nunca de un campo del body
 * o header (NFR3.11).
 */
export declare class RolesGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
