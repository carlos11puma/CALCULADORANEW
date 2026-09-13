import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SessionProvider } from "../shared/session/SessionContext";
import { RootNavigator } from "./navigation/RootNavigator";
import { theme } from "../shared/theme";

// src/app/index.tsx — composición raíz de la app (logical-components.md § Estructura de
// carpetas). Excluido de cobertura (jest.config.js) — es la única "capa de cableado", sin
// lógica propia que probar; App.tsx en la raíz del workspace lo re-exporta como entry point
// de Expo (`main: node_modules/expo/AppEntry.js` en package.json).

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </PaperProvider>
      </QueryClientProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
