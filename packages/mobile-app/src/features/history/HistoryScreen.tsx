import React from "react";
import { FlatList, View } from "react-native";
import { List, Text } from "react-native-paper";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { SkeletonListItem } from "../../shared/components/Skeletons";
import { useCommissionHistory } from "./hooks";

// HistoryScreen (V4) — functional-spec.md § MW10, frontend-components.md § V4.

export function HistoryScreen(): React.JSX.Element {
  const query = useCommissionHistory();

  if (query.isLoading) {
    return <SkeletonListItem count={3} />;
  }

  if (query.isError) {
    return (
      <View style={{ padding: 16 }}>
        <ErrorBanner
          visible
          message="No se pudo cargar tu historial, desliza para reintentar"
          onRetry={() => query.refetch()}
        />
      </View>
    );
  }

  const periods = query.data ?? [];
  if (periods.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text testID="history-empty">Aún no tienes períodos cerrados</Text>
      </View>
    );
  }

  return (
    <FlatList
      testID="history-list"
      data={periods}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <List.Item
          title={item.periodMonth}
          description={`Venta: $${item.accumulatedSales.toFixed(2)} · Comisión: $${item.commissionEarned.toFixed(2)}`}
          testID={`history-item-${item.id}`}
        />
      )}
    />
  );
}
