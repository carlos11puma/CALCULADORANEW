import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { VendorLoginScreen } from "./VendorLoginScreen";
import { SessionProvider } from "../../shared/session/SessionContext";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { loginVendedor } from "./api";

jest.mock("./api");

const navigation = { navigate: jest.fn() } as unknown as import("@react-navigation/native-stack").NativeStackNavigationProp<
  import("../../app/navigation/AuthStack").AuthStackParamList,
  "VendorLogin"
>;

function renderVendorLogin() {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <SessionProvider>
          <VendorLoginScreen navigation={navigation} route={{ key: "VendorLogin", name: "VendorLogin" } as any} />
        </SessionProvider>
      </PaperProvider>
    </QueryWrapper>,
  );
}

describe("VendorLoginScreen (V1)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("BR1.6: el botón Ingresar está deshabilitado hasta llenar usuario y contraseña", () => {
    const { getByTestId } = renderVendorLogin();
    const button = getByTestId("login-submit");
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("login-username"), "carlos");
    expect(getByTestId("login-submit").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("login-password"), "secret");
    expect(getByTestId("login-submit").props.accessibilityState.disabled).toBe(false);
  });

  it("MW1 200: al tener éxito, llama al backend con las credenciales ingresadas", async () => {
    (loginVendedor as jest.Mock).mockResolvedValue({ token: "t1", userId: "v1", role: "vendedor" });
    const { getByTestId } = renderVendorLogin();
    fireEvent.changeText(getByTestId("login-username"), "carlos");
    fireEvent.changeText(getByTestId("login-password"), "secret");
    fireEvent.press(getByTestId("login-submit"));

    await waitFor(() => expect(loginVendedor).toHaveBeenCalledWith("carlos", "secret"));
  });

  it("MW1 401: muestra el banner de error inline y no limpia los campos", async () => {
    (loginVendedor as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
    const { getByTestId, findByText } = renderVendorLogin();
    fireEvent.changeText(getByTestId("login-username"), "carlos");
    fireEvent.changeText(getByTestId("login-password"), "malo");
    fireEvent.press(getByTestId("login-submit"));

    await findByText("Usuario o contraseña incorrectos");
    expect(getByTestId("login-username").props.value).toBe("carlos");
    expect(getByTestId("login-password").props.value).toBe("malo");
  });

  it("navega a SupervisorLogin desde el enlace de rol", () => {
    const { getByTestId } = renderVendorLogin();
    fireEvent.press(getByTestId("go-to-supervisor-login"));
    expect(navigation.navigate).toHaveBeenCalledWith("SupervisorLogin");
  });
});
