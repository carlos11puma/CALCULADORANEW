import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { BudgetsScreen } from "./BudgetsScreen";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { getVendors, updateVendor } from "./api";

jest.mock("./api");

function renderScreen() {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <BudgetsScreen />
      </PaperProvider>
    </QueryWrapper>,
  );
}

const vendor = { id: "v1", userId: "u1", route: "R1", name: "Juan", channel: "preventa" as const, budget: 1000, active: true };

describe("BudgetsScreen (A3)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("estado loading: muestra el skeleton", () => {
    (getVendors as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { getByTestId } = renderScreen();
    expect(getByTestId("skeleton-list")).toBeTruthy();
  });

  it("BR2.5: 'Guardar' está deshabilitado con presupuesto vacío o <= 0", async () => {
    (getVendors as jest.Mock).mockResolvedValue([vendor]);
    const { findByTestId, getByTestId } = renderScreen();
    fireEvent.press(await findByTestId("budget-item-v1"));
    fireEvent.changeText(getByTestId("budget-input-v1"), "0");
    expect(getByTestId("budget-save-v1").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("budget-input-v1"), "2000");
    expect(getByTestId("budget-save-v1").props.accessibilityState.disabled).toBe(false);
  });

  it("MW13 paso 2 (200): guarda el nuevo presupuesto", async () => {
    (getVendors as jest.Mock).mockResolvedValue([vendor]);
    (updateVendor as jest.Mock).mockResolvedValue({ ...vendor, budget: 2000 });
    const { findByTestId, getByTestId } = renderScreen();
    fireEvent.press(await findByTestId("budget-item-v1"));
    fireEvent.changeText(getByTestId("budget-input-v1"), "2000");
    fireEvent.press(getByTestId("budget-save-v1"));
    await waitFor(() =>
      expect((updateVendor as jest.Mock).mock.calls[0]).toEqual([
        "v1",
        { route: "R1", name: "Juan", channel: "preventa", budget: 2000 },
      ]),
    );
  });

  it("MW13 paso 3 (400): muestra '⚠ El presupuesto debe ser mayor a 0'", async () => {
    (getVendors as jest.Mock).mockResolvedValue([vendor]);
    (updateVendor as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 400 } });
    const { findByTestId, getByTestId, findByText } = renderScreen();
    fireEvent.press(await findByTestId("budget-item-v1"));
    fireEvent.changeText(getByTestId("budget-input-v1"), "2000");
    fireEvent.press(getByTestId("budget-save-v1"));
    expect(await findByText("⚠ El presupuesto debe ser mayor a 0")).toBeTruthy();
  });
});
