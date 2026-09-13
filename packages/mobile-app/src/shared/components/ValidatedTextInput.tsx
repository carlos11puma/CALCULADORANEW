import React from "react";
import type { KeyboardTypeOptions } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

// ValidatedTextInput — frontend-components.md § Componentes compartidos. Base
// TextInput(mode="outlined") + HelperText. El HelperText de error se asocia vía
// accessibilityLabel/accessibilityHint (frontend-components.md § Accesibilidad) para que el
// lector de pantalla anuncie el error al enfocar el campo, no solo visualmente.

export interface ValidatedTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  maxLength?: number;
  testID?: string;
}

export function ValidatedTextInput({
  label,
  value,
  onChangeText,
  error,
  keyboardType,
  secureTextEntry,
  multiline,
  maxLength,
  testID,
}: ValidatedTextInputProps): React.JSX.Element {
  const hasError = Boolean(error);
  const inputTestID = testID ?? `input-${label}`;
  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={hasError}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        maxLength={maxLength}
        testID={inputTestID}
        accessibilityLabel={label}
        accessibilityHint={hasError ? error : undefined}
      />
      {hasError && (
        <HelperText type="error" visible testID={`${inputTestID}-error`}>
          {error}
        </HelperText>
      )}
    </>
  );
}
