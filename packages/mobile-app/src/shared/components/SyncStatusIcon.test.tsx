import React from "react";
import { render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { SyncStatusIcon } from "./SyncStatusIcon";

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe("SyncStatusIcon", () => {
  it("no renderiza nada cuando pendingCount es 0", () => {
    const { queryByTestId } = renderWithPaper(<SyncStatusIcon pendingCount={0} />);
    expect(queryByTestId("sync-status-icon")).toBeNull();
  });

  it("muestra el conteo cuando hay ventas pendientes", () => {
    const { getByTestId, getByText } = renderWithPaper(<SyncStatusIcon pendingCount={3} />);
    expect(getByTestId("sync-status-icon")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
  });
});
