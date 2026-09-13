import { describe, expect, it, vi, beforeEach } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "../../src/common/guards/auth.guard";
import { vendorUser } from "../../__fixtures__";

function buildContext(headers: Record<string, string>) {
  const request: any = { headers };
  return {
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }),
    getHandler: () => ({}),
    getClass: () => ({}),
    __request: request,
  } as any;
}

describe("AuthGuard", () => {
  let prisma: { session: { findUnique: any } };
  let reflector: Reflector;
  let guard: AuthGuard;

  beforeEach(() => {
    prisma = { session: { findUnique: vi.fn() } };
    reflector = new Reflector();
    guard = new AuthGuard(prisma as any, reflector);
  });

  it("permite endpoints marcados @Public sin resolver token", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const context = buildContext({});
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it("rechaza con 401 cuando falta el header Authorization", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    const context = buildContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it("rechaza con 401 cuando la Session no existe", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    prisma.session.findUnique.mockResolvedValue(null);
    const context = buildContext({ authorization: "Bearer tok1" });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it("rechaza con 401 cuando la Session está revocada (revokedAt no nulo)", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    prisma.session.findUnique.mockResolvedValue({
      revokedAt: new Date(),
      userId: vendorUser.id,
      user: { ...vendorUser, active: true, vendor: null },
    });
    const context = buildContext({ authorization: "Bearer tok1" });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it("rechaza con 401 cuando User.active=false (cierre R-02)", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    prisma.session.findUnique.mockResolvedValue({
      revokedAt: null,
      userId: vendorUser.id,
      user: { ...vendorUser, active: false, vendor: null },
    });
    const context = buildContext({ authorization: "Bearer tok1" });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it("permite y adjunta request.user cuando la sesión es válida", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    prisma.session.findUnique.mockResolvedValue({
      revokedAt: null,
      userId: vendorUser.id,
      user: { ...vendorUser, active: true, vendor: { id: "vnd_1" } },
    });
    const context = buildContext({ authorization: "Bearer tok1" });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(context.__request.user).toEqual({ userId: vendorUser.id, role: "vendedor", vendorId: "vnd_1" });
  });
});
