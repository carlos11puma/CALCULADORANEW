import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { useCreateVendor, useUpdateVendor, useVendors } from "./hooks";
import { createVendor, getVendors, updateVendor } from "./api";

jest.mock("./api");

describe("roster hooks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("useVendors: MW12 paso 1, retorna el roster", async () => {
    (getVendors as jest.Mock).mockResolvedValue([{ id: "v1", name: "Juan" }]);
    const { result } = renderHook(() => useVendors(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "v1", name: "Juan" }]);
  });

  it("useCreateVendor: MW12 paso 2, agrega y no lanza si el backend responde 201", async () => {
    (createVendor as jest.Mock).mockResolvedValue({ id: "v2", name: "Ana" });
    const { result } = renderHook(() => useCreateVendor(), { wrapper: createQueryWrapper() });
    result.current.mutate({ route: "R1", name: "Ana", channel: "preventa", budget: 1000 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((createVendor as jest.Mock).mock.calls[0][0]).toEqual({
      route: "R1",
      name: "Ana",
      channel: "preventa",
      budget: 1000,
    });
  });

  it("useUpdateVendor: MW12 paso 3 / MW13 paso 2, envía vendorId + input a PATCH", async () => {
    (updateVendor as jest.Mock).mockResolvedValue({ id: "v1", budget: 2000 });
    const { result } = renderHook(() => useUpdateVendor(), { wrapper: createQueryWrapper() });
    result.current.mutate({ vendorId: "v1", input: { route: "R1", name: "Juan", channel: "preventa", budget: 2000 } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((updateVendor as jest.Mock).mock.calls[0]).toEqual([
      "v1",
      { route: "R1", name: "Juan", channel: "preventa", budget: 2000 },
    ]);
  });

  it("useCreateVendor propaga un 400 de validación como error", async () => {
    (createVendor as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 400 } });
    const { result } = renderHook(() => useCreateVendor(), { wrapper: createQueryWrapper() });
    result.current.mutate({ route: "", name: "", channel: "preventa", budget: 0 });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
