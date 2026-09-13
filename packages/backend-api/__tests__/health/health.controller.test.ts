import { describe, expect, it, vi } from "vitest";
import { HealthController } from "../../src/health/health.controller";

describe("HealthController", () => {
  it("GET /health delega en HealthCheckService con un PrismaHealthIndicator (NFR6.2)", async () => {
    const health = { check: vi.fn().mockResolvedValue({ status: "ok" }) };
    const prismaHealth = { pingCheck: vi.fn() };
    const prisma = {};

    const controller = new HealthController(health as any, prismaHealth as any, prisma as any);
    const result = await controller.check();

    expect(health.check).toHaveBeenCalledWith([expect.any(Function)]);
    expect(result).toEqual({ status: "ok" });
  });
});
