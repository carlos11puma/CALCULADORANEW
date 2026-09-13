import { describe, expect, it, vi } from "vitest";
import { of, throwError } from "rxjs";
import { LoggingInterceptor } from "../../src/common/interceptors/logging.interceptor";

function buildContext(user?: any) {
  const request: any = { method: "GET", url: "/api/v1/commission/current", user, headers: {} };
  const response: any = { statusCode: 200, setHeader: vi.fn() };
  return {
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    __request: request,
    __response: response,
  } as any;
}

describe("LoggingInterceptor", () => {
  it("adjunta un correlationId al request y al header de respuesta", async () => {
    const interceptor = new LoggingInterceptor();
    const context = buildContext({ userId: "usr_1" });
    const next = { handle: () => of({ ok: true }) };

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, next as any).subscribe(() => resolve());
    });

    expect(context.__request.correlationId).toBeDefined();
    expect(context.__response.setHeader).toHaveBeenCalledWith("X-Correlation-Id", expect.any(String));
  });

  it("emite el log incluso cuando el handler lanza un error, sin detener la propagación", async () => {
    const interceptor = new LoggingInterceptor();
    const context = buildContext(undefined);
    const error = Object.assign(new Error("boom"), { status: 500 });
    const next = { handle: () => throwError(() => error) };
    const logSpy = vi.spyOn((interceptor as any).logger, "log").mockImplementation(() => undefined);

    await expect(
      new Promise((_resolve, reject) => {
        interceptor.intercept(context, next as any).subscribe({ error: reject });
      }),
    ).rejects.toThrow("boom");

    expect(logSpy).toHaveBeenCalled();
  });

  it("nunca incluye el body de la petición en el log (NFR3.13)", async () => {
    const interceptor = new LoggingInterceptor();
    const context = buildContext({ userId: "usr_1" });
    context.__request.body = { password: "secreto" };
    const next = { handle: () => of({}) };
    const logSpy = vi.spyOn((interceptor as any).logger, "log").mockImplementation(() => undefined);

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, next as any).subscribe(() => resolve());
    });

    const loggedPayload = logSpy.mock.calls[0][0] as string;
    expect(loggedPayload).not.toContain("secreto");
  });
});
