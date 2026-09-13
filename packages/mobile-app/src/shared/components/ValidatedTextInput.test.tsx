import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { ValidatedTextInput } from "./ValidatedTextInput";

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe("ValidatedTextInput", () => {
  it("propaga onChangeText", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = renderWithPaper(
      <ValidatedTextInput label="Usuario" value="" onChangeText={onChangeText} testID="username" />,
    );
    fireEvent.changeText(getByTestId("username"), "carlos");
    expect(onChangeText).toHaveBeenCalledWith("carlos");
  });

  it("no muestra HelperText cuando no hay error", () => {
    const { queryByTestId } = renderWithPaper(
      <ValidatedTextInput label="Usuario" value="" onChangeText={jest.fn()} testID="username" />,
    );
    expect(queryByTestId("username-error")).toBeNull();
  });

  it("muestra el mensaje de error cuando se pasa `error`", () => {
    const { getByTestId, getByText } = renderWithPaper(
      <ValidatedTextInput
        label="Monto"
        value="0"
        onChangeText={jest.fn()}
        error="⚠ Ingresa un monto válido (mayor a 0)"
        testID="amount"
      />,
    );
    expect(getByTestId("amount-error")).toBeTruthy();
    expect(getByText("⚠ Ingresa un monto válido (mayor a 0)")).toBeTruthy();
  });
});
