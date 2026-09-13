import { renderHook, waitFor } from "@testing-library/react-native";
import { createQueryWrapper } from "../../shared/__fixtures__/queryTestUtils";
import { useSendManualNotification } from "./hooks";
import { sendManualNotification } from "./api";

jest.mock("./api");

describe("useSendManualNotification", () => {
  it("MW15 paso 4: envía message + recipients y resuelve en 202", async () => {
    (sendManualNotification as jest.Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSendManualNotification(), { wrapper: createQueryWrapper() });
    result.current.mutate({ message: "Hola equipo", recipients: "all" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((sendManualNotification as jest.Mock).mock.calls[0][0]).toEqual({
      message: "Hola equipo",
      recipients: "all",
    });
  });

  it("MW15 paso 5: un 400 (mensaje vacío) se propaga como error", async () => {
    (sendManualNotification as jest.Mock).mockRejectedValue({ isAxiosError: true, response: { status: 400 } });
    const { result } = renderHook(() => useSendManualNotification(), { wrapper: createQueryWrapper() });
    result.current.mutate({ message: "", recipients: ["v1"] });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
