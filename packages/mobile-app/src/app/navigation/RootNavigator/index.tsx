import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSession } from "../../../shared/session/SessionContext";
import { SessionGate } from "../../../shared/components/SessionGate";
import { AuthStack } from "../AuthStack";
import { VendorTabs } from "../VendorTabs";
import { AdminTabs } from "../AdminTabs";

// RootNavigator — functional-spec.md § Estado de sesión (transversal). Decide entre
// AuthStack (sin sesión) / VendorTabs (rol=vendedor) / AdminTabs (rol=supervisor) según
// `SessionContext`, que reacciona a MW1/MW2 (login), MW3 (logout) y MW9 (401 inesperado).

export function RootNavigator(): React.JSX.Element | null {
  const { session, status } = useSession();

  if (status === "loading") {
    return null; // La pantalla de arranque nativa (splash de Expo) cubre este instante.
  }

  return (
    <NavigationContainer>
      <SessionGate>
        {!session && <AuthStack />}
        {session?.role === "vendedor" && <VendorTabs />}
        {session?.role === "supervisor" && <AdminTabs />}
      </SessionGate>
    </NavigationContainer>
  );
}
