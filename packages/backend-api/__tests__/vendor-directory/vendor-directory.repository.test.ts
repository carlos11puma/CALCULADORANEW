import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { VendorDirectoryRepository } from "../../src/vendor-directory/vendor-directory.repository";
import { preventaVendor } from "../../__fixtures__";

describe("VendorDirectoryRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: VendorDirectoryRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new VendorDirectoryRepository(prisma as any);
  });

  it("findAll ordena por nombre", async () => {
    prisma.vendor.findMany.mockResolvedValue([preventaVendor]);
    const result = await repository.findAll();
    expect(result).toEqual([preventaVendor]);
    expect(prisma.vendor.findMany).toHaveBeenCalledWith({ orderBy: { name: "asc" } });
  });

  it("findById retorna null cuando el vendedor no existe", async () => {
    prisma.vendor.findUnique.mockResolvedValue(null);
    const result = await repository.findById("no-existe");
    expect(result).toBeNull();
  });

  it("createVendorWithUser crea User+Vendor dentro de una transacción", async () => {
    prisma.$transaction.mockImplementation(async (fn: any) => fn(prisma));
    prisma.user.create.mockResolvedValue({ id: "usr_new" } as any);
    prisma.vendor.create.mockResolvedValue(preventaVendor);

    const result = await repository.createVendorWithUser({
      username: "nuevo.vendedor",
      passwordHash: "hash",
      route: "Ruta 1",
      name: "Nuevo Vendedor",
      channel: "preventa",
      budget: 1000,
    });

    expect(result).toEqual(preventaVendor);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.vendor.create).toHaveBeenCalled();
  });

  it("update actualiza route/name/channel/budget", async () => {
    prisma.vendor.update.mockResolvedValue({ ...preventaVendor, budget: 2000 });
    const result = await repository.update(preventaVendor.id, { route: "Ruta 1", name: "Juan", channel: "preventa", budget: 2000 });
    expect(result.budget).toBe(2000);
  });

  it("propaga el error si la transacción de creación falla (username duplicado)", async () => {
    prisma.$transaction.mockRejectedValue(Object.assign(new Error("Unique constraint"), { code: "P2002" }));
    await expect(
      repository.createVendorWithUser({ username: "dup", passwordHash: "h", route: "r", name: "n", channel: "preventa", budget: 1 }),
    ).rejects.toThrow("Unique constraint");
  });
});
