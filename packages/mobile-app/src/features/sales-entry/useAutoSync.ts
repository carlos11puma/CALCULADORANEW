import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentConnectivity, onReconnect } from "../../shared/net/connectivity";
import { runSync } from "./syncEngine";

// useAutoSync.ts — dispara el motor de sincronización de MW8 en dos condiciones (montado una
// vez que hay sesión de vendedor activa, típicamente desde VendorTabs):
//  1. Al arrancar/montar, si ya hay conexión disponible en ese momento (cierra R-03 de la
//     revisión de functional-design.md — cubre reabrir la app ya conectado, sin que ocurra una
//     transición dentro de esa sesión).
//  2. En cada transición sin-conexión → con-conexión detectada por `netinfo` (Q2/Q3, MW8 paso 1).
// También cubre MW9 paso 3 (re-login exitoso dispara sync de inmediato) porque el componente
// que llama a este hook se monta recién cuando `session` pasa a tener un `vendorId` válido.

export function useAutoSync(vendorId: string | null): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!vendorId) {
      return undefined;
    }
    let cancelled = false;

    const trigger = async () => {
      const outcome = await runSync(vendorId);
      if (!cancelled && outcome.appliedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ["commission", "current"] });
      }
    };

    getCurrentConnectivity().then((online) => {
      if (online && !cancelled) {
        void trigger();
      }
    });

    const unsubscribe = onReconnect(() => {
      void trigger();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [vendorId, queryClient]);
}
