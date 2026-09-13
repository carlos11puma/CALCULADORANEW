import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// queryTestUtils.tsx — wrapper de QueryClientProvider reutilizable para pruebas de hooks de
// TanStack Query (Step 8/12 del plan de code-generation). `retry: false` evita que un fallo
// esperado en una prueba se reintente y haga la prueba lenta/flaky.

export function createQueryWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    // `gcTime: 0` evita que TanStack Query deje un `setTimeout` de garbage-collection vivo
    // tras cada prueba (mantendría el proceso de Jest abierto esperando a que expire).
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}
