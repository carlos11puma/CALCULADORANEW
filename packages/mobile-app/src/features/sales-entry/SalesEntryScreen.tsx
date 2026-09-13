import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { PrimaryButton } from "../../shared/components/PrimaryButton";
import { ValidatedTextInput } from "../../shared/components/ValidatedTextInput";
import { OfflineBanner } from "../../shared/components/OfflineBanner";
import { useSession } from "../../shared/session/SessionContext";
import { useSaveSale, loadTodaySaleDraft } from "./hooks";
import { getCurrentConnectivity } from "../../shared/net/connectivity";

// SalesEntryScreen (V3) — functional-spec.md § MW5/MW6/MW7, frontend-components.md § V3.
// BR3.6: el botón "Guardar venta" permanece deshabilitado si el monto está vacío o ≤ 0; el
// banner de validación solo aparece tras un primer intento de guardado inválido.

export interface SalesEntryScreenProps {
  onSaved: () => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SalesEntryScreen({ onSaved }: SalesEntryScreenProps): React.JSX.Element {
  const { session } = useSession();
  const vendorId = session?.userId ?? null;
  const saleDate = todayIso();

  const [amount, setAmount] = useState("");
  const [returns, setReturns] = useState("");
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const mutation = useSaveSale(vendorId);

  // MW5: carga el estado inicial consultando primero pending_sales local por la fecha de hoy.
  useEffect(() => {
    if (!vendorId) return;
    loadTodaySaleDraft(vendorId, saleDate).then((draft) => {
      if (draft) {
        setAmount(draft.amount);
        setReturns(draft.returns);
      }
    });
    getCurrentConnectivity().then(setIsOffline0);
    function setIsOffline0(online: boolean) {
      setIsOffline(!online);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = amount.trim() !== "" && !Number.isNaN(parsedAmount) && parsedAmount > 0; // BR3.6

  const handleSave = async () => {
    setAttemptedSave(true);
    if (!isAmountValid || readOnly) {
      return;
    }
    try {
      const result = await mutation.mutateAsync({
        saleDate,
        amount: parsedAmount,
        returns: returns.trim() === "" ? 0 : parseFloat(returns),
      });
      setIsOffline(result.offline);
      onSaved(); // MW6 paso 3 / MW7 paso 2: vuelve a Home.
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setReadOnly(true); // MW6 paso 5 — "Este día ya cerró".
      }
      // 400: banner inline de validación (mutation.isError abajo), no navega (MW6 paso 4).
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} testID="sales-entry-screen">
      <Text variant="titleMedium" testID="sale-date">
        {saleDate}
      </Text>
      <OfflineBanner visible={isOffline && !readOnly} />
      {readOnly && (
        <Text testID="period-closed-notice" accessibilityRole="alert">
          Este día ya cerró
        </Text>
      )}
      <ValidatedTextInput
        label="Monto vendido"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        error={attemptedSave && !isAmountValid ? "⚠ Ingresa un monto válido (mayor a 0)" : undefined}
        testID="sale-amount"
      />
      <ValidatedTextInput
        label="Devoluciones"
        value={returns}
        onChangeText={setReturns}
        keyboardType="decimal-pad"
        testID="sale-returns"
      />
      {mutation.isError && (
        <Text testID="sale-save-error" accessibilityRole="alert">
          No se pudo guardar la venta, verifica los datos e intenta de nuevo
        </Text>
      )}
      <PrimaryButton
        label="Guardar venta"
        onPress={handleSave}
        disabled={!isAmountValid || readOnly}
        loading={mutation.isPending}
        testID="save-sale"
      />
    </ScrollView>
  );
}
