import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { ErrorBanner } from "./ErrorBanner";

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe("ErrorBanner", () => {
  it("muestra el mensaje de error", () => {
    const { getByText } = renderWithPaper(
      <ErrorBanner visible message="No se pudo cargar tu comisión, desliza para reintentar" />,
    );
    expect(getByText("No se pudo cargar tu comisión, desliza para reintentar")).toBeTruthy();
  });

  it("invoca onRetry al presionar la acción cuando se provee", () => {
    const onRetry = jest.fn();
    const { getByText } = renderWithPaper(
      <ErrorBanner visible message="Error" onRetry={onRetry} />,
    );
    fireEvent.press(getByText("Reintentar"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("no ofrece acción de reintento cuando no se provee onRetry", () => {
    const { queryByText } = renderWithPaper(<ErrorBanner visible message="Error" />);
    expect(queryByText("Reintentar")).toBeNull();
  });
});
