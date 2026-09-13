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
    // Fix (Deployment Execution, 260909, noveno hallazgo): un hash bcrypt no se puede
    // filtrar por igualdad en SQL contra el texto plano, así que se traen todos los
    // supervisores activos con PIN cargado y se compara cada hash con bcrypt aquí —
    // antes la consulta al repositorio ya descartaba a todos por comparar texto plano
    // contra hash directamente en el WHERE.
    const supervisors = await this.authRepository.findActiveSupervisors();

    let matchedUser: (typeof supervisors)[number] | null = null;
    for (const supervisor of supervisors) {
      if (supervisor.pin && (await bcrypt.compare(pin, supervisor.pin))) {
        matchedUser = supervisor;
        break;
      }
    }

    if (!matchedUser) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "PIN inválido" });
    }

    const session = await this.authRepository.createSession(matchedUser.id);
    return { token: session.token, userId: matchedUser.id, role: "supervisor" };
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
