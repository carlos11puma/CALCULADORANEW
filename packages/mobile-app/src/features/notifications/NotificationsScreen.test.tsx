import React from "react";
import { render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { NotificationsScreen } from "./NotificationsScreen";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { getNotifications } from "./api";

jest.mock("./api");

function renderScreen() {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <NotificationsScreen />
      </PaperProvider>
    </QueryWrapper>,
  );
}

describe("NotificationsScreen (V5)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("estado loading: muestra el skeleton", () => {
    (getNotifications as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { getByTestId } = renderScreen();
    expect(getByTestId("skeleton-list")).toBeTruthy();
  });

  it("estado success: agrupa por type en secciones", async () => {
    (getNotifications as jest.Mock).mockResolvedValue([
      { id: "n1", vendorId: "v1", type: "umbral_venta", thresholdCrossed: 80, earningOpportunity: null, message: "Llegaste al 80%", sentAt: "2026-09-01T00:00:00.000Z", read: false },
      { id: "n2", vendorId: "v1", type: "manual", thresholdCrossed: null, earningOpportunity: null, message: "Reunión mañana", sentAt: "2026-09-02T00:00:00.000Z", read: true },
    ]);
    const { findByTestId } = renderScreen();
    expect(await findByTestId("notifications-group-umbral_venta")).toBeTruthy();
    expect(await findByTestId("notification-n1")).toBeTruthy();
    expect(await findByTestId("notification-n2")).toBeTruthy();
  });

  it("AC8.3.1: muestra la línea de oportunidad de ganancia cuando earningOpportunity no es null", async () => {
    (getNotifications as jest.Mock).mockResolvedValue([
      {
        id: "n3", vendorId: "v1", type: "umbral_devolucion", thresholdCrossed: 3,
        earningOpportunity: { nextTierThreshold: 2, potentialGain: 150 },
        message: "Tu devolución subió", sentAt: "2026-09-03T00:00:00.000Z", read: false,
      },
    ]);
    const { findByText } = renderScreen();
    expect(await findByText("Podrías ganar $150 más si llegas a 2%")).toBeTruthy();
  });

  it("estado empty: muestra 'Aún no tienes notificaciones'", async () => {
    (getNotifications as jest.Mock).mockResolvedValue([]);
    const { findByTestId } = renderScreen();
    expect(await findByTestId("notifications-empty")).toBeTruthy();
  });

  it("estado error: ofrece reintentar", async () => {
    (getNotifications as jest.Mock).mockRejectedValue(new Error("network"));
    const { findByText } = renderScreen();
    expect(
      await findByText("No se pudieron cargar tus notificaciones, desliza para reintentar"),
    ).toBeTruthy();
  });
});
