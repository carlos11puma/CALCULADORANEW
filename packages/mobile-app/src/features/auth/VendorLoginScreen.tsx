import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "../../shared/components/PrimaryButton";
import { ValidatedTextInput } from "../../shared/components/ValidatedTextInput";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { useSession } from "../../shared/session/SessionContext";
import { useLoginVendedor } from "./hooks";
import type { AuthStackParamList } from "../../app/navigation/AuthStack";

// VendorLoginScreen (V1) — functional-spec.md § MW1, frontend-components.md § V1.
// BR1.6: el botón "Ingresar" permanece deshabilitado hasta que usuario y contraseña tengan
// contenido (validación de UX inmediata, no de negocio).

type Props = NativeStackScreenProps<AuthStackParamList, "VendorLogin">;

export function VendorLoginScreen({ navigation }: Props): React.JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useSession();
  const mutation = useLoginVendedor();

  const canSubmit = username.trim().length > 0 && password.trim().length > 0; // BR1.6

  const handleSubmit = async () => {
    try {
      const result = await mutation.mutateAsync({ username, password });
      await login(result); // MW1 paso 3: guarda token/userId/role, navega a Home vía RootNavigator.
    } catch {
      // El banner de error se deriva de mutation.isError; MW1 paso 4: no se limpian los campos.
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="headlineMedium">Ingresar</Text>
      <ErrorBanner
        visible={mutation.isError}
        message="Usuario o contraseña incorrectos"
      />
      <ValidatedTextInput label="Usuario" value={username} onChangeText={setUsername} testID="login-username" />
      <ValidatedTextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="login-password"
      />
      <PrimaryButton
        label="Ingresar"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={mutation.isPending}
        testID="login-submit"
      />
      <Text onPress={() => navigation.navigate("SupervisorLogin")} testID="go-to-supervisor-login">
        ¿Eres supervisor? Ingresa con PIN
      </Text>
    </View>
  );
}
