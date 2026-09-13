import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { TiersScreen } from "./TiersScreen";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { getTiers, replaceTiers } from "./api";

jest.mock("./api");

function renderScreen() {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <TiersScreen />
      </PaperProvider>
    </QueryWrapper>,
  );
}

const tier1 = { id: "t1", channel: "preventa" as const, tierType: "por_efectividad" as const, order: 1, thresholdValue: 10, commissionRate: 1 };

describe("TiersScreen (A4)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("estado loading: muestra el skeleton", () => {
    (getTiers as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { getByTestId } = renderScreen();
    expect(getByTestId("skeleton-list")).toBeTruthy();
  });

  it("MW14 paso 1: consulta tramos del canal seleccionado (preventa por defecto)", async () => {
    (getTiers as jest.Mock).mockResolvedValue({ tiers: [tier1], inOrder: true });
    const { findByTestId } = renderScreen();
    await findByTestId("tier-row-0");
    expect(getTiers).toHaveBeenCalledWith("preventa");
  });

  it("BR2.6: 'Guardar' se deshabilita si un tramo queda con umbral/comisión vacío", async () => {
    (getTiers as jest.Mock).mockResolvedValue({ tiers: [tier1], inOrder: true });
    const { findByTestId, getByTestId } = renderScreen();
    await findByTestId("tier-row-0");
    expect(getByTestId("save-tiers").props.accessibilityState.disabled).toBe(false);

    fireEvent.changeText(getByTestId("tier-threshold-0"), "");
    expect(getByTestId("save-tiers").props.accessibilityState.disabled).toBe(true);
  });

  it("MW14 paso 3 (200): guarda el conjunto completo de tramos del canal", async () => {
    (getTiers as jest.Mock).mockResolvedValue({ tiers: [tier1], inOrder: true });
    (replaceTiers as jest.Mock).mockResolvedValue({ tiers: [tier1], inOrder: true, warning: null });
    const { findByTestId, getByTestId } = renderScreen();
    await findByTestId("tier-row-0");
    fireEvent.press(getByTestId("save-tiers"));
    await waitFor(() => expect(replaceTiers).toHaveBeenCalled());
  });

  it("MW14 paso 4: muestra el warning TIER_ORDER_WARNING sin bloquear el guardado", async () => {
    (getTiers as jest.Mock).mockResolvedValue({ tiers: [tier1], inOrder: false });
    (replaceTiers as jest.Mock).mockResolvedValue({ tiers: [tier1], inOrder: false, warning: "TIER_ORDER_WARNING" });
    const { findByTestId, getByTestId, findByText } = renderScreen();
    await findByTestId("tier-row-0");
    fireEvent.press(getByTestId("save-tiers"));
    expect(
      await findByText(
        "⚠ Los tramos deben quedar ordenados de menor a mayor beneficio para que la app calcule bien la oportunidad de ganancia",
      ),
    ).toBeTruthy();
  });

  it("MW14 paso 5 (400): muestra el banner de validación bloqueante", async () => {
    (getTiers as jest.Mock).mockResolvedValue({ tiers: [tier1], inOrder: true });
    (replaceTiers as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 400 } });
    const { findByTestId, getByTestId, findByText } = renderScreen();
    await findByTestId("tier-row-0");
    fireEvent.press(getByTestId("save-tiers"));
    expect(
      await findByText("⚠ El umbral y la comisión no pueden estar vacíos ni ser negativos"),
    ).toBeTruthy();
  });

  it("agrega un nuevo tramo en blanco con '+ Agregar tramo'", async () => {
    (getTiers as jest.Mock).mockResolvedValue({ tiers: [tier1], inOrder: true });
    const { findByTestId, getByTestId } = renderScreen();
    await findByTestId("tier-row-0");
    fireEvent.press(getByTestId("add-tier"));
    expect(getByTestId("tier-row-1")).toBeTruthy();
  });
});
