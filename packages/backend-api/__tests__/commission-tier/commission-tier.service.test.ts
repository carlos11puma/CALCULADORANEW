import { describe, expect, it, vi, beforeEach } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { CommissionTierService } from "../../src/commission-tier/commission-tier.service";
import { preventaTiersInOrder, preventaTiersOutOfOrder, autoventaTiersInOrder } from "../../__fixtures__";

describe("CommissionTierService", () => {
  let repository: { findByChannel: any; replaceChannel: any };
  let service: CommissionTierService;

  beforeEach(() => {
    repository = { findByChannel: vi.fn(), replaceChannel: vi.fn() };
    service = new CommissionTierService(repository as any);
  });

  it("getTiers detecta un conjunto en orden (ADR-003)", async () => {
    repository.findByChannel.mockResolvedValue(preventaTiersInOrder);
    const result = await service.getTiers("preventa");
    expect(result.inOrder).toBe(true);
  });

  it("getTiers detecta un conjunto fuera de orden", async () => {
    repository.findByChannel.mockResolvedValue(preventaTiersOutOfOrder);
    const result = await service.getTiers("preventa");
    expect(result.inOrder).toBe(false);
  });

  it("replaceTiers guarda con TIER_ORDER_WARNING cuando queda fuera de orden, sin bloquear", async () => {
    repository.replaceChannel.mockResolvedValue(preventaTiersOutOfOrder);
    const input = preventaTiersOutOfOrder.map(({ channel, tierType, order, thresholdValue, commissionRate }) => ({
      channel,
      tierType,
      order,
      thresholdValue: Number(thresholdValue),
      commissionRate: Number(commissionRate),
    }));
    const result = await service.replaceTiers("preventa", input as any);
    expect(result.warning).toBe("TIER_ORDER_WARNING");
    expect(result.inOrder).toBe(false);
  });

  it("replaceTiers rechaza un tramo con tierType incorrecto para el canal", async () => {
    const badInput = [{ channel: "preventa", tierType: "por_efectividad", order: 1, thresholdValue: 5, commissionRate: 0.05 }];
    await expect(service.replaceTiers("preventa", badInput as any)).rejects.toThrow(BadRequestException);
  });

  it("resolveApplicableTier (BR4.2) — por_devolucion elige el mejor tramo cuyo umbral supera la métrica", () => {
    const tier = service.resolveApplicableTier(preventaTiersInOrder, "por_devolucion", 4.5);
    expect(tier?.id).toBe("tier_p1");
  });

  it("resolveApplicableTier — por_efectividad elige el mejor tramo alcanzado", () => {
    const tier = service.resolveApplicableTier(autoventaTiersInOrder, "por_efectividad", 96);
    expect(tier?.id).toBe("tier_a2");
  });

  it("resolveApplicableTier retorna null cuando ningún tramo aplica", () => {
    const tier = service.resolveApplicableTier(preventaTiersInOrder, "por_devolucion", 150);
    expect(tier).toBeNull();
  });

  it("findNextBetterTier retorna null cuando ya está en el mejor tramo", () => {
    const next = service.findNextBetterTier(preventaTiersInOrder, "por_devolucion", preventaTiersInOrder[0]);
    expect(next).toBeNull();
  });
});
