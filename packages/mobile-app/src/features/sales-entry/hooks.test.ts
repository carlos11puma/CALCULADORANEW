import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { loadTodaySaleDraft, useSaveSale } from "./hooks";
import { postSale } from "./api";
import { getCurrentConnectivity } from "../../shared/net/connectivity";
import { getPendingSale, upsertPendingSale, __resetDbForTests } from "../../shared/storage/pendingSalesDb";

const { expoSqliteMock } = require("../../shared/__fixtures__/expoSqliteMock");

jest.mock("./api");
jest.mock("../../shared/net/connectivity");

const mockPostSale = postSale as jest.Mock;
const mockGetCurrentConnectivity = getCurrentConnectivity as jest.Mock;

describe("useSaveSale", () => {
  beforeEach(() => {
    expoSqliteMock.__resetAll();
    __resetDbForTests();
    jest.clearAllMocks();
  });

  it("MW6: con conexión, guarda remoto y retorna offline=false", async () => {
    mockGetCurrentConnectivity.mockResolvedValue(true);
    mockPostSale.mockResolvedValue({ id: "s1", vendorId: "v1", saleDate: "2026-09-08", amount: 100, returns: 0, syncStatus: "synced", closed: false });

    const { result } = renderHook(() => useSaveSale("v1"), { wrapper: createQueryWrapper() });
    result.current.mutate({ saleDate: "2026-09-08", amount: 100, returns: 0 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.offline).toBe(false);
    expect(mockPostSale).toHaveBeenCalledWith({ saleDate: "2026-09-08", amount: 100, returns: 0 });
  });

  it("MW7: sin conexión detectada, guarda localmente sin llamar a la API", async () => {
    mockGetCurrentConnectivity.mockResolvedValue(false);

    const { result } = renderHook(() => useSaveSale("v1"), { wrapper: createQueryWrapper() });
    result.current.mutate({ saleDate: "2026-09-08", amount: 50, returns: 5 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.offline).toBe(true);
    expect(mockPostSale).not.toHaveBeenCalled();
    const stored = await getPendingSale("v1", "2026-09-08");
    expect(stored?.amount).toBe(50);
  });

  it("AC3.3.4: la conexión se pierde a mitad del POST — guarda local en vez de mostrar error", async () => {
    mockGetCurrentConnectivity.mockResolvedValue(true);
    mockPostSale.mockRejectedValue({ isAxiosError: true, response: undefined, message: "Network Error" });

    const { result } = renderHook(() => useSaveSale("v1"), { wrapper: createQueryWrapper() });
    result.current.mutate({ saleDate: "2026-09-08", amount: 75, returns: 0 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.offline).toBe(true);
    const stored = await getPendingSale("v1", "2026-09-08");
    expect(stored?.amount).toBe(75);
  });

  it("MW6 paso 4/5: un 400/409 real (con response) se propaga como error, no se guarda local", async () => {
    mockGetCurrentConnectivity.mockResolvedValue(true);
    mockPostSale.mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { code: "PERIOD_CLOSED" } } });

    const { result } = renderHook(() => useSaveSale("v1"), { wrapper: createQueryWrapper() });
    result.current.mutate({ saleDate: "2026-09-08", amount: 20, returns: 0 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    const stored = await getPendingSale("v1", "2026-09-08");
    expect(stored).toBeNull();
  });

  it("lanza un error claro si se invoca sin vendorId (sin sesión de vendedor)", async () => {
    const { result } = renderHook(() => useSaveSale(null), { wrapper: createQueryWrapper() });
    result.current.mutate({ saleDate: "2026-09-08", amount: 20, returns: 0 });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("loadTodaySaleDraft", () => {
  beforeEach(() => {
    expoSqliteMock.__resetAll();
    __resetDbForTests();
  });

  it("retorna null cuando no hay venta local pendiente para la fecha", async () => {
    const draft = await loadTodaySaleDraft("v1", "2026-09-08");
    expect(draft).toBeNull();
  });

  it("MW5 paso 2: precarga el formulario si ya existe una venta local pendiente", async () => {
    await upsertPendingSale({ vendorId: "v1", saleDate: "2026-09-08", amount: 33, returns: 2 });
    const draft = await loadTodaySaleDraft("v1", "2026-09-08");
    expect(draft).toEqual({ amount: "33", returns: "2" });
  });
});
