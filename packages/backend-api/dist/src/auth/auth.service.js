"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const auth_repository_1 = require("./auth.repository");
const BCRYPT_COST_FACTOR = 10;
/**
 * Lógica de negocio de AuthModule — W1 (login vendedor), W2 (login
 * supervisor), W3 (logout). BR1.4/BR1.5: ninguna Session lleva expiresAt
 * (no expira por tiempo transcurrido).
 */
let AuthService = class AuthService {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async loginVendedor(username, password) {
        const user = await this.authRepository.findVendedorByUsername(username);
        // No distinguir "usuario no existe" de "contraseña incorrecta" (W1 paso 3).
        if (!user || !user.active || !user.passwordHash) {
            throw new common_1.UnauthorizedException({ code: "UNAUTHORIZED", message: "Credenciales inválidas" });
        }
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) {
            throw new common_1.UnauthorizedException({ code: "UNAUTHORIZED", message: "Credenciales inválidas" });
        }
        const session = await this.authRepository.createSession(user.id);
        return { token: session.token, userId: user.id, role: "vendedor" };
    }
    async loginSupervisor(pin) {
        const user = await this.authRepository.findActiveSupervisorByPin(pin);
        if (!user || !user.pin) {
            throw new common_1.UnauthorizedException({ code: "UNAUTHORIZED", message: "PIN inválido" });
        }
        const matches = await bcrypt.compare(pin, user.pin);
        if (!matches) {
            throw new common_1.UnauthorizedException({ code: "UNAUTHORIZED", message: "PIN inválido" });
        }
        const session = await this.authRepository.createSession(user.id);
        return { token: session.token, userId: user.id, role: "supervisor" };
    }
    async logout(token) {
        const session = await this.authRepository.findSessionByToken(token);
        if (!session || session.revokedAt) {
            throw new common_1.UnauthorizedException({ code: "UNAUTHORIZED", message: "Sesión inválida" });
        }
        await this.authRepository.revokeSession(token);
    }
    static async hash(value) {
        return bcrypt.hash(value, BCRYPT_COST_FACTOR);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository])
], AuthService);
