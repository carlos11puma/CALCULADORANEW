import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../../shared/api/apiClient";
import { loginVendedor, loginSupervisor, logout } from "./api";

describe("features/auth/api", () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it("loginVendedor envía username/password y retorna la sesión (200)", async () => {
    mock.onPost("/auth/login/vendedor", { username: "juan", password: "secreto" }).reply(200, {
      token: "tok",
      userId: "u1",
      role: "vendedor",
    });
    const result = await loginVendedor("juan", "secreto");
    expect(result).toEqual({ token: "tok", userId: "u1", role: "vendedor" });
  });

  it("loginVendedor propaga el 401 de credenciales inválidas (MW1 paso 4)", async () => {
    mock.onPost("/auth/login/vendedor").reply(401, { code: "UNAUTHORIZED", message: "Usuario o contraseña incorrectos" });
    await expect(loginVendedor("juan", "malo")).rejects.toBeDefined();
  });

  it("loginSupervisor envía el PIN y retorna la sesión de supervisor (200)", async () => {
    mock.onPost("/auth/login/supervisor", { pin: "1234" }).reply(200, {
      token: "tok2",
      userId: "sup1",
      role: "supervisor",
    });
    const result = await loginSupervisor("1234");
    expect(result.role).toBe("supervisor");
  });

  it("loginSupervisor propaga el 401 de PIN incorrecto", async () => {
    mock.onPost("/auth/login/supervisor").reply(401, { code: "UNAUTHORIZED", message: "PIN incorrecto" });
    await expect(loginSupervisor("0000")).rejects.toBeDefined();
  });

  it("logout llama a POST /auth/logout", async () => {
    mock.onPost("/auth/logout").reply(204);
    await expect(logout()).resolves.toBeUndefined();
  });

  it("logout propaga el error si el servidor falla (el llamador decide el comportamiento best-effort)", async () => {
    mock.onPost("/auth/logout").networkError();
    await expect(logout()).rejects.toBeDefined();
  });
});
