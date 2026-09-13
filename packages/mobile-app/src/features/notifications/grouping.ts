import type { AppNotification, NotificationType } from "../../shared/api/contractTypes";

// grouping.ts — agrupación en cliente de notificaciones por `type` (V5, functional-spec.md
// § MW11 paso 3, frontend-components.md § V5). Decisión de presentación de esta pantalla, no
// del backend, que entrega la lista plana (GET /api/v1/notifications).

export interface NotificationGroup {
  key: NotificationType;
  title: string;
  icon: string;
  items: AppNotification[];
}

const GROUP_ORDER: { key: NotificationType; title: string; icon: string }[] = [
  { key: "umbral_venta", title: "VENTA Y PRESUPUESTO", icon: "🎯" },
  { key: "umbral_devolucion", title: "DEVOLUCIÓN", icon: "📉" },
  { key: "manual", title: "DEL SUPERVISOR", icon: "📣" },
];

/**
 * Agrupa por `type` en tres secciones fijas (venta/presupuesto, devolución, del supervisor),
 * cada grupo ordenado por `sentAt` descendente (más reciente primero). Los grupos sin
 * notificaciones no se incluyen en el resultado.
 */
export function groupNotifications(notifications: AppNotification[]): NotificationGroup[] {
  const byType = new Map<NotificationType, AppNotification[]>();
  for (const notification of notifications) {
    const bucket = byType.get(notification.type) ?? [];
    bucket.push(notification);
    byType.set(notification.type, bucket);
  }

  return GROUP_ORDER.map(({ key, title, icon }) => ({
    key,
    title,
    icon,
    items: [...(byType.get(key) ?? [])].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
    ),
  })).filter((group) => group.items.length > 0);
}
