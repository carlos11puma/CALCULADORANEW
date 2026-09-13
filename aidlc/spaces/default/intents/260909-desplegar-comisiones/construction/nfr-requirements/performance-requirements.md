# NFR Requirements — Despliegue a Producción — Performance Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` (NFR4, restricciones de free tier)
- [upstream:infra-design-backend] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/infrastructure-specification.md`
- [upstream:nfr-requirements-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-requirements/performance-requirements.md` (NFR1 ya especificado en `260908`, no se redefine aquí)

Este intent no rediseña el rendimiento de la aplicación (`NFR1.1-NFR1.4` de `260908` ya fijan el presupuesto de latencia de la API) — define únicamente los targets operativos del **despliegue en sí** sobre infraestructura free-tier real, para un volumen de ~26 vendedores en rutas de venta. No son targets de nivel empresarial: son umbrales realistas para un servicio free-tier de un solo usuario administrador y ~26 usuarios operativos concurrentes en el peor caso (nunca simultáneos en la práctica, dado que cada vendedor opera su propia ruta).

## NFR-D1 — Tiempo de respuesta observado en producción

- **NFR-D1.1**: Con el servicio Render "despierto" (ver NFR-D2 sobre cold start), el `POST /api/v1/sales` real contra Neon `main` debe observarse por debajo de 2 segundos de extremo a extremo, consistente con `NFR1.1` de `260908` — esta es la primera confirmación de ese presupuesto contra infraestructura real y no contra mocks/tests.
- **NFR-D1.2**: El reloj de **2 minutos** cubre exclusivamente los dos pasos funcionales del smoke test de FR4.2 — login y venta de prueba, contra infraestructura real — desde su disparo hasta que ambos pasos confirman éxito o falla; decisión final de Carlos en Q1 de `nfr-requirements-questions.md`, con margen razonable para el cold start del free tier de Render (NFR-D2) sin alargar demasiado el pipeline. Si esos dos pasos no completan dentro de los 2 minutos, se trata como fallo y dispara la reversión manual + notificación de `reliability-requirements.md` NFR-D11.
- **NFR-D1.2.1** *(aclaración, hallazgo architecture-reviewer)*: La revisión de logs (`security-requirements.md` NFR-D7) y la verificación de HTTPS/`sslmode=require` (NFR-D15) son verificaciones **posteriores** a ese reloj de 2 minutos, no parte de él — se ejecutan una vez que login + venta de prueba ya completaron dentro del plazo, y su resultado (positivo o negativo) se registra por separado en `reliability-requirements.md` NFR-D10 antes de dar el despliegue por definitivamente exitoso. Un rollback nunca se dispara por demora en la revisión de logs/TLS, solo por el timeout de NFR-D1.2 o por un hallazgo positivo en esa revisión.

## NFR-D2 — Cold start del free tier de Render

- **NFR-D2.1**: El plan free de Render suspende el servicio tras un período de inactividad y lo reactiva en la siguiente petición ("spin down / spin up"), lo cual introduce una latencia de arranque (típicamente en el orden de decenas de segundos) en la primera petición tras inactividad — esto es una característica documentada del free tier, no un defecto del despliegue. `NFR1.1` de `260908` explícitamente excluye el cold start de su presupuesto de 2s ("medido sobre peticiones en caliente").
- **NFR-D2.2**: Este cold start es aceptable para el patrón de uso real (~26 vendedores registrando ventas de forma dispersa a lo largo del día, no en ráfagas simultáneas) y no requiere mitigación adicional (p. ej. un ping periódico para mantener el servicio despierto) en este primer despliegue — mantener el servicio siempre activo entraría en tensión con el uso gratuito del plan free y no está justificado por el volumen. Se documenta explícitamente para que Carlos no lo interprete como una falla si la primera venta del día tarda más de 2 segundos. **Decisión final confirmada (Q3)**: Carlos acepta explícitamente que la primera venta de prueba del día pueda tardar más de 2 segundos por el cold start — es una característica conocida del free tier, sin mitigación, sin acción de seguimiento.

## NFR-D3 — Disponibilidad realista para infraestructura free-tier

- **NFR-D3.1**: No se define un SLA de disponibilidad numérico (p. ej. "99.9%") para este primer despliegue — sería una promesa no sostenible sobre infraestructura gratuita compartida y sin plataforma de monitoreo propia (heredado de `monitoring-design.md` de `260908`: "sin SLI/SLO formales en el MVP"). "Disponible" para este despliegue significa: el servicio responde a peticiones durante el horario en que los ~26 vendedores registran ventas, con la excepción esperada del cold start (NFR-D2) y de mantenimiento no anunciado propio del proveedor gratuito.
- **NFR-D3.2**: Ver `reliability-requirements.md` para el criterio operativo de "disponible" aplicado al primer despliegue (login + venta de prueba exitosos).

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR-D1.1 | `POST /api/v1/sales` <2s en caliente, confirmado contra infraestructura real | NFR1.1 (260908) |
| NFR-D1.2 | Timeout total del smoke test de FR4.2 = 2 minutos | FR4.2 [Q1] |
| NFR-D2.1 | Cold start del free tier de Render es esperado, no un defecto | infrastructure-specification.md (260908) |
| NFR-D2.2 | No se mitiga el cold start en este despliegue (sin ping keep-alive), aceptado explícitamente por Carlos | NFR4 (costo, free tier) [Q3] |
| NFR-D3.1 | Sin SLA numérico de disponibilidad | monitoring-design.md (260908), NFR4 |
| NFR-D3.2 | Ver reliability-requirements.md | FR4.2 |
