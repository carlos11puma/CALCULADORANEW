import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeScreen } from "../../../features/home/HomeScreen";
import { HistoryScreen } from "../../../features/history/HistoryScreen";
import { NotificationsScreen } from "../../../features/notifications/NotificationsScreen";
import { SalesEntryScreen } from "../../../features/sales-entry/SalesEntryScreen";
import { useAutoSync } from "../../../features/sales-entry/useAutoSync";
import { useSession } from "../../../shared/session/SessionContext";

// VendorTabs — frontend-components.md § Jerarquía de navegación. BottomNavigation con
// Home/Historial/🔔; SalesEntryScreen (V3) es un push modal desde Home, no un tab propio.

export type VendorTabsParamList = {
  Home: undefined;
  History: undefined;
  Notifications: undefined;
};

export type VendorStackParamList = {
  VendorHome: undefined;
  SalesEntry: undefined;
};

const Tab = createBottomTabNavigator<VendorTabsParamList>();
const Stack = createNativeStackNavigator<VendorStackParamList>();

type HomeTabProps = NativeStackScreenProps<VendorStackParamList, "VendorHome">;

function VendorTabsNavigator({ navigation }: HomeTabProps): React.JSX.Element {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" options={{ title: "Inicio" }}>
        {() => <HomeScreen onEnterSale={() => navigation.navigate("SalesEntry")} />}
      </Tab.Screen>
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: "Historial" }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: "🔔" }} />
    </Tab.Navigator>
  );
}

export function VendorTabs(): React.JSX.Element {
  const { session } = useSession();
  useAutoSync(session?.role === "vendedor" ? session.userId : null); // MW8/R-03/MW9 paso 3.

  return (
    <Stack.Navigator>
      <Stack.Screen name="VendorHome" component={VendorTabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="SalesEntry"
        options={{ presentation: "modal", title: "Ingresar venta" }}
      >
        {({ navigation }) => <SalesEntryScreen onSaved={() => navigation.goBack()} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
