import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { randomUUID } from "crypto";

/**
 * Interceptor de logging estructurado global (observability-design.md).
 * Emite JSON a stdout con timestamp, method, path, userId, statusCode,
 * durationMs y correlationId — nunca serializa el body completo (NFR3.13,
 * evita loguear password/pin por accidente).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const correlationId = randomUUID();
    request.correlationId = correlationId;
    response.setHeader?.("X-Correlation-Id", correlationId);

    const startedAt = Date.now();
    const { method, url } = request;

    return next.handle().pipe(
      tap({
        next: () => this.emit(correlationId, method, url, request, response.statusCode, startedAt),
        error: (err) =>
          this.emit(correlationId, method, url, request, err?.status ?? 500, startedAt, err?.response?.code),
      }),
    );
  }

  private emit(
    correlationId: string,
    method: string,
    path: string,
    request: Record<string, any>,
    statusCode: number,
    startedAt: number,
    errorCode?: string,
  ): void {
    const entry = {
      timestamp: new Date().toISOString(),
      correlationId,
      method,
      path,
      userId: request.user?.userId ?? null,
      statusCode,
      durationMs: Date.now() - startedAt,
      ...(errorCode ? { errorCode } : {}),
    };
    this.logger.log(JSON.stringify(entry));
  }
}
