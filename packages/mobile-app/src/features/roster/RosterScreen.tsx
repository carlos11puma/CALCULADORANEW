import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { List, SegmentedButtons, Text } from "react-native-paper";
import { PrimaryButton } from "../../shared/components/PrimaryButton";
import { ValidatedTextInput } from "../../shared/components/ValidatedTextInput";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { SkeletonListItem } from "../../shared/components/Skeletons";
import type { Channel } from "../../shared/api/contractTypes";
import { useCreateVendor, useVendors } from "./hooks";

// RosterScreen (A2) — functional-spec.md § MW12, frontend-components.md § A2.
// BR2.4: el formulario de alta exige ruta, nombre y canal antes de permitir "Agregar".

export interface RosterScreenProps {
  onOpenManualNotification?: () => void;
}

export function RosterScreen({ onOpenManualNotification }: RosterScreenProps): React.JSX.Element {
  const query = useVendors();
  const createMutation = useCreateVendor();

  const [route, setRoute] = useState("");
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("preventa");
  const [formVisible, setFormVisible] = useState(false);

  const canSubmit = route.trim() !== "" && name.trim() !== "" && Boolean(channel); // BR2.4

  const handleAdd = async () => {
    if (!canSubmit) return;
    try {
      await createMutation.mutateAsync({ route, name, channel, budget: 0 });
      setRoute("");
      setName("");
      setFormVisible(false);
    } catch {
      // MW12 paso 2 (400): el banner de validación se deriva de createMutation.isError abajo.
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }} testID="roster-screen">
      {onOpenManualNotification && (
        <Text onPress={onOpenManualNotification} testID="open-manual-notification">
          📣 Enviar notificación manual
        </Text>
      )}
      {query.isLoading && <SkeletonListItem count={3} />}
      {query.isError && (
        <ErrorBanner visible message="No se pudo cargar el roster" onRetry={() => query.refetch()} />
      )}
      {query.isSuccess && (
        <FlatList
          testID="roster-list"
          data={query.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${item.route} · ${item.channel} · Presupuesto: $${item.budget}`}
              testID={`vendor-${item.id}`}
            />
          )}
        />
      )}
      {formVisible ? (
        <View style={{ gap: 8 }} testID="add-vendor-form">
          {createMutation.isError && (
            <ErrorBanner visible message="No se pudo agregar el vendedor, revisa los datos" />
          )}
          <ValidatedTextInput label="Ruta" value={route} onChangeText={setRoute} testID="vendor-route" />
          <ValidatedTextInput label="Nombre" value={name} onChangeText={setName} testID="vendor-name" />
          <SegmentedButtons
            value={channel}
            onValueChange={(value) => setChannel(value as Channel)}
            buttons={[
              { value: "preventa", label: "Preventa" },
              { value: "autoventa", label: "Autoventa" },
            ]}
          />
          <PrimaryButton
            label="Agregar"
            onPress={handleAdd}
            disabled={!canSubmit}
            loading={createMutation.isPending}
            testID="submit-add-vendor"
          />
        </View>
      ) : (
        <PrimaryButton label="+ Agregar" onPress={() => setFormVisible(true)} testID="open-add-vendor" />
      )}
    </View>
  );
}
