"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const crypto_1 = require("crypto");
/**
 * Interceptor de logging estructurado global (observability-design.md).
 * Emite JSON a stdout con timestamp, method, path, userId, statusCode,
 * durationMs y correlationId — nunca serializa el body completo (NFR3.13,
 * evita loguear password/pin por accidente).
 */
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger("HTTP");
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const correlationId = (0, crypto_1.randomUUID)();
        request.correlationId = correlationId;
        response.setHeader?.("X-Correlation-Id", correlationId);
        const startedAt = Date.now();
        const { method, url } = request;
        return next.handle().pipe((0, operators_1.tap)({
            next: () => this.emit(correlationId, method, url, request, response.statusCode, startedAt),
            error: (err) => this.emit(correlationId, method, url, request, err?.status ?? 500, startedAt, err?.response?.code),
        }));
    }
    emit(correlationId, method, path, request, statusCode, startedAt, errorCode) {
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
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
