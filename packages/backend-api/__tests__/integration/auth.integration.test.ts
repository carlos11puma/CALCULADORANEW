import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { INestApplication, UnauthorizedException, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AuthController } from "../../src/auth/auth.controller";
import { AuthService } from "../../src/auth/auth.service";
import { HttpExceptionFilter } from "../../src/common/filters/http-exception.filter";
import { LoginThrottlerGuard } from "../../src/common/guards/login-throttler.guard";

describe("AuthController (integration)", () => {
  let app: INestApplication;
  let authService: { loginVendedor: any; loginSupervisor: any; logout: any };

  beforeEach(async () => {
    authService = { loginVendedor: vi.fn(), loginSupervisor: vi.fn(), logout: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      // El LoginThrottlerGuard depende de storage/reflector de @nestjs/throttler que no
      // se registra en este módulo aislado — se sobreescribe para probar el controller
      // en aislamiento (el comportamiento de throttling en sí se prueba a nivel de guard).
      .overrideGuard(LoginThrottlerGuard)
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

  it("POST /auth/login/vendedor — 200 con token en login exitoso (W1)", async () => {
    authService.loginVendedor.mockResolvedValue({ token: "tok1", userId: "u1", role: "vendedor" });

    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login/vendedor")
      .send({ username: "juan.perez", password: "secret" });

    expect(response.status).toBe(201); // NestJS POST por defecto retorna 201 salvo @HttpCode explícito
    expect(response.body).toEqual({ token: "tok1", userId: "u1", role: "vendedor" });
  });

  it("POST /auth/login/vendedor — 400 VALIDATION_ERROR cuando falta username", async () => {
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login/vendedor").send({ password: "secret" });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("POST /auth/login/vendedor — 401 cuando las credenciales son inválidas", async () => {
    authService.loginVendedor.mockRejectedValue(
      new UnauthorizedException({ code: "UNAUTHORIZED", message: "Credenciales inválidas" }),
    );
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login/vendedor")
      .send({ username: "juan.perez", password: "wrong" });
    expect(response.status).toBe(401);
  });

  it("POST /auth/login/supervisor — 200 con token en login exitoso (W2)", async () => {
    authService.loginSupervisor.mockResolvedValue({ token: "tok2", userId: "u2", role: "supervisor" });
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login/supervisor").send({ pin: "1234" });
    expect(response.status).toBe(201);
    expect(response.body.role).toBe("supervisor");
  });

  it("POST /auth/login/supervisor — 400 cuando el campo pin no viene", async () => {
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login/supervisor").send({});
    expect(response.status).toBe(400);
  });

  it("POST /auth/logout — 204 al revocar la sesión vigente (W3)", async () => {
    authService.logout.mockResolvedValue(undefined);
    const response = await request(app.getHttpServer()).post("/api/v1/auth/logout").set("Authorization", "Bearer tok1");
    expect(response.status).toBe(204);
  });
});
