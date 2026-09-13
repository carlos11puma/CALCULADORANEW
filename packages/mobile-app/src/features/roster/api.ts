import { apiClient } from "../../shared/api/apiClient";
import type { Vendor, VendorInput } from "../../shared/api/contractTypes";

// features/roster/api.ts — Contrato 2 (VendorDirectory). MW12 (A2 Roster), MW13 (A3 Presupuestos
// reutiliza el mismo roster ya cargado — comparten datos de vendors per frontend-components.md).

export async function getVendors(): Promise<Vendor[]> {
  const { data } = await apiClient.get<Vendor[]>("/vendors");
  return data;
}

export async function createVendor(input: VendorInput): Promise<Vendor> {
  const { data } = await apiClient.post<Vendor>("/vendors", input);
  return data;
}

export async function updateVendor(vendorId: string, input: VendorInput): Promise<Vendor> {
  const { data } = await apiClient.patch<Vendor>(`/vendors/${vendorId}`, input);
  return data;
}
