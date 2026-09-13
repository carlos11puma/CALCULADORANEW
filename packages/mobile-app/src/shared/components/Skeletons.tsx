import React from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

// SkeletonCard / SkeletonListItem — frontend-components.md § Componentes compartidos.
// Fallback de bajo costo con ActivityIndicator (design-system-mapping.md), usado en V2, V4,
// A2 mientras `isLoading` de TanStack Query es verdadero (performance-design.md § Estados de
// carga — no hay máquina de estados de carga paralela).

export function SkeletonCard(): React.JSX.Element {
  return (
    <View testID="skeleton-card" accessibilityLabel="Cargando" accessibilityRole="progressbar">
      <ActivityIndicator animating size="large" />
    </View>
  );
}

export interface SkeletonListItemProps {
  count?: number;
}

export function SkeletonListItem({ count = 3 }: SkeletonListItemProps): React.JSX.Element {
  return (
    <View testID="skeleton-list" accessibilityLabel="Cargando" accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, index) => (
        <ActivityIndicator key={index} animating testID={`skeleton-list-item-${index}`} />
      ))}
    </View>
  );
}
