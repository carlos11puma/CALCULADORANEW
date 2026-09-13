# NFR Design — Despliegue a Producción — Reliability Design

## Sources

- [upstream:reliability-requirements] `construction/nfr-requirements/reliability-requirements.md`
- [upstream:reliability-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/reliability-design.md` (cron de cierre mensual, health check, ausencia de circuit breaker — ya diseñados, no se rediseñan aquí)
- [upstream:nfr-design-questions] `nfr-design-questions.md` (Q1)

## Diseño: secuencia obligatoria del primer despliegue (deriva de NFR-D10.4)

1. Actualizar dependencias vulnerables (`backend-api`, `mobile-app`) y regenerar el cliente Prisma real (ya cerrado como prerequisito de este intent).
2. Confirmar `dependency-audit.yml` en verde y la suite de 336 pruebas en verde.
3. Desplegar a `backend-api-production` (con aprobación del required reviewer = Carlos).
4. Ejecutar el smoke test (login + venta de prueba con caso fijo, ver abajo).
5. Ejecutar la verificación de logs y TLS (`security-design.md`).
6. Solo si 4 y 5 pasan, el despliegue se da por exitoso.

Un smoke test ejecutado sin haber completado 1-2 inmediatamente antes no cuenta como evaluación válida, aunque técnicamente "pase" (NFR-D10.4).

## Diseño: caso de prueba fijo para el smoke test (deriva de NFR-D10.1)

Antes de ejecutar el despliegue a producción, Carlos documenta por escrito (en la guía de ejecución del smoke test que este intent produce en Infrastructure Design/Deployment Pipeline) un caso de prueba concreto: un vendedor real ya cargado en el roster (FR3), su ruta/canal, un monto de venta específico, y el monto de comisión esperado calculado de antemano a mano. El smoke test compara el monto que la API realmente devuelve contra ese valor esperado — coincidencia exacta es la única condición de éxito, no "un número razonable".

## Diseño: rollback manual — pasos concretos (deriva de NFR-D11)

- **Backend**: en el dashboard de Render, servicio `backend-api-production` → pestaña Deploys → seleccionar el deploy anterior exitoso → botón "Redeploy" (sin cambios de código, solo re-despliega el build previo).
- **Móvil**: si el fallo está en la app (no en el backend), `eas update:republish` apuntando al update anterior del canal `production` — revierte la actualización OTA sin generar un build nativo nuevo.
- Ninguno de los dos pasos es automático — Carlos los ejecuta manualmente tras confirmar que el smoke test falló, y recibe la notificación nativa de la plataforma correspondiente (ver `observability-design.md`).
- Las migraciones de Prisma de este primer despliegue son exclusivamente aditivas (nueva columna/tabla, nunca `DROP`/rename destructivo) — así, un rollback de código nunca deja el servicio corriendo contra un esquema con el que ya no es compatible.

## Diseño: riesgo aceptado del cron de cierre mensual bajo cold start (deriva de Q1)

El job de cierre mensual (`260908` NFR6.3) ya se auto-recupera de un reinicio revisando diariamente si quedó un período vencido sin cerrar — este intent no cambia ese diseño. Carlos decidió (Q1) aceptar el riesgo residual tal cual: si el servicio "duerme" varios días seguidos alrededor de un fin de mes sin que ningún vendedor lo use, el cierre se retrasa hasta que la siguiente petición real despierte el servicio y dispare la siguiente ejecución diaria del cron — un retraso de días en *cuándo* se refleja el cierre, nunca en el *monto* calculado (el recálculo es determinístico sobre los datos ya registrados). No se agrega ningún mecanismo de keep-alive para mitigar esto, consistente con la decisión ya tomada en `performance-requirements.md` NFR-D2.2 de no gastar el free tier en mantener el servicio despierto artificialmente.

## Diseño: "disponible" para este despliegue (deriva de NFR-D12)

Sin mecanismo de disponibilidad adicional — el health check estándar de `@nestjs/terminus` (`GET /health`, ya diseñado en `260908`) es lo único que Render consulta para reiniciar el proceso si deja de responder; no se agrega monitoreo externo. "Disponible" significa que el servicio responde durante la jornada de ventas, con el cold start ya aceptado como excepción conocida.

## Resumen

| ID | Diseño |
|---|---|
| NFR-D10.1-D10.4 | Secuencia de despliegue en 6 pasos; caso de prueba fijo documentado por Carlos antes del deploy |
| NFR-D11.1-D11.4 | Redeploy de Render / `eas update:republish`, manual; migraciones exclusivamente aditivas |
| NFR-D12.1-D12.2 | Health check estándar ya existente; sin monitoreo externo adicional |
| — (Q1) | Riesgo del cron de cierre mensual bajo cold start extendido: aceptado tal cual, sin keep-alive |
