import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import request from "supertest";
import { NotificationController } from "../../src/notification/notification.controller";
import { NotificationService } from "../../src/notification/notification.service";
import { RolesGuard } from "../../src/common/guards/roles.guard";
import { HttpExceptionFilter } from "../../src/common/filters/http-exception.filter";
import { preventaVendor } from "../../__fixtures__";

describe("NotificationController (integration)", () => {
  let app: INestApplication;
  let notificationService: { listForVendor: any; sendManual: any };

  beforeEach(async () => {
    notificationService = { listForVendor: vi.fn(), sendManual: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: notificationService }, Reflector],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

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

  it("GET /notifications — 200 con las notificaciones del vendedor (V5)", async () => {
    notificationService.listForVendor.mockResolvedValue([]);
    const response = await request(app.getHttpServer()).get("/api/v1/notifications");
    expect(response.status).toBe(200);
    expect(notificationService.listForVendor).toHaveBeenCalledWith(preventaVendor.id);
  });

  it("POST /notifications/manual — 202 al encolar la notificación (W13)", async () => {
    notificationService.sendManual.mockResolvedValue(3);
    const response = await request(app.getHttpServer())
      .post("/api/v1/notifications/manual")
      .send({ message: "Reunión mañana", recipients: "all" });
    expect(response.status).toBe(202);
  });

  it("POST /notifications/manual — 400 cuando el mensaje está vacío (BR9.1)", async () => {
    notificationService.sendManual.mockRejectedValue(new BadRequestException({ code: "VALIDATION_ERROR", message: "vacío" }));
    const response = await request(app.getHttpServer())
      .post("/api/v1/notifications/manual")
      .send({ message: "", recipients: "all" });
    expect(response.status).toBe(400);
  });

  it("POST /notifications/manual — 400 cuando recipients no es 'all' ni un arreglo válido", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/notifications/manual")
      .send({ message: "aviso", recipients: 123 });
    expect(response.status).toBe(400);
  });
});
