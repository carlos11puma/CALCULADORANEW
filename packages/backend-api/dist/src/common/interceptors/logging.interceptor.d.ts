import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
/**
 * Interceptor de logging estructurado global (observability-design.md).
 * Emite JSON a stdout con timestamp, method, path, userId, statusCode,
 * durationMs y correlationId — nunca serializa el body completo (NFR3.13,
 * evita loguear password/pin por accidente).
 */
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private emit;
}
