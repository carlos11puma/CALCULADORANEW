import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Vendor, VendorInput } from "../../shared/api/contractTypes";
import { createVendor, getVendors, updateVendor } from "./api";

// hooks.ts — queries/mutaciones de TanStack Query para A2 Roster (MW12) y A3 Presupuestos
// (MW13, comparte los mismos `vendors` per frontend-components.md § A3).

export function useVendors() {
  return useQuery<Vendor[]>({ queryKey: ["vendors"], queryFn: getVendors });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation<Vendor, unknown, VendorInput>({
    mutationFn: createVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation<Vendor, unknown, { vendorId: string; input: VendorInput }>({
    mutationFn: ({ vendorId, input }) => updateVendor(vendorId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
  });
}
