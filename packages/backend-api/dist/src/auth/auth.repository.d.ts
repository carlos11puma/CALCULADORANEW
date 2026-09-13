import { PrismaService } from "../prisma/prisma.service";
import { Session, User } from "@prisma/client";
/**
 * Repositorio de acceso a datos de AuthModule (User, Session) — logical-components.md.
 */
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findVendedorByUsername(username: string): Promise<User | null>;
    findActiveSupervisorByPin(pin: string): Promise<User | null>;
    createSession(userId: string): Promise<Session>;
    findSessionByToken(token: string): Promise<Session | null>;
    revokeSession(token: string): Promise<Session>;
}
