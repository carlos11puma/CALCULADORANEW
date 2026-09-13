import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { SessionProvider, useSession } from "./SessionContext";
import * as secureSession from "../storage/secureSession";
import * as authApi from "../../features/auth/api";

jest.mock("../../features/auth/api");

// Captura el handler que SessionProvider registra en apiClient (MW9) para poder dispararlo
// manualmente en la prueba, sin depender de un 401 real de Axios.
let capturedExpiredHandler: (() => void) | null = null;
jest.mock("../api/apiClient", () => ({
  registerSessionExpiredHandler: jest.fn((handler: (() => void) | null) => {
    capturedExpiredHandler = handler;
  }),
}));

function Probe(): React.JSX.Element {
  const { session, status, expiredMessage, login, logout } = useSession();
  return (
    <>
      <Text testID="status">{status}</Text>
      <Text testID="role">{session?.role ?? "none"}</Text>
      <Text testID="expired">{expiredMessage ?? "none"}</Text>
      <Text
        testID="login-action"
        onPress={() => login({ token: "t1", userId: "v1", role: "vendedor" })}
      >
        login
      </Text>
      <Text testID="logout-action" onPress={() => logout()}>
        logout
      </Text>
    </>
  );
}

describe("SessionContext", () => {
  beforeEach(async () => {
    await secureSession.clearSession();
    jest.clearAllMocks();
  });

  it("inicia en loading y pasa a ready sin sesión previa", async () => {
    const { getByTestId } = render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() => expect(getByTestId("status").props.children).toBe("ready"));
    expect(getByTestId("role").props.children).toBe("none");
  });

  it("login guarda la sesión y logout la borra (best-effort, MW3)", async () => {
    (authApi.logout as jest.Mock).mockResolvedValue(undefined);
    const { getByTestId } = render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() => expect(getByTestId("status").props.children).toBe("ready"));

    await act(async () => {
      getByTestId("login-action").props.onPress();
    });
    expect(getByTestId("role").props.children).toBe("vendedor");
    expect(await secureSession.getSession()).toEqual({ token: "t1", userId: "v1", role: "vendedor" });

    await act(async () => {
      getByTestId("logout-action").props.onPress();
    });
    await waitFor(() => expect(getByTestId("role").props.children).toBe("none"));
    expect(authApi.logout).toHaveBeenCalledTimes(1);
  });

  it("logout procede localmente aunque la llamada al servidor falle (MW3, sin conexión)", async () => {
    (authApi.logout as jest.Mock).mockRejectedValue(new Error("network"));
    const { getByTestId } = render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() => expect(getByTestId("status").props.children).toBe("ready"));
    await act(async () => {
      getByTestId("login-action").props.onPress();
    });
    await act(async () => {
      getByTestId("logout-action").props.onPress();
    });
    await waitFor(() => expect(getByTestId("role").props.children).toBe("none"));
    expect(await secureSession.getSession()).toBeNull();
  });

  it("MW9: el handler de sesión expirada limpia la sesión y setea el mensaje", async () => {
    const { getByTestId } = render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() => expect(getByTestId("status").props.children).toBe("ready"));
    await act(async () => {
      getByTestId("login-action").props.onPress();
    });
    expect(getByTestId("role").props.children).toBe("vendedor");

    // Simula lo que apiClient.ts invoca al interceptar un 401 inesperado fuera de login/logout.
    expect(capturedExpiredHandler).not.toBeNull();
    act(() => {
      capturedExpiredHandler?.();
    });

    expect(getByTestId("role").props.children).toBe("none");
    expect(getByTestId("expired").props.children).toBe("Tu sesión expiró, ingresa de nuevo");
  });

  it("useSession lanza fuera de un SessionProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    function Bare() {
      useSession();
      return null;
    }
    expect(() => render(<Bare />)).toThrow("useSession debe usarse dentro de un SessionProvider");
    consoleError.mockRestore();
  });
});
