import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Session, User } from "@prisma/client";

/**
 * Repositorio de acceso a datos de AuthModule (User, Session) — logical-components.md.
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findVendedorByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { username, role: "vendedor" } });
  }

  /**
   * Fix (Deployment Execution, 260909, noveno hallazgo): antes esta consulta filtraba
   * `where: { pin, role: "supervisor", active: true }`, comparando el PIN en texto plano
   * recibido en el login contra la columna `pin`, que guarda un HASH bcrypt — esa
   * comparación nunca puede coincidir (bcrypt genera un hash distinto en cada `hash()`,
   * incluso para el mismo texto), así que el login de supervisor era imposible con
   * cualquier PIN. Ningún test lo detectó porque todos mockean el repositorio o el
   * AuthService, sin ejercitar la consulta real contra un hash real. Ahora se traen los
   * supervisores activos con PIN cargado y se compara cada uno con bcrypt en el
   * servicio (auth.service.ts), igual que ya se hace para la contraseña del vendedor.
   */
  findActiveSupervisors(): Promise<User[]> {
    return this.prisma.user.findMany({ where: { role: "supervisor", active: true, pin: { not: null } } });
  }

  createSession(userId: string): Promise<Session> {
    return this.prisma.session.create({
      data: { userId, expiresAt: null },
    });
  }

  findSessionByToken(token: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { token } });
  }

  revokeSession(token: string): Promise<Session> {
    return this.prisma.session.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }
}
