import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Channel,
  CommissionTierInput,
  TierListResponse,
  TierSaveResponse,
} from "../../shared/api/contractTypes";
import { getTiers, replaceTiers } from "./api";

// hooks.ts — queries/mutaciones de TanStack Query para A4 Tramos de comisión (MW14).

export function useTiers(channel: Channel) {
  return useQuery<TierListResponse>({
    queryKey: ["tiers", channel],
    queryFn: () => getTiers(channel),
  });
}

export function useReplaceTiers(channel: Channel) {
  const queryClient = useQueryClient();
  return useMutation<TierSaveResponse, unknown, CommissionTierInput[]>({
    mutationFn: replaceTiers,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tiers", channel] }),
  });
}
