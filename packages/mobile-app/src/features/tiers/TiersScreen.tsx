import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { List, SegmentedButtons } from "react-native-paper";
import { PrimaryButton } from "../../shared/components/PrimaryButton";
import { ValidatedTextInput } from "../../shared/components/ValidatedTextInput";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { SkeletonListItem } from "../../shared/components/Skeletons";
import type { Channel, CommissionTierInput } from "../../shared/api/contractTypes";
import { useReplaceTiers, useTiers } from "./hooks";

// TiersScreen (A4) — functional-spec.md § MW14, frontend-components.md § A4.
// BR2.6: cada tramo editado exige un umbral y una comisión no vacíos ni negativos antes de
// permitir guardar el conjunto del canal.

interface DraftTier {
  thresholdValue: string;
  commissionRate: string;
}

export function TiersScreen(): React.JSX.Element {
  const [channel, setChannel] = useState<Channel>("preventa");
  const query = useTiers(channel);
  const replaceMutation = useReplaceTiers(channel);
  const [drafts, setDrafts] = useState<DraftTier[] | null>(null);

  const activeDrafts: DraftTier[] =
    drafts ??
    (query.data?.tiers.map((t) => ({
      thresholdValue: String(t.thresholdValue),
      commissionRate: String(t.commissionRate),
    })) ??
      []);

  const isEachTierValid = (tier: DraftTier) => {
    const threshold = parseFloat(tier.thresholdValue);
    const rate = parseFloat(tier.commissionRate);
    return tier.thresholdValue.trim() !== "" && tier.commissionRate.trim() !== "" && threshold >= 0 && rate >= 0;
  };
  const allValid = activeDrafts.length > 0 && activeDrafts.every(isEachTierValid); // BR2.6

  const updateTier = (index: number, field: keyof DraftTier, value: string) => {
    const next = [...activeDrafts];
    next[index] = { ...next[index], [field]: value };
    setDrafts(next);
  };

  const addTier = () => {
    setDrafts([...activeDrafts, { thresholdValue: "", commissionRate: "" }]);
  };

  const handleSave = async () => {
    if (!allValid) return;
    const payload: CommissionTierInput[] = activeDrafts.map((tier, index) => ({
      channel,
      tierType: "por_efectividad",
      order: index + 1,
      thresholdValue: parseFloat(tier.thresholdValue),
      commissionRate: parseFloat(tier.commissionRate),
    }));
    try {
      await replaceMutation.mutateAsync(payload);
      setDrafts(null);
    } catch {
      // MW14 paso 5 (400): el banner de validación se deriva de replaceMutation.isError arriba.
    }
  };

  if (query.isLoading) {
    return <SkeletonListItem count={3} />;
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }} testID="tiers-screen">
      <SegmentedButtons
        value={channel}
        onValueChange={(value) => {
          setChannel(value as Channel);
          setDrafts(null);
        }}
        buttons={[
          { value: "preventa", label: "Preventa", testID: "channel-preventa" },
          { value: "autoventa", label: "Autoventa", testID: "channel-autoventa" },
        ]}
      />
      {query.isError && (
        <ErrorBanner visible message="No se pudieron cargar los tramos" onRetry={() => query.refetch()} />
      )}
      {replaceMutation.isError && (
        <ErrorBanner visible message="⚠ El umbral y la comisión no pueden estar vacíos ni ser negativos" />
      )}
      {replaceMutation.data?.warning === "TIER_ORDER_WARNING" && (
        <ErrorBanner
          visible
          message="⚠ Los tramos deben quedar ordenados de menor a mayor beneficio para que la app calcule bien la oportunidad de ganancia"
        />
      )}
      <FlatList
        testID="tiers-list"
        data={activeDrafts}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: "row", gap: 8 }} testID={`tier-row-${index}`}>
            <ValidatedTextInput
              label="Umbral"
              value={item.thresholdValue}
              onChangeText={(text) => updateTier(index, "thresholdValue", text)}
              keyboardType="decimal-pad"
              testID={`tier-threshold-${index}`}
            />
            <ValidatedTextInput
              label="Comisión"
              value={item.commissionRate}
              onChangeText={(text) => updateTier(index, "commissionRate", text)}
              keyboardType="decimal-pad"
              testID={`tier-rate-${index}`}
            />
          </View>
        )}
      />
      <PrimaryButton label="+ Agregar tramo" onPress={addTier} testID="add-tier" />
      <PrimaryButton
        label="Guardar"
        onPress={handleSave}
        disabled={!allValid}
        loading={replaceMutation.isPending}
        testID="save-tiers"
      />
    </View>
  );
}
