import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ConflictException, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { SalesEntryController } from "../../src/sales-entry/sales-entry.controller";
import { SalesEntryService } from "../../src/sales-entry/sales-entry.service";
import { HttpExceptionFilter } from "../../src/common/filters/http-exception.filter";
import { dailySaleFixture, preventaVendor } from "../../__fixtures__";

describe("SalesEntryController (integration)", () => {
  let app: INestApplication;
  let salesService: { recordSale: any; syncBatch: any };

  beforeEach(async () => {
    salesService = { recordSale: vi.fn(), syncBatch: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [SalesEntryController],
      providers: [{ provide: SalesEntryService, useValue: salesService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    // Simula lo que AuthGuard adjunta normalmente a la petición.
    app.use((req: any, _res: any, next: any) => {
      req.user = { userId: "usr_1", role: "vendedor", vendorId: preventaVendor.id };
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("POST /sales — 200/201 al registrar la venta del día (W6)", async () => {
    salesService.recordSale.mockResolvedValue(dailySaleFixture);
    const response = await request(app.getHttpServer())
      .post("/api/v1/sales")
      .send({ saleDate: "2026-09-05", amount: 1000, returns: 50 });
    expect(response.status).toBe(201);
    expect(salesService.recordSale).toHaveBeenCalledWith(preventaVendor.id, { saleDate: "2026-09-05", amount: 1000, returns: 50 });
  });

  it("POST /sales — 400 VALIDATION_ERROR cuando amount es negativo (BR3.1)", async () => {
    const response = await request(app.getHttpServer()).post("/api/v1/sales").send({ saleDate: "2026-09-05", amount: -1, returns: 0 });
    expect(response.status).toBe(400);
  });

  it("POST /sales — 409 cuando el día ya cerró (BR3.2)", async () => {
    salesService.recordSale.mockRejectedValue(new ConflictException({ code: "DAY_CLOSED", message: "El día ya cerró" }));
    const response = await request(app.getHttpServer())
      .post("/api/v1/sales")
      .send({ saleDate: "2026-09-05", amount: 1000, returns: 50 });
    expect(response.status).toBe(409);
  });

  it("POST /sales/sync — 200 con el resultado por ítem del lote (W7)", async () => {
    salesService.syncBatch.mockResolvedValue([
      { saleDate: "2026-09-01", status: "applied" },
      { saleDate: "2026-08-15", status: "rejected", error: { code: "PERIOD_CLOSED", message: "cerrado" } },
    ]);
    const response = await request(app.getHttpServer())
      .post("/api/v1/sales/sync")
      .send([
        { saleDate: "2026-09-01", amount: 100, returns: 0 },
        { saleDate: "2026-08-15", amount: 200, returns: 0 },
      ]);
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
    expect(response.body[1].status).toBe("rejected");
  });

  it("POST /sales/sync — 200 con un lote vacío (no hay nada que aplicar)", async () => {
    salesService.syncBatch.mockResolvedValue([]);
    const response = await request(app.getHttpServer()).post("/api/v1/sales/sync").send([]);
    expect(response.status).toBe(201);
    expect(response.body).toEqual([]);
  });
});
