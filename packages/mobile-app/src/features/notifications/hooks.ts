import { useQuery } from "@tanstack/react-query";
import type { AppNotification } from "../../shared/api/contractTypes";
import { getNotifications } from "./api";

// hooks.ts — query de TanStack Query para V5 Notificaciones (MW11 paso 2).

export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
}
