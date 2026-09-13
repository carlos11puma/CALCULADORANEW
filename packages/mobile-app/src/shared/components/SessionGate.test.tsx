import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { PaperProvider, Text } from "react-native-paper";
import { SessionGate } from "./SessionGate";
import { SessionProvider } from "../session/SessionContext";

jest.mock("../../features/auth/api");

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <PaperProvider>
      <SessionProvider>{ui}</SessionProvider>
    </PaperProvider>,
  );
}

describe("SessionGate", () => {
  it("renderiza sus children", async () => {
    const { getByText } = renderWithProviders(
      <SessionGate>
        <Text>contenido protegido</Text>
      </SessionGate>,
    );
    await waitFor(() => expect(getByText("contenido protegido")).toBeTruthy());
  });

  it("no muestra el mensaje de sesión expirada cuando no hay uno pendiente", async () => {
    const { queryByText, getByText } = renderWithProviders(
      <SessionGate>
        <Text>contenido</Text>
      </SessionGate>,
    );
    await waitFor(() => expect(getByText("contenido")).toBeTruthy());
    expect(queryByText("Tu sesión expiró, ingresa de nuevo")).toBeNull();
  });
});
