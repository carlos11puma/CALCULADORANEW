import { apiClient } from "../../shared/api/apiClient";
import type { AppNotification } from "../../shared/api/contractTypes";

// features/notifications/api.ts — Contrato 6 (Notification), GET /notifications. MW11.

export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await apiClient.get<AppNotification[]>("/notifications");
  return data;
}
