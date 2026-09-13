import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { PrimaryButton } from "./PrimaryButton";

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe("PrimaryButton", () => {
  it("llama a onPress al tocarlo cuando está habilitado", () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithPaper(
      <PrimaryButton label="Ingresar" onPress={onPress} testID="btn" />,
    );
    fireEvent.press(getByTestId("btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("no llama a onPress cuando está deshabilitado", () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithPaper(
      <PrimaryButton label="Ingresar" onPress={onPress} disabled testID="btn" />,
    );
    fireEvent.press(getByTestId("btn"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("no llama a onPress cuando está en loading", () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithPaper(
      <PrimaryButton label="Ingresar" onPress={onPress} loading testID="btn" />,
    );
    fireEvent.press(getByTestId("btn"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("muestra el label dado", () => {
    const { getByText } = renderWithPaper(
      <PrimaryButton label="Guardar venta" onPress={jest.fn()} />,
    );
    expect(getByText("Guardar venta")).toBeTruthy();
  });
});
