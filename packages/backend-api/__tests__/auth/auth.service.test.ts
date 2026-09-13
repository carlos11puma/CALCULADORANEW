import { describe, expect, it, vi, beforeEach } from "vitest";
import * as bcrypt from "bcrypt";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../../src/auth/auth.service";
import { AuthRepository } from "../../src/auth/auth.repository";
import { vendorUser, supervisorUser } from "../../__fixtures__";

vi.mock("bcrypt", () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe("AuthService", () => {
  let repository: { findVendedorByUsername: any; findActiveSupervisorByPin: any; createSession: any; findSessionByToken: any; revokeSession: any };
  let service: AuthService;

  beforeEach(() => {
    repository = {
      findVendedorByUsername: vi.fn(),
      findActiveSupervisorByPin: vi.fn(),
      createSession: vi.fn(),
      findSessionByToken: vi.fn(),
      revokeSession: vi.fn(),
    };
    service = new AuthService(repository as unknown as AuthRepository);
    vi.clearAllMocks();
  });

  it("W1 — login de vendedor exitoso crea Session sin expiresAt", async () => {
    repository.findVendedorByUsername.mockResolvedValue(vendorUser);
    (bcrypt.compare as any).mockResolvedValue(true);
    repository.createSession.mockResolvedValue({ token: "tok1", userId: vendorUser.id, expiresAt: null });

    const result = await service.loginVendedor("juan.perez", "secret");

    expect(result).toEqual({ token: "tok1", userId: vendorUser.id, role: "vendedor" });
  });

  it("W1 — 401 cuando el username no existe (sin distinguir motivo)", async () => {
    repository.findVendedorByUsername.mockResolvedValue(null);
    await expect(service.loginVendedor("nadie", "x")).rejects.toThrow(UnauthorizedException);
  });

  it("W1 — 401 cuando la contraseña no coincide", async () => {
    repository.findVendedorByUsername.mockResolvedValue(vendorUser);
    (bcrypt.compare as any).mockResolvedValue(false);
    await expect(service.loginVendedor("juan.perez", "wrong")).rejects.toThrow(UnauthorizedException);
  });

  it("W1 — 401 cuando el vendedor está inactivo", async () => {
    repository.findVendedorByUsername.mockResolvedValue({ ...vendorUser, active: false });
    await expect(service.loginVendedor("juan.perez", "secret")).rejects.toThrow(UnauthorizedException);
  });

  it("W2 — login de supervisor exitoso", async () => {
    repository.findActiveSupervisorByPin.mockResolvedValue(supervisorUser);
    (bcrypt.compare as any).mockResolvedValue(true);
    repository.createSession.mockResolvedValue({ token: "tok2", userId: supervisorUser.id, expiresAt: null });

    const result = await service.loginSupervisor("1234");

    expect(result).toEqual({ token: "tok2", userId: supervisorUser.id, role: "supervisor" });
  });

  it("W2 — 401 cuando el PIN no coincide con ningún supervisor", async () => {
    repository.findActiveSupervisorByPin.mockResolvedValue(null);
    await expect(service.loginSupervisor("0000")).rejects.toThrow(UnauthorizedException);
  });

  it("W3 — logout revoca la sesión vigente", async () => {
    repository.findSessionByToken.mockResolvedValue({ id: "s1", token: "tok1", revokedAt: null });
    repository.revokeSession.mockResolvedValue({});

    await service.logout("tok1");

    expect(repository.revokeSession).toHaveBeenCalledWith("tok1");
  });

  it("W3 — 401 al hacer logout con un token ya revocado", async () => {
    repository.findSessionByToken.mockResolvedValue({ id: "s1", token: "tok1", revokedAt: new Date() });
    await expect(service.logout("tok1")).rejects.toThrow(UnauthorizedException);
  });
});
