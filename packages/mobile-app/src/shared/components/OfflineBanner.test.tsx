import React from "react";
import { render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { OfflineBanner } from "./OfflineBanner";

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe("OfflineBanner", () => {
  it("muestra el mensaje por defecto cuando visible", () => {
    const { getByText } = renderWithPaper(<OfflineBanner visible />);
    expect(
      getByText("↻ Sin conexión: se guardará localmente y sincronizará cuando vuelva la señal"),
    ).toBeTruthy();
  });

  it("acepta un mensaje custom", () => {
    const { getByText } = renderWithPaper(<OfflineBanner visible message="Sin conexión" />);
    expect(getByText("Sin conexión")).toBeTruthy();
  });
});
