import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";
import { ThrottlerException } from "@nestjs/throttler";

/**
 * ExceptionFilter global — traduce cualquier excepción a la forma de error
 * uniforme del contrato (contract-summary.md § Formato de error uniforme).
 * Complementa a LoggingInterceptor: nunca incluye credenciales en el log.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = this.buildErrorBody(exception, status);

    if (status >= 500) {
      this.logger.error(JSON.stringify({ code: body.code, message: body.message }), (exception as Error)?.stack);
    }

    response.status(status).json(body);
  }

  private buildErrorBody(exception: unknown, status: number): { code: string; message: string; details?: unknown } {
    if (exception instanceof ThrottlerException) {
      try {
        return JSON.parse(exception.message);
      } catch {
        return { code: "TOO_MANY_ATTEMPTS", message: "Demasiados intentos" };
      }
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === "object" && response !== null && "code" in response) {
        return response as { code: string; message: string; details?: unknown };
      }
      if (typeof response === "object" && response !== null && "message" in response) {
        const message = (response as { message: unknown }).message;
        return {
          code: this.codeForStatus(status),
          message: Array.isArray(message) ? message.join("; ") : String(message),
        };
      }
      return { code: this.codeForStatus(status), message: exception.message };
    }

    return { code: "INTERNAL_ERROR", message: "Error interno del servidor" };
  }

  private codeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "VALIDATION_ERROR";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      default:
        return "INTERNAL_ERROR";
    }
  }
}
