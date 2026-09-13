import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../../shared/api/apiClient";
import { sendManualNotification } from "./api";

describe("features/manual-notification/api", () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it("envía la notificación a una lista de vendorId (202, MW15 paso 4)", async () => {
    mock.onPost("/notifications/manual", { message: "Hola", recipients: ["v1", "v2"] }).reply(202);
    await expect(sendManualNotification({ message: "Hola", recipients: ["v1", "v2"] })).resolves.toBeUndefined();
  });

  it("envía la notificación a todos los vendedores con recipients='all'", async () => {
    mock.onPost("/notifications/manual", { message: "Hola a todos", recipients: "all" }).reply(202);
    await expect(sendManualNotification({ message: "Hola a todos", recipients: "all" })).resolves.toBeUndefined();
  });

  it("propaga 400 si el mensaje está vacío o los destinatarios son inválidos (AC9.1.3)", async () => {
    mock.onPost("/notifications/manual").reply(400, { code: "VALIDATION_ERROR", message: "Mensaje vacío" });
    await expect(sendManualNotification({ message: "", recipients: "all" })).rejects.toBeDefined();
  });

  it("propaga 403 si quien envía no es supervisor", async () => {
    mock.onPost("/notifications/manual").reply(403, { code: "FORBIDDEN", message: "No autorizado" });
    await expect(sendManualNotification({ message: "x", recipients: "all" })).rejects.toBeDefined();
  });
});
