import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { INestApplication, NotFoundException, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import request from "supertest";
import { VendorDirectoryController } from "../../src/vendor-directory/vendor-directory.controller";
import { VendorDirectoryService } from "../../src/vendor-directory/vendor-directory.service";
import { RolesGuard } from "../../src/common/guards/roles.guard";
import { HttpExceptionFilter } from "../../src/common/filters/http-exception.filter";
import { preventaVendor } from "../../__fixtures__";

describe("VendorDirectoryController (integration)", () => {
  let app: INestApplication;
  let vendorService: { listAll: any; create: any; update: any };

  beforeEach(async () => {
    vendorService = { listAll: vi.fn(), create: vi.fn(), update: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [VendorDirectoryController],
      providers: [{ provide: VendorDirectoryService, useValue: vendorService }, Reflector],
    })
      // RolesGuard depende de request.user, resuelto por el AuthGuard global — no
      // registrado en este módulo aislado (se prueba por separado en roles.guard.test.ts).
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

  it("GET /vendors — 200 con el roster (W4)", async () => {
    vendorService.listAll.mockResolvedValue([preventaVendor]);
    const response = await request(app.getHttpServer()).get("/api/v1/vendors");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("POST /vendors — 201 al crear con presupuesto válido", async () => {
    vendorService.create.mockResolvedValue(preventaVendor);
    const response = await request(app.getHttpServer())
      .post("/api/v1/vendors")
      .send({ route: "Ruta 1", name: "Juan Pérez", channel: "preventa", budget: 1000 });
    expect(response.status).toBe(201);
  });

  it("POST /vendors — 400 VALIDATION_ERROR con presupuesto negativo (AC2.2.2)", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/vendors")
      .send({ route: "Ruta 1", name: "Juan Pérez", channel: "preventa", budget: -10 });
    expect(response.status).toBe(400);
  });

  it("POST /vendors — 400 cuando falta un campo requerido (channel)", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/vendors")
      .send({ route: "Ruta 1", name: "Juan Pérez", budget: 1000 });
    expect(response.status).toBe(400);
  });

  it("PATCH /vendors/:id — 200 al editar", async () => {
    vendorService.update.mockResolvedValue({ ...preventaVendor, budget: 2000 });
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/vendors/${preventaVendor.id}`)
      .send({ route: "Ruta 1", name: "Juan Pérez", channel: "preventa", budget: 2000 });
    expect(response.status).toBe(200);
    expect(response.body.budget).toBe(2000);
  });

  it("PATCH /vendors/:id — 404 cuando el vendedor no existe", async () => {
    vendorService.update.mockRejectedValue(new NotFoundException({ code: "NOT_FOUND", message: "Vendedor no existe" }));
    const response = await request(app.getHttpServer())
      .patch("/api/v1/vendors/no-existe")
      .send({ route: "Ruta 1", name: "Juan Pérez", channel: "preventa", budget: 2000 });
    expect(response.status).toBe(404);
  });
});
