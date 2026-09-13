export declare class CommissionTierInputDto {
    channel: "preventa" | "autoventa";
    tierType: "por_devolucion" | "por_efectividad";
    order: number;
    thresholdValue: number;
    commissionRate: number;
}
export declare class ReplaceTiersDto {
    tiers: CommissionTierInputDto[];
}
