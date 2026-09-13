import { apiClient } from "../../shared/api/apiClient";
import type { CommissionPeriod } from "../../shared/api/contractTypes";

// features/history/api.ts — Contrato 5 (CommissionLedger), GET /commission/history. MW10.

export async function getCommissionHistory(limit?: number): Promise<CommissionPeriod[]> {
  const { data } = await apiClient.get<CommissionPeriod[]>("/commission/history", {
    params: limit ? { limit } : undefined,
  });
  return data;
}
