import { apiClient } from "../../shared/api/apiClient";
import type { DailySale, DailySaleInput, SyncResultItem } from "../../shared/api/contractTypes";

// features/sales-entry/api.ts — Contrato 4 (SalesEntry). MW6, MW7, MW8.

export async function postSale(input: DailySaleInput): Promise<DailySale> {
  const { data } = await apiClient.post<DailySale>("/sales", input);
  return data;
}

export async function postSalesSync(items: DailySaleInput[]): Promise<SyncResultItem[]> {
  const { data } = await apiClient.post<SyncResultItem[]>("/sales/sync", items);
  return data;
}
