import React from "react";
import { View } from "react-native";
import { Badge, IconButton } from "react-native-paper";

// SyncStatusIcon — frontend-components.md § Componentes compartidos. Ícono ↻ custom sobre
// IconButton; visible en V2 (junto al monto de comisión, MW4 paso 5) y V3 (banner) cuando hay
// filas en `pending_sales` sin sincronizar.

export interface SyncStatusIconProps {
  pendingCount: number;
}

export function SyncStatusIcon({ pendingCount }: SyncStatusIconProps): React.JSX.Element | null {
  if (pendingCount <= 0) {
    return null;
  }
  return (
    <View
      testID="sync-status-icon"
      accessibilityLabel={`${pendingCount} venta${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"} de sincronizar`}
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <IconButton icon="sync" size={20} disabled testID="sync-status-icon-button" />
      <Badge testID="sync-status-badge">{pendingCount}</Badge>
    </View>
  );
}
