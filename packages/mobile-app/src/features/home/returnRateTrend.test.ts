import { __clearReturnRateTrendForTests, computeReturnRateTrend } from "./returnRateTrend";

describe("computeReturnRateTrend", () => {
  const vendorId = "vendor-1";

  beforeEach(async () => {
    await __clearReturnRateTrendForTests(vendorId);
  });

  it("retorna 'flat' en la primera apertura (sin valor previo persistido)", async () => {
    const trend = await computeReturnRateTrend(vendorId, 5);
    expect(trend).toBe("flat");
  });

  it("retorna 'down' (mejora) cuando la tasa actual es menor que la persistida", async () => {
    await computeReturnRateTrend(vendorId, 10);
    const trend = await computeReturnRateTrend(vendorId, 6);
    expect(trend).toBe("down");
  });

  it("retorna 'up' (empeoró) cuando la tasa actual es mayor que la persistida", async () => {
    await computeReturnRateTrend(vendorId, 4);
    const trend = await computeReturnRateTrend(vendorId, 9);
    expect(trend).toBe("up");
  });

  it("retorna 'flat' cuando la tasa no cambió", async () => {
    await computeReturnRateTrend(vendorId, 7);
    const trend = await computeReturnRateTrend(vendorId, 7);
    expect(trend).toBe("flat");
  });

  it("persiste el valor por separado para cada vendedor", async () => {
    await computeReturnRateTrend("vendor-A", 20);
    const trendB = await computeReturnRateTrend("vendor-B", 1);
    expect(trendB).toBe("flat"); // vendor-B no tiene valor previo propio
  });
});
