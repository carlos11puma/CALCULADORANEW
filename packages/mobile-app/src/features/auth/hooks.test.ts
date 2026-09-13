import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { useLoginSupervisor, useLoginVendedor } from "./hooks";
import { loginSupervisor, loginVendedor } from "./api";

jest.mock("./api");

describe("auth hooks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("useLoginVendedor: MW1 paso 3, retorna token/userId/role en 200", async () => {
    (loginVendedor as jest.Mock).mockResolvedValue({ token: "t1", userId: "v1", role: "vendedor" });
    const { result } = renderHook(() => useLoginVendedor(), { wrapper: createQueryWrapper() });
    result.current.mutate({ username: "carlos", password: "secret" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(loginVendedor).toHaveBeenCalledWith("carlos", "secret");
  });

  it("useLoginVendedor: MW1 paso 4, un 401 se propaga como error", async () => {
    (loginVendedor as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
    const { result } = renderHook(() => useLoginVendedor(), { wrapper: createQueryWrapper() });
    result.current.mutate({ username: "carlos", password: "malo" });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("useLoginSupervisor: MW2 paso 3, retorna sesión rol=supervisor en 200", async () => {
    (loginSupervisor as jest.Mock).mockResolvedValue({ token: "t2", userId: "s1", role: "supervisor" });
    const { result } = renderHook(() => useLoginSupervisor(), { wrapper: createQueryWrapper() });
    result.current.mutate({ pin: "1234" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(loginSupervisor).toHaveBeenCalledWith("1234");
  });
});
