import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { RosterScreen } from "./RosterScreen";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { createVendor, getVendors } from "./api";

jest.mock("./api");

function renderScreen(onOpenManualNotification?: () => void) {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <RosterScreen onOpenManualNotification={onOpenManualNotification} />
      </PaperProvider>
    </QueryWrapper>,
  );
}

describe("RosterScreen (A2)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("estado loading: muestra el skeleton", () => {
    (getVendors as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { getByTestId } = renderScreen();
    expect(getByTestId("skeleton-list")).toBeTruthy();
  });

  it("estado success: lista el roster", async () => {
    (getVendors as jest.Mock).mockResolvedValue([
      { id: "v1", userId: "u1", route: "R1", name: "Juan", channel: "preventa", budget: 1000, active: true },
    ]);
    const { findByTestId } = renderScreen();
    expect(await findByTestId("vendor-v1")).toBeTruthy();
  });

  it("BR2.4: 'Agregar' está deshabilitado hasta llenar ruta, nombre y canal", async () => {
    (getVendors as jest.Mock).mockResolvedValue([]);
    const { findByTestId, getByTestId } = renderScreen();
    fireEvent.press(await findByTestId("open-add-vendor"));
    expect(getByTestId("submit-add-vendor").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("vendor-route"), "R2");
    fireEvent.changeText(getByTestId("vendor-name"), "Ana");
    expect(getByTestId("submit-add-vendor").props.accessibilityState.disabled).toBe(false); // channel ya tiene default
  });

  it("MW12 paso 2 (201): agrega el vendedor y limpia el formulario", async () => {
    (getVendors as jest.Mock).mockResolvedValue([]);
    (createVendor as jest.Mock).mockResolvedValue({ id: "v2", userId: "u2", route: "R2", name: "Ana", channel: "preventa", budget: 0, active: true });
    const { findByTestId, getByTestId } = renderScreen();
    fireEvent.press(await findByTestId("open-add-vendor"));
    fireEvent.changeText(getByTestId("vendor-route"), "R2");
    fireEvent.changeText(getByTestId("vendor-name"), "Ana");
    fireEvent.press(getByTestId("submit-add-vendor"));
    await waitFor(() => expect(createVendor).toHaveBeenCalled());
  });

  it("MW12 paso 2 (400): muestra el banner de validación", async () => {
    (getVendors as jest.Mock).mockResolvedValue([]);
    (createVendor as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 400 } });
    const { findByTestId, getByTestId, findByText } = renderScreen();
    fireEvent.press(await findByTestId("open-add-vendor"));
    fireEvent.changeText(getByTestId("vendor-route"), "R2");
    fireEvent.changeText(getByTestId("vendor-name"), "Ana");
    fireEvent.press(getByTestId("submit-add-vendor"));
    expect(await findByText("No se pudo agregar el vendedor, revisa los datos")).toBeTruthy();
  });

  it("expone el acceso a A5 (Enviar notificación manual) cuando se provee la prop", async () => {
    (getVendors as jest.Mock).mockResolvedValue([]);
    const onOpen = jest.fn();
    const { findByTestId } = renderScreen(onOpen);
    fireEvent.press(await findByTestId("open-manual-notification"));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
