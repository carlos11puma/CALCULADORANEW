import React from "react";
import { Banner } from "react-native-paper";

// OfflineBanner — frontend-components.md § Componentes compartidos. V2, V3
// (mensaje "↻ Sin conexión..." de MW5 paso 4 / MW7).

export interface OfflineBannerProps {
  visible: boolean;
  message?: string;
}

const DEFAULT_MESSAGE =
  "↻ Sin conexión: se guardará localmente y sincronizará cuando vuelva la señal";

export function OfflineBanner({ visible, message = DEFAULT_MESSAGE }: OfflineBannerProps): React.JSX.Element {
  return (
    <Banner visible={visible} actions={[]} testID="offline-banner">
      {message}
    </Banner>
  );
}
