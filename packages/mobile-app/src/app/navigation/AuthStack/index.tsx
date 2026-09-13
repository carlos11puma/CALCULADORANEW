import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { VendorLoginScreen } from "../../../features/auth/VendorLoginScreen";
import { SupervisorLoginScreen } from "../../../features/auth/SupervisorLoginScreen";

// AuthStack — frontend-components.md § Jerarquía de navegación. Activo cuando no hay sesión
// (SessionContext.session === null): V1 (login vendedor) y A1 (login PIN supervisor), con un
// enlace cruzado entre ambas para que el usuario elija su rol de ingreso.

export type AuthStackParamList = {
  VendorLogin: undefined;
  SupervisorLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorLogin" component={VendorLoginScreen} />
      <Stack.Screen name="SupervisorLogin" component={SupervisorLoginScreen} />
    </Stack.Navigator>
  );
}
