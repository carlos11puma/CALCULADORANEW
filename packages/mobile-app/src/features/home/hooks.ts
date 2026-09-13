import { useQuery } from "@tanstack/react-query";
import type { CommissionPeriod } from "../../shared/api/contractTypes";
import { getCurrentCommission } from "./api";

// hooks.ts — query de TanStack Query para V2 Home (MW4). Clave `['commission','current']`
// (performance-design.md § Invalidación de la consulta de comisión) — MW6 y MW8 invalidan
// esta misma clave en su `onSuccess`, así que Home se refresca automáticamente sin acción del
// vendedor (AC5.3.1).

export function useCurrentCommission() {
  return useQuery<CommissionPeriod>({
    queryKey: ["commission", "current"],
    queryFn: getCurrentCommission,
  });
}
