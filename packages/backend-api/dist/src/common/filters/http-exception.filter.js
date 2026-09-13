"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
/**
 * ExceptionFilter global — traduce cualquier excepción a la forma de error
 * uniforme del contrato (contract-summary.md § Formato de error uniforme).
 * Complementa a LoggingInterceptor: nunca incluye credenciales en el log.
 */
let HttpExceptionFilter = class HttpExceptionFilter {
    logger = new common_1.Logger("ExceptionFilter");
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const body = this.buildErrorBody(exception, status);
        if (status >= 500) {
            this.logger.error(JSON.stringify({ code: body.code, message: body.message }), exception?.stack);
        }
        response.status(status).json(body);
    }
    buildErrorBody(exception, status) {
        if (exception instanceof throttler_1.ThrottlerException) {
            try {
                return JSON.parse(exception.message);
            }
            catch {
                return { code: "TOO_MANY_ATTEMPTS", message: "Demasiados intentos" };
            }
        }
        if (exception instanceof common_1.HttpException) {
            const response = exception.getResponse();
            if (typeof response === "object" && response !== null && "code" in response) {
                return response;
            }
            if (typeof response === "object" && response !== null && "message" in response) {
                const message = response.message;
                return {
                    code: this.codeForStatus(status),
                    message: Array.isArray(message) ? message.join("; ") : String(message),
                };
            }
            return { code: this.codeForStatus(status), message: exception.message };
        }
        return { code: "INTERNAL_ERROR", message: "Error interno del servidor" };
    }
    codeForStatus(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return "VALIDATION_ERROR";
            case common_1.HttpStatus.UNAUTHORIZED:
                return "UNAUTHORIZED";
            case common_1.HttpStatus.FORBIDDEN:
                return "FORBIDDEN";
            case common_1.HttpStatus.NOT_FOUND:
                return "NOT_FOUND";
            case common_1.HttpStatus.CONFLICT:
                return "CONFLICT";
            default:
                return "INTERNAL_ERROR";
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
