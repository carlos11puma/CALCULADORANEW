# NFR Design — Despliegue a Producción — Performance Design

## Sources

- [upstream:performance-requirements] `construction/nfr-requirements/performance-requirements.md`
- [upstream:performance-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/performance-design.md` (diseño de aplicación ya afirmado — no se rediseña aquí)
- [upstream:infrastructure-specification-260908] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/infrastructure-specification.md`

Este documento no diseña ningún patrón de rendimiento de aplicación nuevo — `260908` ya diseñó el pool de conexiones singleton, la ausencia deliberada de caché (Q3 de `260908`), y el recálculo en una sola transacción Prisma. Lo que sí es nuevo aquí es el diseño de **cómo esos patrones se conectan a la infraestructura real** y **cómo se verifica el presupuesto de latencia (NFR-D1) en el smoke test del primer despliegue**.

## Diseño: cadena de conexión pooled real (deriva de NFR-D1.1, NFR-D2)

El `DATABASE_URL` cargado en el Environment `production` de GitHub (y como variable de entorno directa en Render, con `sync: false`) debe ser el endpoint **pooled** de Neon (el que expone pgBouncer integrado en modo `transaction`), no el endpoint directo — Carlos debe copiar específicamente la cadena "Pooled connection" del dashboard de Neon al crear la rama `main`, no la "Direct connection" que Neon también ofrece. Usar por error la conexión directa no rompe el despliegue, pero reintroduce el riesgo de agotamiento de conexiones que el pool de `PrismaModule` (ya diseñado en `260908`) fue pensado para evitar.

## Diseño: secuencia de medición del smoke test (deriva de NFR-D1.2, NFR-D1.2.1)

El cronómetro de 2 minutos de NFR-D1.2 se opera así en el despliegue real: (1) Carlos abre la app apuntando a `backend-api-production`, (2) inicia el cronómetro al hacer login, (3) ejecuta la venta de prueba con el caso de datos fijo (ver `reliability-design.md` NFR-D10), (4) detiene el cronómetro al recibir la comisión calculada. Si ambos pasos completan dentro de 2 minutos, el criterio de tiempo pasa — la revisión de logs/TLS (NFR-D1.2.1) ocurre después, con el cronómetro ya detenido, y su resultado no puede convertir un smoke test ya exitoso en fallido por demora, solo por hallazgo positivo (ver `security-design.md`).

## Diseño: aceptación del cold start (deriva de NFR-D2.1, NFR-D2.2)

Ningún mecanismo de warm-up se agrega al pipeline de despliegue (consistente con la decisión ya tomada en NFR Requirements) — el cronómetro de NFR-D1.2 arranca con el servicio en el estado real en que esté (despierto o recién despertando), no se ejecuta un ping de calentamiento antes del smoke test para "hacer trampa" al presupuesto de tiempo. Esto es intencional: el smoke test debe reflejar la experiencia real del primer vendedor que use la app ese día.

## Resumen

| ID | Diseño |
|---|---|
| NFR-D1.1 | Endpoint pooled de Neon (pgBouncer, modo transaction) copiado explícitamente al `DATABASE_URL` de producción |
| NFR-D1.2 | Secuencia de medición manual: login → venta de prueba con caso fijo → detener cronómetro |
| NFR-D1.2.1 | Revisión de logs/TLS ocurre después de detener el cronómetro, sin afectar el criterio de tiempo |
| NFR-D2.1 / NFR-D2.2 | Sin mecanismo de warm-up en el pipeline — el smoke test mide el estado real del servicio |
| NFR-D3.1 / NFR-D3.2 | Sin cambio de diseño — ver `reliability-design.md` para el criterio operativo de "disponible" |
