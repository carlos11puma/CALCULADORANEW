import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../../shared/api/apiClient";
import { getVendors, createVendor, updateVendor } from "./api";

describe("features/roster/api", () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it("getVendors retorna el roster (200, MW12)", async () => {
    mock.onGet("/vendors").reply(200, [
      { id: "v1", userId: "u1", route: "014461", name: "Juan Pérez", channel: "preventa", budget: 5000, active: true },
    ]);
    const result = await getVendors();
    expect(result).toHaveLength(1);
  });

  it("createVendor crea un vendedor (201)", async () => {
    mock.onPost("/vendors", { route: "014462", name: "Ana Ruiz", channel: "autoventa", budget: 4200 }).reply(201, {
      id: "v2",
      userId: "u2",
      route: "014462",
      name: "Ana Ruiz",
      channel: "autoventa",
      budget: 4200,
      active: true,
    });
    const result = await createVendor({ route: "014462", name: "Ana Ruiz", channel: "autoventa", budget: 4200 });
    expect(result.id).toBe("v2");
  });

  it("createVendor propaga 400 de validación (AC2.2.2)", async () => {
    mock.onPost("/vendors").reply(400, { code: "VALIDATION_ERROR", message: "Presupuesto inválido" });
    await expect(
      createVendor({ route: "x", name: "y", channel: "preventa", budget: 0 }),
    ).rejects.toBeDefined();
  });

  it("updateVendor actualiza ruta/canal/presupuesto de un vendedor existente (200, MW12/MW13)", async () => {
    mock.onPatch("/vendors/v1", { route: "014461", name: "Juan Pérez", channel: "preventa", budget: 5500 }).reply(200, {
      id: "v1",
      userId: "u1",
      route: "014461",
      name: "Juan Pérez",
      channel: "preventa",
      budget: 5500,
      active: true,
    });
    const result = await updateVendor("v1", { route: "014461", name: "Juan Pérez", channel: "preventa", budget: 5500 });
    expect(result.budget).toBe(5500);
  });

  it("updateVendor propaga 404 si el vendedor no existe", async () => {
    mock.onPatch("/vendors/no-existe").reply(404, { code: "NOT_FOUND", message: "Vendedor no existe" });
    await expect(
      updateVendor("no-existe", { route: "x", name: "y", channel: "preventa", budget: 1 }),
    ).rejects.toBeDefined();
  });
});
