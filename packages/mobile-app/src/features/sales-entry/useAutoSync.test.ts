import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { useAutoSync } from "./useAutoSync";
import { runSync } from "./syncEngine";
import { getCurrentConnectivity, onReconnect } from "../../shared/net/connectivity";

jest.mock("./syncEngine");
jest.mock("../../shared/net/connectivity");

const mockRunSync = runSync as jest.Mock;
const mockGetCurrentConnectivity = getCurrentConnectivity as jest.Mock;
const mockOnReconnect = onReconnect as jest.Mock;

describe("useAutoSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnReconnect.mockReturnValue(jest.fn());
  });

  it("no dispara sincronización si no hay vendorId (sin sesión)", () => {
    renderHook(() => useAutoSync(null), { wrapper: createQueryWrapper() });
    expect(mockGetCurrentConnectivity).not.toHaveBeenCalled();
    expect(mockOnReconnect).not.toHaveBeenCalled();
  });

  it("R-03: sincroniza al montar si ya hay conexión disponible desde el arranque", async () => {
    mockGetCurrentConnectivity.mockResolvedValue(true);
    mockRunSync.mockResolvedValue({ appliedCount: 1, rejectedCount: 0, skipped: false });

    renderHook(() => useAutoSync("v1"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(mockRunSync).toHaveBeenCalledWith("v1"));
  });

  it("no sincroniza al montar si no hay conexión disponible", async () => {
    mockGetCurrentConnectivity.mockResolvedValue(false);

    renderHook(() => useAutoSync("v1"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(mockGetCurrentConnectivity).toHaveBeenCalled());
    expect(mockRunSync).not.toHaveBeenCalled();
  });

  it("MW8: se suscribe a transiciones de reconexión y sincroniza al dispararse", async () => {
    mockGetCurrentConnectivity.mockResolvedValue(false);
    mockRunSync.mockResolvedValue({ appliedCount: 0, rejectedCount: 1, skipped: false });
    let reconnectCallback: (() => void) | undefined;
    mockOnReconnect.mockImplementation((cb: () => void) => {
      reconnectCallback = cb;
      return jest.fn();
    });

    renderHook(() => useAutoSync("v1"), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(mockOnReconnect).toHaveBeenCalled());

    reconnectCallback?.();
    await waitFor(() => expect(mockRunSync).toHaveBeenCalledWith("v1"));
  });

  it("se desuscribe al desmontar", () => {
    mockGetCurrentConnectivity.mockResolvedValue(false);
    const unsubscribe = jest.fn();
    mockOnReconnect.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAutoSync("v1"), { wrapper: createQueryWrapper() });
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
