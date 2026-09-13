# NFR Design — Preguntas (260909-desplegar-comisiones)

## Sources

- [upstream:nfr-requirements] `construction/nfr-requirements/*.md`
- [upstream:functional-spec-260908] `260908-calculadora-comisiones-m/construction/backend-api/functional-design/functional-spec.md` (contexto de solo lectura — este intent no rediseña funcionalidad)
- [upstream:nfr-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/` (patrones de arquitectura ya diseñados y afirmados — este intent los opera, no los rediseña)

## Preguntas planteadas a Carlos Puma

Casi todas las decisiones de diseño de este batch ya vienen resueltas por `nfr-requirements` de este intent y por el diseño de arquitectura ya afirmado en `260908` (caché, pooling, guards de autenticación, rate limiting, cron de cierre mensual, etc. — este intent no los rediseña, solo los despliega). Hay un solo punto genuinamente sin resolver: cómo interactúa el cold start del free tier de Render con el job de cierre mensual de comisiones.

### Q1 — El cron de cierre mensual de comisiones (`260908`, NFR6.3) ya está diseñado para auto-recuperarse de un reinicio revisando diariamente si quedó un período vencido sin cerrar. Pero el free tier de Render "duerme" el servicio tras inactividad — si ningún vendedor usa la app durante varios días seguidos alrededor del fin de mes (ej. feriados), el cron tampoco corre hasta que algo despierte el servicio, lo que podría retrasar el cierre del período más allá de un día. ¿Cómo quieres manejar este riesgo?

A. Aceptar el riesgo tal cual — el catch-up diario ya diseñado en `260908` corrige el cierre en cuanto el servicio recibe la próxima petición real, y un retraso de pocos días en el cierre del período no afecta el monto final de comisión calculado, solo cuándo se ve reflejado
B. Carlos verifica manualmente, como paso operativo (no técnico) después de cada fin de mes, que los períodos de comisión de todos los vendedores efectivamente cerraron en Neon `main` — una revisión rápida, sin cambio de diseño
C. Ambas — aceptar el riesgo técnico (A) y además hacer la verificación manual de Carlos (B) como red de seguridad adicional
X. Other (please specify)

**[Answer]: A. Aceptar el riesgo tal cual** — el catch-up diario ya diseñado en `260908` corrige el cierre en cuanto el servicio recibe la próxima petición real; un retraso de pocos días en el cierre del período no afecta el monto final de comisión calculado, solo cuándo se ve reflejado.

## Assumptions & Open Questions

- [assumption] El diseño de arquitectura de aplicación (caché, pooling, guards de autenticación, rate limiting, particionamiento, circuit breakers, logging estructurado) ya afirmado en `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/` y `.../mobile-app/nfr-design/` no se reabre ni se rediseña en este intent — este batch documenta cómo esos patrones ya construidos operan sobre la infraestructura real, no decisiones de arquitectura nuevas.
- [assumption] La verificación de logs sin datos sensibles (`security-requirements.md` NFR-D7.4) y la verificación de TLS/HTTPS (NFR-D15.3) ya tienen un método concreto definido en NFR Requirements — este stage documenta el diseño de *dónde* se originan esas señales (Render/EAS por defecto), no un mecanismo nuevo de scrubbing automatizado.
- [assumption] Ningún componente lógico nuevo se agrega — el inventario de `logical-components.md` de este intent mapea los componentes de aplicación ya existentes (`backend-api` como proceso único, `mobile-app`) a los recursos físicos de despliegue (Render, Neon, EAS), sirviendo de puente hacia Infrastructure Design, sin introducir microservicios ni una topología nueva.

A. Accept assumptions
B. Convert to follow-up questions

**[Answer]: A. Accept assumptions**

## Consolidated Summary Confirmation

- Ningún patrón de arquitectura de aplicación se rediseña — se hereda todo lo ya afirmado en `260908` (caché, pooling, auth, rate limiting, cron, logging).
- Rendimiento: endpoint pooled de Neon explícito en `DATABASE_URL`; secuencia manual del smoke test (2 min, login + venta de prueba); sin warm-up.
- Seguridad: dos Environments de GitHub con secretos propios; rol de Postgres dedicado en Neon; HTTPS/`sslmode=require` por defecto, verificados visualmente; scrubbing de logs vía búsqueda de texto en dos paneles; gate de CI bloqueante combinado con required reviewer; protección de fuerza bruta diferida (sin cambio).
- Escalabilidad: instancia única de Render, sin balanceador, techos del free tier documentados.
- Confiabilidad: secuencia de despliegue en 6 pasos; caso de prueba fijo documentado por Carlos; rollback manual (Redeploy/`eas update:republish`); migraciones exclusivamente aditivas; riesgo del cron de cierre mensual bajo cold start aceptado tal cual (Q1).
- Observabilidad: notificación "Deploy failed" de Render activada; notificación nativa de GitHub Actions confirmada; sin consolidación ni plataforma nueva.
- Componentes lógicos: cuatro pares de recursos físicos (Render, Neon, EAS, GitHub Environments) mapeados a lo ya existente, sin componente nuevo — puente directo hacia Infrastructure Design.

Does this all look correct before I generate the design artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
