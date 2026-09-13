import { apiClient } from "../../shared/api/apiClient";
import type { CommissionPeriod } from "../../shared/api/contractTypes";

// features/home/api.ts — Contrato 5 (CommissionLedger), GET /commission/current. MW4.

export async function getCurrentCommission(): Promise<CommissionPeriod> {
  const { data } = await apiClient.get<CommissionPeriod>("/commission/current");
  return data;
}
