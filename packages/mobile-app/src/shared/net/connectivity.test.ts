import NetInfo from "@react-native-community/netinfo";
import { isConnected, getCurrentConnectivity, onReconnect } from "./connectivity";

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

describe("connectivity", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("isConnected es true cuando isConnected e isInternetReachable son true", () => {
    expect(isConnected({ isConnected: true, isInternetReachable: true } as any)).toBe(true);
  });

  it("isConnected es false cuando isConnected es false", () => {
    expect(isConnected({ isConnected: false, isInternetReachable: true } as any)).toBe(false);
  });

  it("isConnected es false cuando isInternetReachable es explícitamente false", () => {
    expect(isConnected({ isConnected: true, isInternetReachable: false } as any)).toBe(false);
  });

  it("isConnected es false cuando el estado es null", () => {
    expect(isConnected(null)).toBe(false);
  });

  it("getCurrentConnectivity delega en NetInfo.fetch", async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true, isInternetReachable: true });
    expect(await getCurrentConnectivity()).toBe(true);
  });

  it("onReconnect dispara el callback solo en la transición sin-conexión → con-conexión", () => {
    let listener: (state: any) => void = () => {};
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
      listener = cb;
      return jest.fn();
    });
    const callback = jest.fn();
    onReconnect(callback);

    listener({ isConnected: false, isInternetReachable: false }); // arranca sin conexión
    expect(callback).not.toHaveBeenCalled();

    listener({ isConnected: true, isInternetReachable: true }); // transición → reconecta
    expect(callback).toHaveBeenCalledTimes(1);

    listener({ isConnected: true, isInternetReachable: true }); // sigue conectado, no reintenta
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("onReconnect retorna una función de desuscripción", () => {
    const unsubscribeMock = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribeMock);
    const unsubscribe = onReconnect(jest.fn());
    unsubscribe();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
