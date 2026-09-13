import { CommissionTier } from "@prisma/client";
import { CommissionTierRepository } from "./commission-tier.repository";
import { CommissionTierInputDto } from "./dto/commission-tier-input.dto";
export interface TierResolutionResult {
    tiers: CommissionTier[];
    inOrder: boolean;
}
/**
 * CommissionTierComponent — resolución del tramo aplicable (BR4.1, BR4.2) y
 * determinación de "en orden" (ADR-003). Tramos ordenados por `order`
 * ascendente = de mejor a peor beneficio; "en orden" significa que
 * commissionRate no aumenta a medida que `order` crece (el tramo 1 es el de
 * mejor tasa) — decisión de Code Generation para hacer operativo ADR-003,
 * documentada aquí porque `rules.md`/`entities.md` no fijan la métrica exacta.
 */
export declare class CommissionTierService {
    private readonly repository;
    constructor(repository: CommissionTierRepository);
    getTiers(channel: "preventa" | "autoventa"): Promise<TierResolutionResult>;
    replaceTiers(channel: "preventa" | "autoventa", tiers: CommissionTierInputDto[]): Promise<{
        warning: string | null;
    } & TierResolutionResult>;
    /** BR4.2: el tramo aplicable es el de mejor beneficio cuyo umbral la métrica vigente satisface. */
    resolveApplicableTier(tiers: CommissionTier[], tierType: "por_devolucion" | "por_efectividad", metric: number): CommissionTier | null;
    /** ADR-003: tramos ordenados de mejor a peor beneficio (commissionRate no creciente conforme `order` crece). */
    isInOrder(tiers: CommissionTier[]): boolean;
    /** Tramo inmediatamente mejor que el tramo aplicable actual (para BR8.3 earningOpportunity). */
    findNextBetterTier(tiers: CommissionTier[], tierType: "por_devolucion" | "por_efectividad", currentTier: CommissionTier | null): CommissionTier | null;
}
