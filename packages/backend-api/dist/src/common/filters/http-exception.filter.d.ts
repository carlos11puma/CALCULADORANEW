import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
/**
 * ExceptionFilter global — traduce cualquier excepción a la forma de error
 * uniforme del contrato (contract-summary.md § Formato de error uniforme).
 * Complementa a LoggingInterceptor: nunca incluye credenciales en el log.
 */
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
    private buildErrorBody;
    private codeForStatus;
}
