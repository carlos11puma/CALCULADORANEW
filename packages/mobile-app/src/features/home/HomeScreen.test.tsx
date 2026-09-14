import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { HomeScreen } from "./HomeScreen";
import { SessionProvider, useSession } from "../../shared/session/SessionContext";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { getCurrentCommission } from "./api";
import { listPendingSales, __resetDbForTests, upsertPendingSale } from "../../shared/storage/pendingSalesDb";
import { logout as logoutRequest } from "../auth/api";

jest.mock("./api");
jest.mock("../auth/api");

const { expoSqliteMock } = require("../../shared/__fixtures__/expoSqliteMock");

function LoggedInHome({ onEnterSale = jest.fn() }: { onEnterSale?: () => void }) {
  const { login } = useSession();
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    login({ token: "t1", userId: "v1", role: "vendedor" }).then(() => setReady(true));
  }, [login]);
  if (!ready) return null;
  return <HomeScreen onEnterSale={onEnterSale} />;
}

function renderHome(onEnterSale?: () => void) {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <PaperProvider>
        <SessionProvider>
          <LoggedInHome onEnterSale={onEnterSale} />
        </SessionProvider>
      </PaperProvider>
    </QueryWrapper>,
  );
}

describe("HomeScreen (V2)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    expoSqliteMock.__resetAll();
    __resetDbForTests();
    (logoutRequest as jest.Mock).mockResolvedValue(undefined);
  });

  it("estado loading: muestra el skeleton mientras carga", () => {
    (getCurrentCommission as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { getByTestId } = renderHome();
    return waitFor(() => expect(getByTestId("skeleton-card")).toBeTruthy());
  });

  it("estado success (200): muestra commissionEarned y budgetProgress", async () => {
    (getCurrentCommission as jest.Mock).mockResolvedValue({
      id: "c1",
      vendorId: "v1",
      periodMonth: "2026-09",
      accumulatedSales: 1000,
      accumulatedReturns: 10,
      returnRate: 1,
      commissionEarned: 250.5,
      budgetProgress: 50,
      closed: false,
      closedAt: null,
    });
    const { findByTestId, getByTestId } = renderHome();
    await findByTestId("commission-card");
    expect(getByTestId("commission-earned").props.children).toContain("250.50");
  });

  it("Fix (Deployment Execution, 260909, undécimo hallazgo): muestra returnRate ×100 — llega como fracción (0.1023 = 10,23%), no como porcentaje", async () => {
    (getCurrentCommission as jest.Mock).mockResolvedValue({
      id: "c1",
      vendorId: "v1",
      periodMonth: "2026-09",
      accumulatedSales: 9756,
      accumulatedReturns: 998,
      returnRate: 0.1023, // 998 / 9756 — caso real detectado en staging
      commissionEarned: 0,
      budgetProgress: 9.756,
      closed: false,
      closedAt: null,
    });
    const { findByTestId } = renderHome();
    const chip = await findByTestId("return-rate-chip");
    expect(JSON.stringify(chip)).toContain("10.2");
    expect(JSON.stringify(chip)).not.toContain("Devolución: 0.1%");
  });

  it("estado error: muestra ErrorBanner con onRetry (pull-to-refresh)", async () => {
    (getCurrentCommission as jest.Mock).mockRejectedValue(new Error("network"));
    const { findByText } = renderHome();
    expect(await findByText("No se pudo cargar tu comisión, desliza para reintentar")).toBeTruthy();
  });

  it("MW4 paso 5: muestra el ícono de sincronización cuando hay ventas pendientes locales", async () => {
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 10, returns: 0 });
    (getCurrentCommission as jest.Mock).mockResolvedValue({
      id: "c1",
      vendorId: "v1",
      periodMonth: "2026-09",
      accumulatedSales: 100,
      accumulatedReturns: 0,
      returnRate: 0,
      commissionEarned: 10,
      budgetProgress: 10,
      closed: false,
      closedAt: null,
    });
    const { findByTestId } = renderHome();
    await findByTestId("sync-status-icon");
    const pending = await listPendingSales("v1");
    expect(pending).toHaveLength(1);
  });

  it("navega a V3 al tocar 'Ingresar venta de hoy'", async () => {
    (getCurrentCommission as jest.Mock).mockResolvedValue({
      id: "c1", vendorId: "v1", periodMonth: "2026-09", accumulatedSales: 0, accumulatedReturns: 0,
      returnRate: 0, commissionEarned: 0, budgetProgress: 0, closed: false, closedAt: null,
    });
    const onEnterSale = jest.fn();
    const { findByTestId } = renderHome(onEnterSale);
    fireEvent.press(await findByTestId("go-to-sales-entry"));
    expect(onEnterSale).toHaveBeenCalledTimes(1);
  });

  it("MW3: confirmar el diálogo de cierre de sesión llama a logout", async () => {
    (getCurrentCommission as jest.Mock).mockResolvedValue({
      id: "c1", vendorId: "v1", periodMonth: "2026-09", accumulatedSales: 0, accumulatedReturns: 0,
      returnRate: 0, commissionEarned: 0, budgetProgress: 0, closed: false, closedAt: null,
    });
    const { findByTestId, getByTestId } = renderHome();
    fireEvent.press(await findByTestId("open-logout-dialog"));
    fireEvent.press(getByTestId("confirm-dialog-confirm"));
    await waitFor(() => expect(logoutRequest).toHaveBeenCalledTimes(1));
  });
});
