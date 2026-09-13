import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Card, Chip, ProgressBar, Text } from "react-native-paper";
import { PrimaryButton } from "../../shared/components/PrimaryButton";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { SkeletonCard } from "../../shared/components/Skeletons";
import { SyncStatusIcon } from "../../shared/components/SyncStatusIcon";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { useSession } from "../../shared/session/SessionContext";
import { useCurrentCommission } from "./hooks";
import { computeReturnRateTrend, type ReturnRateTrend } from "./returnRateTrend";
import { listPendingSales } from "../../shared/storage/pendingSalesDb";

// HomeScreen (V2) — functional-spec.md § MW4, frontend-components.md § V2.
// `CommissionCard` muestra `commissionEarned` (dato más prominente), `budgetProgress` con
// color dinámico, y el indicador de tendencia de devolución (▼ mejora / ▲ empeora).

export interface HomeScreenProps {
  onEnterSale: () => void;
}

export function HomeScreen({ onEnterSale }: HomeScreenProps): React.JSX.Element {
  const { session, logout } = useSession();
  const vendorId = session?.userId ?? null;
  const query = useCurrentCommission();
  const [pendingCount, setPendingCount] = useState(0);
  const [trend, setTrend] = useState<ReturnRateTrend>("flat");
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    listPendingSales(vendorId).then((rows) => setPendingCount(rows.length));
  }, [vendorId, query.data]);

  useEffect(() => {
    if (!vendorId || query.data == null) return;
    computeReturnRateTrend(vendorId, query.data.returnRate).then(setTrend);
  }, [vendorId, query.data?.returnRate]);

  if (query.isLoading) {
    return <SkeletonCard />;
  }

  if (query.isError) {
    return (
      <View style={{ padding: 16 }}>
        <ErrorBanner
          visible
          message="No se pudo cargar tu comisión, desliza para reintentar"
          onRetry={() => query.refetch()}
        />
      </View>
    );
  }

  const commission = query.data;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} testID="home-screen">
      <Card testID="commission-card">
        <Card.Content style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="headlineLarge" testID="commission-earned">
              ${commission?.commissionEarned.toFixed(2)}
            </Text>
            <SyncStatusIcon pendingCount={pendingCount} />
          </View>
          <ProgressBar
            progress={Math.min((commission?.budgetProgress ?? 0) / 100, 1)}
            color={(commission?.budgetProgress ?? 0) >= 100 ? "#EF6C00" : "#2E7D32"}
            testID="budget-progress"
          />
          <Chip icon={trend === "down" ? "arrow-down" : trend === "up" ? "arrow-up" : "minus"} testID="return-rate-chip">
            Devolución: {commission?.returnRate.toFixed(1)}%
          </Chip>
        </Card.Content>
      </Card>
      <PrimaryButton label="Ingresar venta de hoy" onPress={onEnterSale} testID="go-to-sales-entry" />
      <Text onPress={() => setLogoutDialogVisible(true)} testID="open-logout-dialog">
        Cerrar sesión
      </Text>
      <ConfirmDialog
        visible={logoutDialogVisible}
        title="Cerrar sesión"
        message="¿Seguro que deseas cerrar sesión?"
        confirmLabel="Cerrar sesión"
        onCancel={() => setLogoutDialogVisible(false)}
        onConfirm={async () => {
          setLogoutDialogVisible(false);
          await logout(); // MW3 — best-effort, navega a V1 vía RootNavigator al perder la sesión.
        }}
      />
    </ScrollView>
  );
}
