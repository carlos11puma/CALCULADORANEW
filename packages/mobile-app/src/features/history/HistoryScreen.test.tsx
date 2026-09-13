import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { HistoryScreen } from "./HistoryScreen";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { getCommissionHistory } from "./api";

jest.mock("./api");

function renderHistory() {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <HistoryScreen />
      </PaperProvider>
    </QueryWrapper>,
  );
}

describe("HistoryScreen (V4)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("estado loading: muestra el skeleton de 3 filas", () => {
    (getCommissionHistory as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { getByTestId } = renderHistory();
    expect(getByTestId("skeleton-list")).toBeTruthy();
  });

  it("estado success: lista los períodos cerrados", async () => {
    (getCommissionHistory as jest.Mock).mockResolvedValue([
      { id: "p1", vendorId: "v1", periodMonth: "2026-08", accumulatedSales: 1000, accumulatedReturns: 0, returnRate: 0, commissionEarned: 100, budgetProgress: 100, closed: true, closedAt: "2026-08-31T00:00:00.000Z" },
    ]);
    const { findByTestId } = renderHistory();
    expect(await findByTestId("history-item-p1")).toBeTruthy();
  });

  it("estado empty: muestra 'Aún no tienes períodos cerrados'", async () => {
    (getCommissionHistory as jest.Mock).mockResolvedValue([]);
    const { findByTestId } = renderHistory();
    expect(await findByTestId("history-empty")).toBeTruthy();
  });

  it("estado error: ofrece reintentar", async () => {
    (getCommissionHistory as jest.Mock).mockRejectedValue(new Error("network"));
    const { findByText } = renderHistory();
    expect(await findByText("No se pudo cargar tu historial, desliza para reintentar")).toBeTruthy();
  });
});
