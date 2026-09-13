import React from "react";
import { Banner } from "react-native-paper";

// ErrorBanner — frontend-components.md § Componentes compartidos. Cualquier pantalla con
// estado `error`; `onRetry` habilita el patrón pull-to-refresh de MW4 paso 3.

export interface ErrorBannerProps {
  visible: boolean;
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ visible, message, onRetry }: ErrorBannerProps): React.JSX.Element {
  const actions = onRetry ? [{ label: "Reintentar", onPress: onRetry }] : [];
  return (
    <Banner visible={visible} actions={actions} testID="error-banner">
      {message}
    </Banner>
  );
}
