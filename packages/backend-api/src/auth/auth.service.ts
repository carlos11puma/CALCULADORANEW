import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository";

export interface LoginResult {
  token: string;
  userId: string;
  role: "vendedor" | "supervisor";
}

const BCRYPT_COST_FACTOR = 10;

/**
 * Lógica de negocio de AuthModule — W1 (login vendedor), W2 (login
 * supervisor), W3 (logout). BR1.4/BR1.5: ninguna Session lleva expiresAt
 * (no expira por tiempo transcurrido).
 */
@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async loginVendedor(username: string, password: string): Promise<LoginResult> {
    const user = await this.authRepository.findVendedorByUsername(username);

    // No distinguir "usuario no existe" de "contraseña incorrecta" (W1 paso 3).
    if (!user || !user.active || !user.passwordHash) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Credenciales inválidas" });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Credenciales inválidas" });
    }

    const session = await this.authRepository.createSession(user.id);
    return { token: session.token, userId: user.id, role: "vendedor" };
  }

  async loginSupervisor(pin: string): Promise<LoginResult> {
    const user = await this.authRepository.findActiveSupervisorByPin(pin);

    if (!user || !user.pin) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "PIN inválido" });
    }

    const matches = await bcrypt.compare(pin, user.pin);
    if (!matches) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "PIN inválido" });
    }

    const session = await this.authRepository.createSession(user.id);
    return { token: session.token, userId: user.id, role: "supervisor" };
  }

  async logout(token: string): Promise<void> {
    const session = await this.authRepository.findSessionByToken(token);
    if (!session || session.revokedAt) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Sesión inválida" });
    }
    await this.authRepository.revokeSession(token);
  }

  static async hash(value: string): Promise<string> {
    return bcrypt.hash(value, BCRYPT_COST_FACTOR);
  }
}
