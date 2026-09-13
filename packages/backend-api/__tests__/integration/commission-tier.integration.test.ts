import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import request from "supertest";
import { CommissionTierController } from "../../src/commission-tier/commission-tier.controller";
import { CommissionTierService } from "../../src/commission-tier/commission-tier.service";
import { CommissionLedgerService } from "../../src/commission-ledger/commission-ledger.service";
import { RolesGuard } from "../../src/common/guards/roles.guard";
import { HttpExceptionFilter } from "../../src/common/filters/http-exception.filter";
import { preventaTiersInOrder } from "../../__fixtures__";

describe("CommissionTierController (integration)", () => {
  let app: INestApplication;
  let tierService: { getTiers: any; replaceTiers: any };
  let ledgerService: { recalculateAllForChannel: any };

  beforeEach(async () => {
    tierService = { getTiers: vi.fn(), replaceTiers: vi.fn() };
    ledgerService = { recalculateAllForChannel: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [CommissionTierController],
      providers: [
        { provide: CommissionTierService, useValue: tierService },
        { provide: CommissionLedgerService, useValue: ledgerService },
        Reflector,
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /tiers — 200 con los tramos del canal e indicador de orden", async () => {
    tierService.getTiers.mockResolvedValue({ tiers: preventaTiersInOrder, inOrder: true });
    const response = await request(app.getHttpServer()).get("/api/v1/tiers?channel=preventa");
    expect(response.status).toBe(200);
    expect(response.body.inOrder).toBe(true);
  });

  it("PUT /tiers — 200 con warning TIER_ORDER_WARNING cuando queda fuera de orden (no bloquea)", async () => {
    tierService.replaceTiers.mockResolvedValue({ tiers: preventaTiersInOrder, inOrder: false, warning: "TIER_ORDER_WARNING" });
    const response = await request(app.getHttpServer())
      .put("/api/v1/tiers")
      .send({ tiers: [{ channel: "preventa", tierType: "por_devolucion", order: 1, thresholdValue: 5, commissionRate: 0.05 }] });
    expect(response.status).toBe(200);
    expect(response.body.warning).toBe("TIER_ORDER_WARNING");
    expect(ledgerService.recalculateAllForChannel).toHaveBeenCalledWith("preventa");
  });

  it("PUT /tiers — 400 cuando un tramo trae thresholdValue negativo", async () => {
    const response = await request(app.getHttpServer())
      .put("/api/v1/tiers")
      .send({ tiers: [{ channel: "preventa", tierType: "por_devolucion", order: 1, thresholdValue: -1, commissionRate: 0.05 }] });
    expect(response.status).toBe(400);
  });

  it("PUT /tiers — 400 cuando falta el arreglo de tramos", async () => {
    const response = await request(app.getHttpServer()).put("/api/v1/tiers").send({});
    expect(response.status).toBe(400);
  });
});
