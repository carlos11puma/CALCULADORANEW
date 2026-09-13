import { ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";
/**
 * Guard dedicado de rate limiting de login (security-design.md § rate
 * limiting de login, cierra R-01): 5 intentos/min por combinación
 * (IP, identificador de credencial) — más estricto que el límite global.
 * Solo se aplica a los dos endpoints de login.
 */
export declare class LoginThrottlerGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string>;
    protected throwThrottlingException(_context: ExecutionContext, _throttlerLimitDetail: ThrottlerLimitDetail): Promise<void>;
}
