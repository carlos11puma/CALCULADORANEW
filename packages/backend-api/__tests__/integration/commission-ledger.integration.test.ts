import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { CommissionLedgerController } from "../../src/commission-ledger/commission-ledger.controller";
import { CommissionLedgerService } from "../../src/commission-ledger/commission-ledger.service";
import { HttpExceptionFilter } from "../../src/common/filters/http-exception.filter";
import { closedPeriodFixture, currentPeriodFixture, preventaVendor } from "../../__fixtures__";

describe("CommissionLedgerController (integration)", () => {
  let app: INestApplication;
  let ledgerService: { getCurrentPeriod: any; getHistory: any };

  beforeEach(async () => {
    ledgerService = { getCurrentPeriod: vi.fn(), getHistory: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [CommissionLedgerController],
      providers: [{ provide: CommissionLedgerService, useValue: ledgerService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use((req: any, _res: any, next: any) => {
      req.user = { userId: "usr_1", role: "vendedor", vendorId: preventaVendor.id };
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /commission/current — 200 con el reporte en tiempo real (W8)", async () => {
    ledgerService.getCurrentPeriod.mockResolvedValue({ ...currentPeriodFixture, budgetProgress: 10 });
    const response = await request(app.getHttpServer()).get("/api/v1/commission/current");
    expect(response.status).toBe(200);
    expect(response.body.budgetProgress).toBe(10);
  });

  it("GET /commission/current — 200 con período en cero cuando el vendedor no tiene ventas aún", async () => {
    ledgerService.getCurrentPeriod.mockResolvedValue({ ...currentPeriodFixture, accumulatedSales: 0, commissionEarned: 0, budgetProgress: 0 });
    const response = await request(app.getHttpServer()).get("/api/v1/commission/current");
    expect(response.status).toBe(200);
    expect(response.body.commissionEarned).toBe(0);
  });

  it("GET /commission/history — 200 con solo períodos cerrados, más recientes primero (BR6.1)", async () => {
    ledgerService.getHistory.mockResolvedValue([closedPeriodFixture]);
    const response = await request(app.getHttpServer()).get("/api/v1/commission/history?limit=5");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(JSON.parse(JSON.stringify([closedPeriodFixture])));
    expect(ledgerService.getHistory).toHaveBeenCalledWith(preventaVendor.id, 5);
  });

  it("GET /commission/history — 200 con arreglo vacío cuando no hay períodos cerrados aún", async () => {
    ledgerService.getHistory.mockResolvedValue([]);
    const response = await request(app.getHttpServer()).get("/api/v1/commission/history");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
