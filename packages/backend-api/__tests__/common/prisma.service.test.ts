import { describe, expect, it, vi } from "vitest";
import { PrismaService } from "../../src/prisma/prisma.service";

describe("PrismaService", () => {
  it("onModuleInit conecta vía $connect", async () => {
    const service = new PrismaService();
    const connectSpy = vi.spyOn(service, "$connect" as any).mockResolvedValue(undefined as any);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it("onModuleInit propaga y loguea el error si la conexión falla al arrancar", async () => {
    const service = new PrismaService();
    vi.spyOn(service, "$connect" as any).mockRejectedValue(new Error("no se pudo conectar"));

    await expect(service.onModuleInit()).rejects.toThrow("no se pudo conectar");
  });

  it("onModuleDestroy desconecta vía $disconnect", async () => {
    const service = new PrismaService();
    const disconnectSpy = vi.spyOn(service, "$disconnect" as any).mockResolvedValue(undefined as any);

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
