import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { SupervisorLoginScreen } from "./SupervisorLoginScreen";
import { SessionProvider } from "../../shared/session/SessionContext";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { loginSupervisor } from "./api";

jest.mock("./api");

const navigation = { navigate: jest.fn() } as unknown as import("@react-navigation/native-stack").NativeStackNavigationProp<
  import("../../app/navigation/AuthStack").AuthStackParamList,
  "SupervisorLogin"
>;

function renderSupervisorLogin() {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <SessionProvider>
          <SupervisorLoginScreen
            navigation={navigation}
            route={{ key: "SupervisorLogin", name: "SupervisorLogin" } as any}
          />
        </SessionProvider>
      </PaperProvider>
    </QueryWrapper>,
  );
}

describe("SupervisorLoginScreen (A1)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("BR1.7: el botón Ingresar está deshabilitado hasta 4 dígitos", () => {
    const { getByTestId } = renderSupervisorLogin();
    expect(getByTestId("login-submit").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("login-pin"), "12");
    expect(getByTestId("login-submit").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("login-pin"), "1234");
    expect(getByTestId("login-submit").props.accessibilityState.disabled).toBe(false);
  });

  it("descarta caracteres no numéricos y limita a 4 dígitos", () => {
    const { getByTestId } = renderSupervisorLogin();
    fireEvent.changeText(getByTestId("login-pin"), "1a2b3c4d5");
    expect(getByTestId("login-pin").props.value).toBe("1234");
  });

  it("MW2 200: envía el PIN al backend", async () => {
    (loginSupervisor as jest.Mock).mockResolvedValue({ token: "t2", userId: "s1", role: "supervisor" });
    const { getByTestId } = renderSupervisorLogin();
    fireEvent.changeText(getByTestId("login-pin"), "1234");
    fireEvent.press(getByTestId("login-submit"));
    await waitFor(() => expect(loginSupervisor).toHaveBeenCalledWith("1234"));
  });

  it("MW2 401: muestra 'PIN incorrecto' sin bloquear reintento", async () => {
    (loginSupervisor as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
    const { getByTestId, findByText } = renderSupervisorLogin();
    fireEvent.changeText(getByTestId("login-pin"), "0000");
    fireEvent.press(getByTestId("login-submit"));
    await findByText("PIN incorrecto");
    expect(getByTestId("login-submit").props.accessibilityState.disabled).toBe(false);
  });
});
