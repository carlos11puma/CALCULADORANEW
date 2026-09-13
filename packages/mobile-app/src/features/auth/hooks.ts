import { useMutation } from "@tanstack/react-query";
import type { LoginResponse } from "../../shared/api/contractTypes";
import { loginSupervisor, loginVendedor } from "./api";

// hooks.ts — mutaciones de TanStack Query para MW1 (V1) y MW2 (A1). `isPending` re-renderiza
// el botón en loading de forma síncrona en el mismo tick del onPress (performance-design.md
// § Feedback optimista, NFR1.5) sin lógica adicional escrita a mano.

export function useLoginVendedor() {
  return useMutation<LoginResponse, unknown, { username: string; password: string }>({
    mutationFn: ({ username, password }) => loginVendedor(username, password),
  });
}

export function useLoginSupervisor() {
  return useMutation<LoginResponse, unknown, { pin: string }>({
    mutationFn: ({ pin }) => loginSupervisor(pin),
  });
}
