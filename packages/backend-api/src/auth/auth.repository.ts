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

  findActiveSupervisorByPin(pin: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { pin, role: "supervisor", active: true } });
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
