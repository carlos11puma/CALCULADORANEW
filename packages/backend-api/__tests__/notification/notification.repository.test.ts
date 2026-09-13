import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { NotificationRepository } from "../../src/notification/notification.repository";
import { preventaVendor } from "../../__fixtures__";

describe("NotificationRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: NotificationRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new NotificationRepository(prisma as any);
  });

  it("existsForPeriod busca por (vendorId, type, thresholdCrossed, periodMonth) — BR7.2/BR8.2", async () => {
    prisma.notification.findFirst.mockResolvedValue(null);
    const result = await repository.existsForPeriod(preventaVendor.id, "umbral_venta", 100, "2026-09");
    expect(result).toBeNull();
    expect(prisma.notification.findFirst).toHaveBeenCalledWith({
      where: { vendorId: preventaVendor.id, type: "umbral_venta", thresholdCrossed: 100, periodMonth: "2026-09" },
    });
  });

  it("create persiste la notificación con los campos dados", async () => {
    const created = { id: "n1" } as any;
    prisma.notification.create.mockResolvedValue(created);
    const result = await repository.create({
      vendorId: preventaVendor.id,
      type: "umbral_venta",
      thresholdCrossed: 100,
      message: "msg",
      periodMonth: "2026-09",
    });
    expect(result).toEqual(created);
  });

  it("findActiveVendors solo retorna vendedores con active=true", async () => {
    prisma.vendor.findMany.mockResolvedValue([{ id: "v1" } as any]);
    const result = await repository.findActiveVendors();
    expect(result).toEqual([{ id: "v1" }]);
    expect(prisma.vendor.findMany).toHaveBeenCalledWith({ where: { active: true }, select: { id: true } });
  });

  it("findActiveVendorsByIds ignora silenciosamente ids que no resuelven a un Vendor activo (BR9.2)", async () => {
    prisma.vendor.findMany.mockResolvedValue([{ id: "v1" } as any]);
    const result = await repository.findActiveVendorsByIds(["v1", "no-existe"]);
    expect(result).toEqual([{ id: "v1" }]);
  });

  it("findByVendor ordena por sentAt descendente", async () => {
    prisma.notification.findMany.mockResolvedValue([]);
    await repository.findByVendor(preventaVendor.id);
    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { vendorId: preventaVendor.id },
      orderBy: { sentAt: "desc" },
    });
  });
});
