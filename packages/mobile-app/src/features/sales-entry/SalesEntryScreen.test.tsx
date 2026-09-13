import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { SalesEntryScreen } from "./SalesEntryScreen";
import { SessionProvider, useSession } from "../../shared/session/SessionContext";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { postSale } from "./api";
import { getCurrentConnectivity } from "../../shared/net/connectivity";
import { __resetDbForTests, upsertPendingSale } from "../../shared/storage/pendingSalesDb";

jest.mock("./api");
jest.mock("../../shared/net/connectivity");
jest.mock("../auth/api");

const { expoSqliteMock } = require("../../shared/__fixtures__/expoSqliteMock");

function LoggedInEntry({ onSaved = jest.fn() }: { onSaved?: () => void }) {
  const { login } = useSession();
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    login({ token: "t1", userId: "v1", role: "vendedor" }).then(() => setReady(true));
  }, [login]);
  if (!ready) return null;
  return <SalesEntryScreen onSaved={onSaved} />;
}

function renderScreen(onSaved?: () => void) {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <SessionProvider>
          <LoggedInEntry onSaved={onSaved} />
        </SessionProvider>
      </PaperProvider>
    </QueryWrapper>,
  );
}

describe("SalesEntryScreen (V3)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    expoSqliteMock.__resetAll();
    __resetDbForTests();
    (getCurrentConnectivity as jest.Mock).mockResolvedValue(true);
  });

  it("BR3.6: el botón Guardar venta está deshabilitado con monto vacío o <= 0", async () => {
    const { findByTestId, getByTestId } = renderScreen();
    await findByTestId("sale-amount");
    expect(getByTestId("save-sale").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("sale-amount"), "0");
    expect(getByTestId("save-sale").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("sale-amount"), "150");
    expect(getByTestId("save-sale").props.accessibilityState.disabled).toBe(false);
  });

  it("MW5 paso 2: precarga el formulario si ya existe una venta local pendiente de hoy", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await upsertPendingSale({ vendorId: "v1", saleDate: today, amount: 42, returns: 3 });
    const { findByTestId } = renderScreen();
    const amountInput = await findByTestId("sale-amount");
    await waitFor(() => expect(amountInput.props.value).toBe("42"));
  });

  it("MW5 paso 4 / OfflineBanner: muestra el aviso de sin conexión cuando no hay red", async () => {
    (getCurrentConnectivity as jest.Mock).mockResolvedValue(false);
    const { findByText } = renderScreen();
    expect(
      await findByText("↻ Sin conexión: se guardará localmente y sincronizará cuando vuelva la señal"),
    ).toBeTruthy();
  });

  it("MW6: con conexión, guarda remoto y navega de vuelta a Home", async () => {
    (postSale as jest.Mock).mockResolvedValue({ id: "s1", vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0, syncStatus: "synced", closed: false });
    const onSaved = jest.fn();
    const { findByTestId, getByTestId } = renderScreen(onSaved);
    fireEvent.changeText(await findByTestId("sale-amount"), "100");
    fireEvent.press(getByTestId("save-sale"));
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  });

  it("MW6 paso 5 (409 PERIOD_CLOSED): pasa a modo solo lectura con el aviso 'Este día ya cerró'", async () => {
    (postSale as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { code: "PERIOD_CLOSED" } },
    });
    const { findByTestId, getByTestId, findByText } = renderScreen();
    fireEvent.changeText(await findByTestId("sale-amount"), "100");
    fireEvent.press(getByTestId("save-sale"));
    await findByText("Este día ya cerró");
    expect(getByTestId("save-sale").props.accessibilityState.disabled).toBe(true);
  });

  it("MW7 paso 2 (AC3.3.4): la conexión se pierde a mitad del intento — no muestra error, guarda local y navega", async () => {
    (postSale as jest.Mock).mockRejectedValue({ isAxiosError: true, response: undefined });
    const onSaved = jest.fn();
    const { findByTestId, getByTestId, queryByTestId } = renderScreen(onSaved);
    fireEvent.changeText(await findByTestId("sale-amount"), "80");
    fireEvent.press(getByTestId("save-sale"));
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(queryByTestId("sale-save-error")).toBeNull();
  });
});
