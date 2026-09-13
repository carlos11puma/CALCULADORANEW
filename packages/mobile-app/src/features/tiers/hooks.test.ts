import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { useReplaceTiers, useTiers } from "./hooks";
import { getTiers, replaceTiers } from "./api";

jest.mock("./api");

describe("tiers hooks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("useTiers: MW14 paso 1, consulta por canal", async () => {
    (getTiers as jest.Mock).mockResolvedValue({ tiers: [], inOrder: true });
    const { result } = renderHook(() => useTiers("preventa"), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTiers).toHaveBeenCalledWith("preventa");
  });

  it("useReplaceTiers: MW14 paso 4, refleja warning=TIER_ORDER_WARNING sin bloquear el guardado", async () => {
    (replaceTiers as jest.Mock).mockResolvedValue({ tiers: [], inOrder: false, warning: "TIER_ORDER_WARNING" });
    const { result } = renderHook(() => useReplaceTiers("preventa"), { wrapper: createQueryWrapper() });
    result.current.mutate([{ channel: "preventa", tierType: "por_efectividad", order: 1, thresholdValue: 10, commissionRate: 1 }]);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.warning).toBe("TIER_ORDER_WARNING");
  });

  it("useReplaceTiers: MW14 paso 5, un 400 de validación se propaga como error", async () => {
    (replaceTiers as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 400 } });
    const { result } = renderHook(() => useReplaceTiers("autoventa"), { wrapper: createQueryWrapper() });
    result.current.mutate([]);
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
