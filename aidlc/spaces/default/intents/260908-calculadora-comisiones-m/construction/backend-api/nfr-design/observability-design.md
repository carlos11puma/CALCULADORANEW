# NFR Design — backend-api — Observability Design

## Sources

- [upstream:observability-requirements] `construction/backend-api/nfr-requirements/observability-requirements.md`
- [upstream:security-requirements] `construction/backend-api/nfr-requirements/security-requirements.md`

## Diseño: logging estructurado vía interceptor global (NFR6.6, NFR6.7)

Un `LoggingInterceptor` global (NestJS `Interceptor`) envuelve cada request y emite un log JSON estructurado a `stdout` con: `timestamp`, `method`, `path`, `userId` (de `request.user`, resuelto por `AuthGuard` — nunca ninguna credencial), `statusCode`, `durationMs`, y un `correlationId` (UUID generado por request, propagado también en la respuesta como header `X-Correlation-Id` para que el cliente pueda referenciarlo al reportar un problema). Un `ExceptionFilter` global complementa el interceptor: en cada error 4xx/5xx agrega el `Error.code` del contrato (`contract-summary.md`) al mismo log estructurado.

```
// Pseudocódigo ilustrativo
{
  "timestamp": "2026-09-08T15:00:00Z",
  "correlationId": "a1b2c3d4-...",
  "method": "POST", "path": "/api/v1/sales",
  "userId": "usr_123", "statusCode": 200, "durationMs": 340
}
```

## Diseño: exclusión explícita de credenciales del log (NFR3.13, cierra el hallazgo de logging)

El `LoggingInterceptor` nunca serializa el `body` completo de la petición (evita loguear `password`/`pin` por accidente) — solo los campos explícitamente listados arriba. Cualquier log de error de validación (`ValidationPipe`) usa el nombre del campo que falló, nunca su valor, cuando el campo pertenece a la lista de campos sensibles (`passwordHash`, `pin`, `token`).

## Diseño: log dedicado del job de cierre mensual (NFR6.8)

El job de cierre (`reliability-design.md` NFR6.3) emite su propio log estructurado al iniciar y al terminar cada ejecución: `{ event: "monthly-close", startedAt, periodsClosedCount, periodsCreatedCount, durationMs }` — es el único proceso sin una petición HTTP asociada, así que sin este log dedicado no habría forma de confirmar que corrió ni de detectar si dejó de correr (relevante para verificar que NFR6.3 realmente se auto-recupera en producción).

## Diseño: sin SLI/SLO formales, sin plataforma externa (NFR6.9)

No se definen SLI/SLO ni se integra una plataforma de monitoreo de terceros en el MVP — el log estructurado de stdout (capturado por el hosting gratuito elegido) es la única fuente de observabilidad. Se documenta explícitamente como decisión de alcance (no como un hueco): si el volumen de uso crece más allá del rango esperado (NFR6 de inception), definir SLI/SLO e incorporar una plataforma de monitoreo (ej. Sentry) es trabajo futuro explícito.

## Resumen

| ID | Diseño |
|---|---|
| NFR6.6 | `LoggingInterceptor` global emite JSON estructurado a stdout, sin plataforma externa |
| NFR6.7 | Campos mínimos por request (método, ruta, userId, statusCode, duración, correlationId); `Error.code` en errores |
| NFR6.8 | El job de cierre mensual emite su propio log de inicio/fin con conteo de períodos afectados |
| NFR6.9 | Sin SLI/SLO formales ni plataforma externa en el MVP — decisión de alcance documentada |
