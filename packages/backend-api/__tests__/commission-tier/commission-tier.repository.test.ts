import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { CommissionTierRepository } from "../../src/commission-tier/commission-tier.repository";
import { preventaTiersInOrder } from "../../__fixtures__";

describe("CommissionTierRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: CommissionTierRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new CommissionTierRepository(prisma as any);
  });

  it("findByChannel ordena por `order` ascendente", async () => {
    prisma.commissionTier.findMany.mockResolvedValue(preventaTiersInOrder);
    const result = await repository.findByChannel("preventa");
    expect(result).toEqual(preventaTiersInOrder);
    expect(prisma.commissionTier.findMany).toHaveBeenCalledWith({ where: { channel: "preventa" }, orderBy: { order: "asc" } });
  });

  it("findByChannel retorna arreglo vacío cuando el canal no tiene tramos configurados", async () => {
    prisma.commissionTier.findMany.mockResolvedValue([]);
    const result = await repository.findByChannel("autoventa");
    expect(result).toEqual([]);
  });

  it("replaceChannel borra el conjunto anterior y crea el nuevo dentro de una transacción", async () => {
    prisma.$transaction.mockImplementation(async (fn: any) => fn(prisma));
    prisma.commissionTier.deleteMany.mockResolvedValue({ count: 3 });
    prisma.commissionTier.createMany.mockResolvedValue({ count: 3 });
    prisma.commissionTier.findMany.mockResolvedValue(preventaTiersInOrder);

    const input = preventaTiersInOrder.map(({ channel, tierType, order, thresholdValue, commissionRate }) => ({
      channel,
      tierType,
      order,
      thresholdValue: Number(thresholdValue),
      commissionRate: Number(commissionRate),
    }));

    const result = await repository.replaceChannel("preventa", input as any);
    expect(result).toEqual(preventaTiersInOrder);
    expect(prisma.commissionTier.deleteMany).toHaveBeenCalledWith({ where: { channel: "preventa" } });
  });

  it("propaga el error si la transacción falla", async () => {
    prisma.$transaction.mockRejectedValue(new Error("constraint violation"));
    await expect(repository.replaceChannel("preventa", [])).rejects.toThrow("constraint violation");
  });
});
