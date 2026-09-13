import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { List } from "react-native-paper";
import { PrimaryButton } from "../../shared/components/PrimaryButton";
import { ValidatedTextInput } from "../../shared/components/ValidatedTextInput";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { SkeletonListItem } from "../../shared/components/Skeletons";
import { useUpdateVendor, useVendors } from "./hooks";

// BudgetsScreen (A3) — functional-spec.md § MW13, frontend-components.md § A3.
// BR2.5: el campo "Presupuesto" exige un valor mayor a 0 antes de permitir "Guardar".

export function BudgetsScreen(): React.JSX.Element {
  const query = useVendors();
  const updateMutation = useUpdateVendor();
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [draftBudget, setDraftBudget] = useState("");

  const startEdit = (vendorId: string, currentBudget: number) => {
    setEditingVendorId(vendorId);
    setDraftBudget(String(currentBudget));
  };

  const parsedBudget = parseFloat(draftBudget);
  const isBudgetValid = draftBudget.trim() !== "" && !Number.isNaN(parsedBudget) && parsedBudget > 0; // BR2.5

  const handleSave = async (vendorId: string) => {
    if (!isBudgetValid) return;
    const vendor = query.data?.find((v) => v.id === vendorId);
    if (!vendor) return;
    try {
      await updateMutation.mutateAsync({
        vendorId,
        input: { route: vendor.route, name: vendor.name, channel: vendor.channel, budget: parsedBudget },
      });
      setEditingVendorId(null);
    } catch {
      // MW13 paso 3 (400): el banner de validación se deriva de updateMutation.isError abajo.
    }
  };

  if (query.isLoading) {
    return <SkeletonListItem count={3} />;
  }

  if (query.isError) {
    return (
      <View style={{ padding: 16 }}>
        <ErrorBanner visible message="No se pudo cargar el roster" onRetry={() => query.refetch()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }} testID="budgets-screen">
      {updateMutation.isError && (
        <ErrorBanner visible message="⚠ El presupuesto debe ser mayor a 0" />
      )}
      <FlatList
        testID="budgets-list"
        data={query.data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          editingVendorId === item.id ? (
            <View style={{ gap: 8, paddingVertical: 8 }} testID={`budget-edit-${item.id}`}>
              <ValidatedTextInput
                label="Presupuesto"
                value={draftBudget}
                onChangeText={setDraftBudget}
                keyboardType="decimal-pad"
                error={!isBudgetValid ? "⚠ El presupuesto debe ser mayor a 0" : undefined}
                testID={`budget-input-${item.id}`}
              />
              <PrimaryButton
                label="Guardar"
                onPress={() => handleSave(item.id)}
                disabled={!isBudgetValid}
                loading={updateMutation.isPending}
                testID={`budget-save-${item.id}`}
              />
            </View>
          ) : (
            <List.Item
              title={item.name}
              description={`Presupuesto: $${item.budget}`}
              onPress={() => startEdit(item.id, item.budget)}
              testID={`budget-item-${item.id}`}
            />
          )
        }
      />
    </View>
  );
}
