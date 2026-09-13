import React, { useState } from "react";
import { View } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RosterScreen } from "../../../features/roster/RosterScreen";
import { BudgetsScreen } from "../../../features/roster/BudgetsScreen";
import { TiersScreen } from "../../../features/tiers/TiersScreen";
import { ManualNotificationScreen } from "../../../features/manual-notification/ManualNotificationScreen";
import { useVendors } from "../../../features/roster/hooks";

// AdminTabs — frontend-components.md § Jerarquía de navegación. SegmentedButtons (no
// BottomNavigation) para Roster/Presupuestos/Tramos, per frontend-components.md § A2-A4;
// ManualNotificationScreen (A5) es accesible desde el menú de A2, no un tab propio.

export type AdminStackParamList = {
  AdminHome: undefined;
  ManualNotification: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

type AdminHomeProps = NativeStackScreenProps<AdminStackParamList, "AdminHome">;

function AdminHome({ navigation }: AdminHomeProps): React.JSX.Element {
  const [tab, setTab] = useState<"roster" | "budgets" | "tiers">("roster");

  return (
    <View style={{ flex: 1 }}>
      <SegmentedButtons
        value={tab}
        onValueChange={(value) => setTab(value as typeof tab)}
        buttons={[
          { value: "roster", label: "Roster", testID: "admin-tab-roster" },
          { value: "budgets", label: "Presupuestos", testID: "admin-tab-budgets" },
          { value: "tiers", label: "Tramos", testID: "admin-tab-tiers" },
        ]}
      />
      {tab === "roster" && (
        <RosterScreen onOpenManualNotification={() => navigation.navigate("ManualNotification")} />
      )}
      {tab === "budgets" && <BudgetsScreen />}
      {tab === "tiers" && <TiersScreen />}
    </View>
  );
}

function ManualNotificationRoute(): React.JSX.Element {
  const { data: vendors } = useVendors();
  return <ManualNotificationScreen vendors={vendors ?? []} />;
}

export function AdminTabs(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminHome} options={{ title: "Panel de administración" }} />
      <Stack.Screen
        name="ManualNotification"
        component={ManualNotificationRoute}
        options={{ title: "Enviar notificación" }}
      />
    </Stack.Navigator>
  );
}
