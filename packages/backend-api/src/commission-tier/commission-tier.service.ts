import { BadRequestException, Injectable } from "@nestjs/common";
import { CommissionTier } from "@prisma/client";
import { CommissionTierRepository } from "./commission-tier.repository";
import { CommissionTierInputDto } from "./dto/commission-tier-input.dto";

export interface TierResolutionResult {
  tiers: CommissionTier[];
  inOrder: boolean;
}

const EXPECTED_TIER_TYPE: Record<"preventa" | "autoventa", "por_devolucion" | "por_efectividad"> = {
  preventa: "por_devolucion",
  autoventa: "por_efectividad",
};

/**
 * CommissionTierComponent — resolución del tramo aplicable (BR4.1, BR4.2) y
 * determinación de "en orden" (ADR-003). Tramos ordenados por `order`
 * ascendente = de mejor a peor beneficio; "en orden" significa que
 * commissionRate no aumenta a medida que `order` crece (el tramo 1 es el de
 * mejor tasa) — decisión de Code Generation para hacer operativo ADR-003,
 * documentada aquí porque `rules.md`/`entities.md` no fijan la métrica exacta.
 */
@Injectable()
export class CommissionTierService {
  constructor(private readonly repository: CommissionTierRepository) {}

  async getTiers(channel: "preventa" | "autoventa"): Promise<TierResolutionResult> {
    const tiers = await this.repository.findByChannel(channel);
    return { tiers, inOrder: this.isInOrder(tiers) };
  }

  async replaceTiers(
    channel: "preventa" | "autoventa",
    tiers: CommissionTierInputDto[],
  ): Promise<{ warning: string | null } & TierResolutionResult> {
    for (const tier of tiers) {
      if (tier.channel !== channel) {
        throw new BadRequestException({
          code: "VALIDATION_ERROR",
          message: "Todos los tramos del lote deben pertenecer al mismo canal",
        });
      }
      if (tier.tierType !== EXPECTED_TIER_TYPE[channel]) {
        throw new BadRequestException({
          code: "VALIDATION_ERROR",
          message: `tierType debe ser ${EXPECTED_TIER_TYPE[channel]} para el canal ${channel}`,
        });
      }
    }

    const saved = await this.repository.replaceChannel(channel, tiers);
    const inOrder = this.isInOrder(saved);
    return { tiers: saved, inOrder, warning: inOrder ? null : "TIER_ORDER_WARNING" };
  }

  /** BR4.2: el tramo aplicable es el de mejor beneficio cuyo umbral la métrica vigente satisface. */
  resolveApplicableTier(tiers: CommissionTier[], tierType: "por_devolucion" | "por_efectividad", metric: number): CommissionTier | null {
    const sorted = [...tiers].filter((t) => t.tierType === tierType).sort((a, b) => a.order - b.order);

    for (const tier of sorted) {
      const threshold = Number(tier.thresholdValue);
      if (tierType === "por_efectividad" && metric >= threshold) {
        return tier;
      }
      if (tierType === "por_devolucion" && metric < threshold) {
        return tier;
      }
    }
    return null;
  }

  /** ADR-003: tramos ordenados de mejor a peor beneficio (commissionRate no creciente conforme `order` crece). */
  isInOrder(tiers: CommissionTier[]): boolean {
    if (tiers.length <= 1) return true;
    const sorted = [...tiers].sort((a, b) => a.order - b.order);
    for (let i = 1; i < sorted.length; i++) {
      if (Number(sorted[i].commissionRate) > Number(sorted[i - 1].commissionRate)) {
        return false;
      }
    }
    return true;
  }

  /** Tramo inmediatamente mejor que el tramo aplicable actual (para BR8.3 earningOpportunity). */
  findNextBetterTier(tiers: CommissionTier[], tierType: "por_devolucion" | "por_efectividad", currentTier: CommissionTier | null): CommissionTier | null {
    const sorted = [...tiers].filter((t) => t.tierType === tierType).sort((a, b) => a.order - b.order);
    if (sorted.length === 0) return null;
    if (!currentTier) return sorted[0] ?? null;
    const currentIndex = sorted.findIndex((t) => t.id === currentTier.id);
    if (currentIndex <= 0) return null; // ya está en el mejor tramo
    return sorted[currentIndex - 1];
  }
}
