# NFR Requirements — Despliegue a Producción — Observability Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` (FR5.1, § Fuera de alcance)
- [upstream:monitoring-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/monitoring-design.md`

Breve por diseño. La observabilidad avanzada (dashboards, alertas más allá del correo de falla) y la respuesta formal a incidentes están **explícitamente fuera de alcance** del alcance `infra` aprobado por Carlos (ver `requirements.md` § Fuera de alcance) — se documenta aquí para que quede trazable como una decisión de alcance, no como un olvido. Lo único que sí está dentro de alcance es la notificación por correo de fallas de despliegue (FR5.1) y el logging mínimo ya provisto por Render/EAS por defecto.

## Fuera de alcance (documentado, no silenciado)

- Dashboards propios de métricas de negocio (tasa de error, latencia p95, etc.) — no se construyen en este intent.
- Alertas más allá de la notificación de fallo de FR5.1 (p. ej. alertas de umbral de memoria, alertas de negocio).
- Respuesta formal a incidentes (runbooks, escalamiento, post-mortems) — no aplica al volumen de un solo desarrollador/administrador.
- Pruebas de carga y cualquier instrumentación de rendimiento asociada — ver `scalability-requirements.md`.

Esto es consistente con la decisión ya afirmada en `monitoring-design.md` de `260908`: "sin SLI/SLO formales en el MVP", "sin plataforma de monitoreo de pago". Este intent no reabre esa decisión; la hereda y la aplica al despliegue real.

## NFR-D13 — Notificación de fallas de despliegue (deriva de FR5.1)

- **NFR-D13.1**: Ante cualquier falla del pipeline automático (build, test, o smoke test post-deploy de NFR-D10), Carlos debe recibir un aviso por correo electrónico a la cuenta usada para Neon/Render.
- **NFR-D13.2**: El mecanismo concreto es la notificación nativa de Render por email al completar cada deploy (ya diseñada en `monitoring-design.md` de `260908`) más, para fallas de build/test detectadas en GitHub Actions antes de llegar a Render, la notificación nativa de GitHub Actions por email de workflow fallido a la cuenta de Carlos — no se construye un servicio de notificación propio. [Q2]
- **NFR-D13.3**: Esta es la única señal formal de falla en este despliegue — no hay agregación ni deduplicación de notificaciones; una falla de build, una de test, y una de smoke test generan cada una su propio correo desde su fuente nativa respectiva.

## NFR-D14 — Logging mínimo disponible por defecto

- **NFR-D14.1**: El panel de logs nativo de Render captura `stdout`/`stderr` de `backend-api-staging` y `backend-api-production` por separado, con la retención del tier gratuito (típicamente horas a pocos días) — suficiente para la depuración manual reactiva de este volumen, sin agregador externo. Heredado sin cambios de `monitoring-design.md` de `260908`.
- **NFR-D14.2**: EAS provee logs de build y, para el canal de producción, telemetría/crash reporting básica dentro del free tier — es la única visibilidad de fallas del lado móvil disponible en este despliegue, sin herramienta adicional.
- **NFR-D14.3**: Ambas fuentes de logging (Render, EAS) son las que se revisan manualmente para la verificación de scrubbing de `security-requirements.md` NFR-D7 — no se agrega ninguna fuente de logging nueva para ese propósito.

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| — | Observabilidad avanzada e incident response fuera de alcance (documentado) | requirements.md § Fuera de alcance |
| NFR-D13.1 | Correo a Carlos ante falla de build/test/smoke test | FR5.1 |
| NFR-D13.2 | Mecanismo: notificaciones nativas de Render + GitHub Actions | FR5.1 [Q2] |
| NFR-D13.3 | Sin agregación de notificaciones, una por fuente | FR5.1 |
| NFR-D14.1 | Logs de Render por defecto (staging/producción separados) | monitoring-design.md (260908) |
| NFR-D14.2 | Logs/crash telemetry de EAS por defecto | monitoring-design.md (260908) |
| NFR-D14.3 | Mismas fuentes usadas para verificación de scrubbing | FR4.4 |
