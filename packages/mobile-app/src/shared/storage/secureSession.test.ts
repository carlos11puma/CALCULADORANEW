import { saveSession, getSession, getToken, clearSession } from "./secureSession";

describe("secureSession", () => {
  afterEach(async () => {
    await clearSession();
  });

  it("guarda y recupera una sesión completa", async () => {
    await saveSession({ token: "tok1", userId: "u1", role: "vendedor" });
    expect(await getSession()).toEqual({ token: "tok1", userId: "u1", role: "vendedor" });
  });

  it("getToken retorna solo el token", async () => {
    await saveSession({ token: "tok2", userId: "u2", role: "supervisor" });
    expect(await getToken()).toBe("tok2");
  });

  it("getSession retorna null si no hay sesión guardada", async () => {
    expect(await getSession()).toBeNull();
  });

  it("clearSession borra token/userId/role", async () => {
    await saveSession({ token: "tok3", userId: "u3", role: "vendedor" });
    await clearSession();
    expect(await getSession()).toBeNull();
    expect(await getToken()).toBeNull();
  });

  it("getSession retorna null si falta alguno de los tres valores (estado parcial)", async () => {
    await saveSession({ token: "tok4", userId: "u4", role: "vendedor" });
    const SecureStore = require("expo-secure-store");
    await SecureStore.deleteItemAsync("session_role");
    expect(await getSession()).toBeNull();
  });
});
