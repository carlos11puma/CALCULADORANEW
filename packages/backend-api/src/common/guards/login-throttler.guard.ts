import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";

/**
 * Guard dedicado de rate limiting de login (security-design.md § rate
 * limiting de login, cierra R-01): 5 intentos/min por combinación
 * (IP, identificador de credencial) — más estricto que el límite global.
 * Solo se aplica a los dos endpoints de login.
 */
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const credential = req.body?.username ?? req.body?.pin ?? "anonymous";
    return `${req.ip}:${credential}`;
  }

  protected async throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new ThrottlerException(
      JSON.stringify({ code: "TOO_MANY_ATTEMPTS", message: "Demasiados intentos — intente de nuevo más tarde" }),
    );
  }
}
