import MockAdapter from "axios-mock-adapter";
import { apiClient, registerSessionExpiredHandler } from "./apiClient";
import { saveSession, getSession, clearSession } from "../storage/secureSession";

describe("apiClient", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    registerSessionExpiredHandler(null);
  });

  afterEach(async () => {
    mock.restore();
    await clearSession();
  });

  it("usa el baseURL de configuración con el prefijo /api/v1", () => {
    expect(apiClient.defaults.baseURL).toBe("https://api-test.calculadora-comisiones.local/api/v1");
  });

  it("adjunta el header Authorization cuando hay un token guardado", async () => {
    await saveSession({ token: "abc123", userId: "u1", role: "vendedor" });
    mock.onGet("/commission/current").reply((config) => {
      expect(config.headers?.Authorization).toBe("Bearer abc123");
      return [200, { commissionEarned: 10 }];
    });
    await apiClient.get("/commission/current");
  });

  it("no adjunta Authorization si no hay sesión guardada", async () => {
    mock.onGet("/commission/current").reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined();
      return [200, {}];
    });
    await apiClient.get("/commission/current");
  });

  it("un 401 fuera de login/logout limpia la sesión y dispara el handler (MW9)", async () => {
    await saveSession({ token: "expired-token", userId: "u1", role: "vendedor" });
    const handler = jest.fn();
    registerSessionExpiredHandler(handler);
    mock.onGet("/commission/current").reply(401, { code: "UNAUTHORIZED", message: "Sesión expirada" });

    await expect(apiClient.get("/commission/current")).rejects.toBeDefined();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(await getSession()).toBeNull();
  });

  it("un 401 en /auth/login/vendedor NO dispara el handler de sesión expirada", async () => {
    const handler = jest.fn();
    registerSessionExpiredHandler(handler);
    mock.onPost("/auth/login/vendedor").reply(401, { code: "UNAUTHORIZED", message: "Credenciales inválidas" });

    await expect(
      apiClient.post("/auth/login/vendedor", { username: "x", password: "y" }),
    ).rejects.toBeDefined();

    expect(handler).not.toHaveBeenCalled();
  });

  it("un 401 en /auth/logout NO dispara el handler (cierra R-01 de nfr-design/security-design.md)", async () => {
    await saveSession({ token: "t", userId: "u1", role: "vendedor" });
    const handler = jest.fn();
    registerSessionExpiredHandler(handler);
    mock.onPost("/auth/logout").reply(401, { code: "UNAUTHORIZED", message: "Sin sesión válida" });

    await expect(apiClient.post("/auth/logout")).rejects.toBeDefined();

    expect(handler).not.toHaveBeenCalled();
  });

  it("una respuesta exitosa no dispara el handler de sesión expirada", async () => {
    const handler = jest.fn();
    registerSessionExpiredHandler(handler);
    mock.onGet("/commission/current").reply(200, { commissionEarned: 10 });
    await apiClient.get("/commission/current");
    expect(handler).not.toHaveBeenCalled();
  });
});
