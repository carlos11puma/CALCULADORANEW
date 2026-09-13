import React from "react";
import { Button } from "react-native-paper";

// PrimaryButton — frontend-components.md § Componentes compartidos. Base Button(mode="contained").
// Usado en toda pantalla con una acción principal (V1, A1, V3, A2-A5).

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  testID = "primary-button",
}: PrimaryButtonProps): React.JSX.Element {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {label}
    </Button>
  );
}
