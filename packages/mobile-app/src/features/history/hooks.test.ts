import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { useCommissionHistory } from "./hooks";
import { getCommissionHistory } from "./api";

jest.mock("./api");

describe("useCommissionHistory", () => {
  it("MW10: retorna los períodos cerrados", async () => {
    (getCommissionHistory as jest.Mock).mockResolvedValue([{ id: "p1" }]);
    const { result } = renderHook(() => useCommissionHistory(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "p1" }]);
  });

  it("MW10 estado empty: retorna una lista vacía sin error", async () => {
    (getCommissionHistory as jest.Mock).mockResolvedValue([]);
    const { result } = renderHook(() => useCommissionHistory(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
