"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
/**
 * Guard dedicado de rate limiting de login (security-design.md § rate
 * limiting de login, cierra R-01): 5 intentos/min por combinación
 * (IP, identificador de credencial) — más estricto que el límite global.
 * Solo se aplica a los dos endpoints de login.
 */
let LoginThrottlerGuard = class LoginThrottlerGuard extends throttler_1.ThrottlerGuard {
    async getTracker(req) {
        const credential = req.body?.username ?? req.body?.pin ?? "anonymous";
        return `${req.ip}:${credential}`;
    }
    async throwThrottlingException(_context, _throttlerLimitDetail) {
        throw new throttler_1.ThrottlerException(JSON.stringify({ code: "TOO_MANY_ATTEMPTS", message: "Demasiados intentos — intente de nuevo más tarde" }));
    }
};
exports.LoginThrottlerGuard = LoginThrottlerGuard;
exports.LoginThrottlerGuard = LoginThrottlerGuard = __decorate([
    (0, common_1.Injectable)()
], LoginThrottlerGuard);
