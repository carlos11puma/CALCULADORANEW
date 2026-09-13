import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { DailySale, DailySaleInput } from "../../shared/api/contractTypes";
import { getCurrentConnectivity } from "../../shared/net/connectivity";
import { getPendingSale, upsertPendingSale } from "../../shared/storage/pendingSalesDb";
import { postSale } from "./api";

// hooks.ts — mutación de TanStack Query para V3 SalesEntryScreen (MW6 con conexión, MW7 sin
// conexión). Implementa la bifurcación de functional-spec.md § MW7 paso 1: guarda local si no
// hay conexión detectada, o si la conexión se pierde a mitad del intento de POST /sales
// (timeout o error de red, AC3.3.4) — nunca se muestra un error de pérdida de datos en ese caso.

export interface SaveSaleResult {
  offline: boolean;
  sale?: DailySale;
}

/**
 * Distingue un fallo de red/timeout (sin `response`, AxiosError típico de un intento que no
 * llegó a completarse) de una respuesta HTTP real con error (400/409), que sí debe propagarse
 * al llamador para su manejo (MW6 pasos 4-5).
 */
function isNetworkFailure(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return Boolean(axiosError?.isAxiosError) && axiosError.response === undefined;
}

export function useSaveSale(vendorId: string | null) {
  const queryClient = useQueryClient();
  return useMutation<SaveSaleResult, unknown, DailySaleInput>({
    mutationFn: async (input) => {
      if (!vendorId) {
        throw new Error("useSaveSale requiere una sesión de vendedor activa");
      }
      const online = await getCurrentConnectivity();
      if (!online) {
        await upsertPendingSale({
          vendorId,
          saleDate: input.saleDate,
          amount: input.amount,
          returns: input.returns,
        });
        return { offline: true };
      }
      try {
        const sale = await postSale(input);
        return { offline: false, sale };
      } catch (error) {
        if (isNetworkFailure(error)) {
          await upsertPendingSale({
            vendorId,
            saleDate: input.saleDate,
            amount: input.amount,
            returns: input.returns,
          });
          return { offline: true };
        }
        throw error; // 400/409 — MW6 pasos 4-5, el llamador decide qué mostrar.
      }
    },
    onSuccess: (result) => {
      // MW4 paso 4 / performance-design.md § Invalidación: solo cuando la venta quedó
      // registrada en el servidor — un guardado local (offline) no cambia commission/current.
      if (!result.offline) {
        queryClient.invalidateQueries({ queryKey: ["commission", "current"] });
      }
    },
  });
}

export interface TodaySaleDraft {
  amount: string;
  returns: string;
}

/**
 * MW5 paso 1-2: determina el estado inicial del formulario de V3 consultando primero
 * `pending_sales` local por la fecha de hoy. Retorna `null` si no hay una venta local
 * pendiente para esa fecha (formulario vacío).
 */
export async function loadTodaySaleDraft(
  vendorId: string,
  saleDate: string,
): Promise<TodaySaleDraft | null> {
  const pending = await getPendingSale(vendorId, saleDate);
  if (!pending) {
    return null;
  }
  return { amount: String(pending.amount), returns: String(pending.returns) };
}
