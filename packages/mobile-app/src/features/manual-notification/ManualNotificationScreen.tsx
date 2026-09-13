import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { Checkbox, RadioButton, Snackbar, Text } from "react-native-paper";
import { PrimaryButton } from "../../shared/components/PrimaryButton";
import { ValidatedTextInput } from "../../shared/components/ValidatedTextInput";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import type { Vendor } from "../../shared/api/contractTypes";
import { useSendManualNotification } from "./hooks";

// ManualNotificationScreen (A5) — functional-spec.md § MW15, frontend-components.md § A5.
// BR9.3: "Enviar notificación" permanece deshabilitado si el mensaje está vacío o no hay
// destinatarios seleccionados (modo Un/Varios).

export type ManualNotificationMode = "one" | "several" | "all";

export interface ManualNotificationScreenProps {
  vendors: Vendor[];
}

export function ManualNotificationScreen({ vendors }: ManualNotificationScreenProps): React.JSX.Element {
  const [mode, setMode] = useState<ManualNotificationMode>("one");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const mutation = useSendManualNotification();

  const toggleVendor = (vendorId: string) => {
    setSelectedVendorIds((current) => {
      if (mode === "one") {
        return current.includes(vendorId) ? [] : [vendorId];
      }
      return current.includes(vendorId)
        ? current.filter((id) => id !== vendorId)
        : [...current, vendorId];
    });
  };

  const canSubmit =
    message.trim() !== "" && (mode === "all" || selectedVendorIds.length > 0); // BR9.3

  const handleSend = async () => {
    if (!canSubmit) return;
    const recipients = mode === "all" ? "all" : selectedVendorIds;
    try {
      await mutation.mutateAsync({ message, recipients });
      const count = mode === "all" ? vendors.length : selectedVendorIds.length;
      setSuccessCount(count);
      setMessage("");
      setSelectedVendorIds([]);
    } catch {
      // MW15 paso 5 (400): banner de validación derivado de mutation.isError abajo.
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }} testID="manual-notification-screen">
      {mutation.isError && <ErrorBanner visible message="⚠ Escribe un mensaje antes de enviar" />}
      <RadioButton.Group value={mode} onValueChange={(value) => setMode(value as ManualNotificationMode)}>
        <RadioButton.Item label="Un vendedor" value="one" testID="mode-one" />
        <RadioButton.Item label="Varios vendedores" value="several" testID="mode-several" />
        <RadioButton.Item label="Todos los vendedores" value="all" testID="mode-all" />
      </RadioButton.Group>
      {mode !== "all" && (
        <FlatList
          testID="recipient-list"
          data={vendors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Checkbox.Item
              label={item.name}
              status={selectedVendorIds.includes(item.id) ? "checked" : "unchecked"}
              onPress={() => toggleVendor(item.id)}
              testID={`recipient-${item.id}`}
            />
          )}
        />
      )}
      <ValidatedTextInput
        label="Mensaje"
        value={message}
        onChangeText={setMessage}
        multiline
        testID="manual-message"
      />
      <PrimaryButton
        label="Enviar notificación"
        onPress={handleSend}
        disabled={!canSubmit}
        loading={mutation.isPending}
        testID="send-manual-notification"
      />
      <Snackbar
        visible={successCount !== null}
        onDismiss={() => setSuccessCount(null)}
        duration={3000}
        testID="manual-notification-success"
      >
        {successCount !== null ? `Notificación enviada a ${successCount} vendedores` : ""}
      </Snackbar>
    </View>
  );
}
