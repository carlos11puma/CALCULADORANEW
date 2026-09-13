import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { SalesEntryRepository } from "../../src/sales-entry/sales-entry.repository";
import { dailySaleFixture, preventaVendor } from "../../__fixtures__";

describe("SalesEntryRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: SalesEntryRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new SalesEntryRepository(prisma as any);
  });

  it("findByVendorAndDate busca por la clave compuesta (vendorId, saleDate) — NFR4.2", async () => {
    prisma.dailySale.findUnique.mockResolvedValue(dailySaleFixture);
    const result = await repository.findByVendorAndDate(preventaVendor.id, dailySaleFixture.saleDate);
    expect(result).toEqual(dailySaleFixture);
    expect(prisma.dailySale.findUnique).toHaveBeenCalledWith({
      where: { vendorId_saleDate: { vendorId: preventaVendor.id, saleDate: dailySaleFixture.saleDate } },
    });
  });

  it("findByVendorAndDate retorna null cuando no hay venta ese día", async () => {
    prisma.dailySale.findUnique.mockResolvedValue(null);
    const result = await repository.findByVendorAndDate(preventaVendor.id, new Date());
    expect(result).toBeNull();
  });

  it("create guarda con syncStatus=synced", async () => {
    prisma.dailySale.create.mockResolvedValue(dailySaleFixture);
    await repository.create(preventaVendor.id, dailySaleFixture.saleDate, 1000, 50);
    expect(prisma.dailySale.create).toHaveBeenCalledWith({
      data: { vendorId: preventaVendor.id, saleDate: dailySaleFixture.saleDate, amount: 1000, returns: 50, syncStatus: "synced" },
    });
  });

  it("update corrige amount/returns del mismo día (FR3.3)", async () => {
    prisma.dailySale.update.mockResolvedValue({ ...dailySaleFixture, amount: 1200 });
    const result = await repository.update(dailySaleFixture.id, 1200, 60);
    expect(result.amount).toBe(1200);
  });

  it("propaga el error de constraint único si Prisma lo rechaza (simulación de UNIQUE(vendorId, saleDate))", async () => {
    prisma.dailySale.create.mockRejectedValue(Object.assign(new Error("Unique constraint failed"), { code: "P2002" }));
    await expect(repository.create(preventaVendor.id, dailySaleFixture.saleDate, 1, 1)).rejects.toThrow("Unique constraint failed");
  });
});
