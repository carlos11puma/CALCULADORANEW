import { describe, expect, it, vi, beforeEach } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "../../src/common/guards/roles.guard";

function buildContext(user: any) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe("RolesGuard", () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it("permite cuando el endpoint no declara @Roles", () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    expect(guard.canActivate(buildContext({ role: "vendedor" }))).toBe(true);
  });

  it("permite cuando el rol del usuario está en la lista requerida", () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(["supervisor"]);
    expect(guard.canActivate(buildContext({ role: "supervisor" }))).toBe(true);
  });

  it("rechaza con 403 cuando el rol no está permitido (vendedor en endpoint de supervisor)", () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(["supervisor"]);
    expect(() => guard.canActivate(buildContext({ role: "vendedor" }))).toThrow(ForbiddenException);
  });

  it("rechaza con 403 cuando no hay request.user (guard mal ordenado)", () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(["supervisor"]);
    expect(() => guard.canActivate(buildContext(undefined))).toThrow(ForbiddenException);
  });
});
