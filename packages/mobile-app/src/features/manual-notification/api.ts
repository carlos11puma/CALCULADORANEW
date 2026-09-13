import { apiClient } from "../../shared/api/apiClient";
import type { ManualNotificationInput } from "../../shared/api/contractTypes";

// features/manual-notification/api.ts — Contrato 6 (Notification), POST /notifications/manual.
// MW15 (A5 Enviar notificación manual).

export async function sendManualNotification(input: ManualNotificationInput): Promise<void> {
  await apiClient.post("/notifications/manual", input);
}
