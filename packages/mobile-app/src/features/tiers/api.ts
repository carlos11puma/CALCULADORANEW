import { apiClient } from "../../shared/api/apiClient";
import type { Channel, CommissionTierInput, TierListResponse, TierSaveResponse } from "../../shared/api/contractTypes";

// features/tiers/api.ts — Contrato 3 (CommissionTier). MW14 (A4 Tramos de comisión).

export async function getTiers(channel: Channel): Promise<TierListResponse> {
  const { data } = await apiClient.get<TierListResponse>("/tiers", { params: { channel } });
  return data;
}

export async function replaceTiers(tiers: CommissionTierInput[]): Promise<TierSaveResponse> {
  const { data } = await apiClient.put<TierSaveResponse>("/tiers", tiers);
  return data;
}
