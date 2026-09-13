import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { ConfirmDialog } from "./ConfirmDialog";

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe("ConfirmDialog", () => {
  it("invoca onConfirm al tocar Confirmar", () => {
    const onConfirm = jest.fn();
    const { getByTestId } = renderWithPaper(
      <ConfirmDialog
        visible
        title="Cerrar sesión"
        message="¿Seguro que deseas cerrar sesión?"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId("confirm-dialog-confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("invoca onCancel al tocar Cancelar", () => {
    const onCancel = jest.fn();
    const { getByTestId } = renderWithPaper(
      <ConfirmDialog
        visible
        title="Cerrar sesión"
        message="¿Seguro?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.press(getByTestId("confirm-dialog-cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("no renderiza el contenido cuando visible=false", () => {
    const { queryByText } = renderWithPaper(
      <ConfirmDialog
        visible={false}
        title="Cerrar sesión"
        message="¿Seguro?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(queryByText("Cerrar sesión")).toBeNull();
  });
});
