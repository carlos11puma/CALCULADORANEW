import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { useCurrentCommission } from "./hooks";
import { getCurrentCommission } from "./api";

jest.mock("./api");

describe("useCurrentCommission", () => {
  it("expone el resultado de GET /commission/current bajo la clave ['commission','current']", async () => {
    (getCurrentCommission as jest.Mock).mockResolvedValue({ id: "c1", commissionEarned: 500 });
    const { result } = renderHook(() => useCurrentCommission(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "c1", commissionEarned: 500 });
  });

  it("expone isError cuando la petición falla", async () => {
    (getCurrentCommission as jest.Mock).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useCurrentCommission(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
