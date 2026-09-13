import { useMutation } from "@tanstack/react-query";
import type { ManualNotificationInput } from "../../shared/api/contractTypes";
import { sendManualNotification } from "./api";

// hooks.ts — mutación de TanStack Query para A5 Enviar notificación manual (MW15).

export function useSendManualNotification() {
  return useMutation<void, unknown, ManualNotificationInput>({
    mutationFn: sendManualNotification,
  });
}
