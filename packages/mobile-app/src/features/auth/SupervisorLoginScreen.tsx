import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "../../shared/components/PrimaryButton";
import { ValidatedTextInput } from "../../shared/components/ValidatedTextInput";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { useSession } from "../../shared/session/SessionContext";
import { useLoginSupervisor } from "./hooks";
import type { AuthStackParamList } from "../../app/navigation/AuthStack";

// SupervisorLoginScreen (A1) — functional-spec.md § MW2, frontend-components.md § A1.
// BR1.7: el botón "Ingresar" permanece deshabilitado hasta que el PIN tenga exactamente 4 dígitos.

type Props = NativeStackScreenProps<AuthStackParamList, "SupervisorLogin">;

export function SupervisorLoginScreen({ navigation }: Props): React.JSX.Element {
  const [pin, setPin] = useState("");
  const { login } = useSession();
  const mutation = useLoginSupervisor();

  const canSubmit = pin.length === 4; // BR1.7

  const handlePinChange = (text: string) => {
    setPin(text.replace(/[^0-9]/g, "").slice(0, 4));
  };

  const handleSubmit = async () => {
    try {
      const result = await mutation.mutateAsync({ pin });
      await login(result); // MW2 paso 3: guarda sesión rol=supervisor, navega a Roster (A2).
    } catch {
      // MW2 paso 4: banner "PIN incorrecto", no bloquea reintento.
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="headlineMedium">Ingresar con PIN</Text>
      <ErrorBanner visible={mutation.isError} message="PIN incorrecto" />
      <ValidatedTextInput
        label="PIN"
        value={pin}
        onChangeText={handlePinChange}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        testID="login-pin"
      />
      <PrimaryButton
        label="Ingresar"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={mutation.isPending}
        testID="login-submit"
      />
      <Text onPress={() => navigation.navigate("VendorLogin")} testID="go-to-vendor-login">
        ¿Eres vendedor? Ingresa con usuario y contraseña
      </Text>
    </View>
  );
}
