import React from "react";
import { Snackbar } from "react-native-paper";
import { useSession } from "../session/SessionContext";

// SessionGate — frontend-components.md § Componentes compartidos ("no visual"): envuelve
// VendorTabs/AdminTabs y escucha el interceptor 401 de MW9. La redirección en sí ocurre
// porque `RootNavigator` reacciona a `session` volviéndose `null` (SessionContext); el único
// elemento visible que aporta este componente es el mensaje "Tu sesión expiró, ingresa de
// nuevo" (MW9 paso 2), mostrado como Snackbar sobre la pantalla de login a la que se navegó.

export function SessionGate({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { expiredMessage, clearExpiredMessage } = useSession();
  return (
    <>
      {children}
      <Snackbar
        visible={Boolean(expiredMessage)}
        onDismiss={clearExpiredMessage}
        duration={4000}
        testID="session-expired-snackbar"
      >
        {expiredMessage ?? ""}
      </Snackbar>
    </>
  );
}
