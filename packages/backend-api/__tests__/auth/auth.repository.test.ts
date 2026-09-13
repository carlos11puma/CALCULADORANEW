import { describe, expect, it, vi, beforeEach } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { AuthRepository } from "../../src/auth/auth.repository";
import { vendorUser, supervisorUser } from "../../__fixtures__";

describe("AuthRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: AuthRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new AuthRepository(prisma as any);
  });

  it("busca un vendedor activo por username", async () => {
    prisma.user.findFirst.mockResolvedValue(vendorUser);
    const result = await repository.findVendedorByUsername("juan.perez");
    expect(result).toEqual(vendorUser);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { username: "juan.perez", role: "vendedor" } });
  });

  it("retorna null cuando el username no existe", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    const result = await repository.findVendedorByUsername("nadie");
    expect(result).toBeNull();
  });

  it("busca los supervisores activos con pin cargado (sin filtrar por el pin en texto plano — es un hash bcrypt)", async () => {
    prisma.user.findMany.mockResolvedValue([supervisorUser]);
    const result = await repository.findActiveSupervisors();
    expect(result).toEqual([supervisorUser]);
    expect(prisma.user.findMany).toHaveBeenCalledWith({ where: { role: "supervisor", active: true, pin: { not: null } } });
  });

  it("crea una Session con expiresAt null (BR1.4/BR1.5)", async () => {
    const session = { id: "s1", token: "tok1", userId: vendorUser.id, createdAt: new Date(), expiresAt: null, revokedAt: null };
    prisma.session.create.mockResolvedValue(session);
    const result = await repository.createSession(vendorUser.id);
    expect(result).toEqual(session);
    expect(prisma.session.create).toHaveBeenCalledWith({ data: { userId: vendorUser.id, expiresAt: null } });
  });

  it("revoca una sesión marcando revokedAt", async () => {
    const revoked = { id: "s1", token: "tok1", userId: vendorUser.id, createdAt: new Date(), expiresAt: null, revokedAt: new Date() };
    prisma.session.update.mockResolvedValue(revoked);
    const result = await repository.revokeSession("tok1");
    expect(result.revokedAt).not.toBeNull();
  });

  it("propaga el error si la consulta de sesión falla", async () => {
    prisma.session.findUnique.mockRejectedValue(new Error("db down"));
    await expect(repository.findSessionByToken("tok1")).rejects.toThrow("db down");
  });
});
