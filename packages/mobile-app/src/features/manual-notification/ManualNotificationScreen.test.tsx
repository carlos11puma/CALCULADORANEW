import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { ManualNotificationScreen } from "./ManualNotificationScreen";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { sendManualNotification } from "./api";
import type { Vendor } from "../../shared/api/contractTypes";

jest.mock("./api");

const vendors: Vendor[] = [
  { id: "v1", userId: "u1", route: "R1", name: "Juan", channel: "preventa", budget: 1000, active: true },
  { id: "v2", userId: "u2", route: "R2", name: "Ana", channel: "autoventa", budget: 2000, active: true },
];

function renderScreen() {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <ManualNotificationScreen vendors={vendors} />
      </PaperProvider>
    </QueryWrapper>,
  );
}

describe("ManualNotificationScreen (A5)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("BR9.3: deshabilitado sin mensaje ni destinatarios (modo 'Un vendedor')", () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId("send-manual-notification").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("manual-message"), "Hola");
    expect(getByTestId("send-manual-notification").props.accessibilityState.disabled).toBe(true); // falta destinatario

    fireEvent.press(getByTestId("recipient-v1"));
    expect(getByTestId("send-manual-notification").props.accessibilityState.disabled).toBe(false);
  });

  it("modo 'Todos los vendedores': no requiere selección de destinatarios", () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId("mode-all"));
    fireEvent.changeText(getByTestId("manual-message"), "Aviso general");
    expect(getByTestId("send-manual-notification").props.accessibilityState.disabled).toBe(false);
  });

  it("MW15 paso 4 (202, Un/Varios): envía y muestra la confirmación con el conteo", async () => {
    (sendManualNotification as jest.Mock).mockResolvedValue(undefined);
    const { getByTestId, findByText } = renderScreen();
    fireEvent.changeText(getByTestId("manual-message"), "Hola");
    fireEvent.press(getByTestId("recipient-v1"));
    fireEvent.press(getByTestId("send-manual-notification"));
    await waitFor(() =>
      expect((sendManualNotification as jest.Mock).mock.calls[0][0]).toEqual({
        message: "Hola",
        recipients: ["v1"],
      }),
    );
    expect(await findByText("Notificación enviada a 1 vendedores")).toBeTruthy();
  });

  it("MW15 paso 4 (202, Todos): envía recipients='all' y confirma con el total del roster", async () => {
    (sendManualNotification as jest.Mock).mockResolvedValue(undefined);
    const { getByTestId, findByText } = renderScreen();
    fireEvent.press(getByTestId("mode-all"));
    fireEvent.changeText(getByTestId("manual-message"), "Aviso");
    fireEvent.press(getByTestId("send-manual-notification"));
    await waitFor(() =>
      expect((sendManualNotification as jest.Mock).mock.calls[0][0]).toEqual({
        message: "Aviso",
        recipients: "all",
      }),
    );
    expect(await findByText("Notificación enviada a 2 vendedores")).toBeTruthy();
  });

  it("MW15 paso 5 (400): muestra '⚠ Escribe un mensaje antes de enviar'", async () => {
    (sendManualNotification as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 400 } });
    const { getByTestId, findByText } = renderScreen();
    fireEvent.changeText(getByTestId("manual-message"), "Hola");
    fireEvent.press(getByTestId("recipient-v1"));
    fireEvent.press(getByTestId("send-manual-notification"));
    expect(await findByText("⚠ Escribe un mensaje antes de enviar")).toBeTruthy();
  });
});
