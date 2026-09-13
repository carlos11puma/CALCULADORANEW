import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { List, Text } from "react-native-paper";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { SkeletonListItem } from "../../shared/components/Skeletons";
import { useNotifications } from "./hooks";
import { groupNotifications } from "./grouping";

// NotificationsScreen (V5) — functional-spec.md § MW11, frontend-components.md § V5.
// La agrupación por type se calcula con useMemo sobre el resultado ya cacheado por TanStack
// Query (performance-design.md § Transformaciones en cliente, NFR1.7).

export function NotificationsScreen(): React.JSX.Element {
  const query = useNotifications();
  const groups = useMemo(() => groupNotifications(query.data ?? []), [query.data]);

  if (query.isLoading) {
    return <SkeletonListItem count={3} />;
  }

  if (query.isError) {
    return (
      <View style={{ padding: 16 }}>
        <ErrorBanner
          visible
          message="No se pudieron cargar tus notificaciones, desliza para reintentar"
          onRetry={() => query.refetch()}
        />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text testID="notifications-empty">Aún no tienes notificaciones</Text>
      </View>
    );
  }

  return (
    <ScrollView testID="notifications-list">
      {groups.map((group) => (
        <List.Section key={group.key} title={`${group.icon} ${group.title}`} testID={`notifications-group-${group.key}`}>
          {group.items.map((notification) => (
            <List.Item
              key={notification.id}
              title={notification.message}
              titleStyle={notification.read ? undefined : { fontWeight: "bold" }}
              description={
                notification.earningOpportunity
                  ? `Podrías ganar $${notification.earningOpportunity.potentialGain} más si llegas a ${notification.earningOpportunity.nextTierThreshold}%`
                  : undefined
              }
              testID={`notification-${notification.id}`}
            />
          ))}
        </List.Section>
      ))}
    </ScrollView>
  );
}
