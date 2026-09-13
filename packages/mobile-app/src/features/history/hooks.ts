import { useQuery } from "@tanstack/react-query";
import type { CommissionPeriod } from "../../shared/api/contractTypes";
import { getCommissionHistory } from "./api";

// hooks.ts — query de TanStack Query para V4 Historial (MW10).

export function useCommissionHistory() {
  return useQuery<CommissionPeriod[]>({
    queryKey: ["commission", "history"],
    queryFn: () => getCommissionHistory(),
  });
}
