import { apiClient } from "../../shared/api/apiClient";
import type { LoginResponse } from "../../shared/api/contractTypes";

// features/auth/api.ts — Contrato 1 (Auth) de contract-summary.md. MW1, MW2, MW3.

export async function loginVendedor(username: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login/vendedor", { username, password });
  return data;
}

export async function loginSupervisor(pin: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login/supervisor", { pin });
  return data;
}

/**
 * Logout best-effort (MW3): si falla por falta de red, el logout local procede igual — el
 * objetivo es que el vendedor salga de su cuenta en este dispositivo, no que el servidor se
 * entere de inmediato. El llamador (feature de auth) ignora el error de esta función.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
