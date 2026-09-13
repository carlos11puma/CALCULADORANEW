import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { useNotifications } from "./hooks";
import { getNotifications } from "./api";

jest.mock("./api");

describe("useNotifications", () => {
  it("MW11 paso 2: retorna la lista plana entregada por el backend", async () => {
    (getNotifications as jest.Mock).mockResolvedValue([{ id: "n1", type: "manual" }]);
    const { result } = renderHook(() => useNotifications(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "n1", type: "manual" }]);
  });

  it("expone isError cuando la petición falla", async () => {
    (getNotifications as jest.Mock).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useNotifications(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
