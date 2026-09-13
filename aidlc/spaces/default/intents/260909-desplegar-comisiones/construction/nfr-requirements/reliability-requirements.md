# NFR Requirements — Despliegue a Producción — Reliability Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` (FR3, FR4.2, FR4.3, FR4.4)
- [upstream:team-practices] `inception/practices-discovery/team-practices.md` § Deployment, punto 4
- [upstream:cicd-pipeline-260908] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/cicd-pipeline.md`
- [upstream:test-results-260908] `260908-calculadora-comisiones-m/.../test-results.md` (T-10, Not Met — aceptado como riesgo conocido a resolver antes de despliegue real)
- [contributions] `contributions/aidlc-quality-agent.md`

## NFR-D10 — Criterio de éxito del primer despliegue (deriva de FR4.2)

- **NFR-D10.1**: El primer despliegue a producción se considera exitoso únicamente si, tras el deploy, se confirman contra infraestructura real: (1) el login funciona, y (2) una venta de prueba calcula la comisión correctamente contra Neon `main`. Ambas condiciones son obligatorias — ninguna por sí sola basta. **Caso de prueba concreto (hallazgo quality-agent, cierra la falta de verificabilidad)**:
  - *Login*: se considera exitoso si la petición contra `backend-api-production` devuelve HTTP 200/201 con un token JWT válido para una cuenta de vendedor real cargada en el panel de administración (per FR3.3) — no basta con la "ausencia de error visible" en la app.
  - *Venta de prueba*: Carlos define, como parte de la ejecución del propio smoke test, un caso de prueba fijo y documentado antes de ejecutar el deploy: un vendedor específico, una ruta/canal específico y un monto de venta específico, todos ya sembrados en Neon `main` vía el panel de administración per FR3 (roster de vendedores, presupuestos y tramos de comisión). El smoke test se considera exitoso solo si el monto de comisión que la API devuelve para esa venta de prueba coincide exactamente con el monto esperado que Carlos calculó de antemano para ese mismo caso (tramo/presupuesto aplicable). Este dato de prueba (vendedor, ruta, monto de venta, comisión esperada) debe quedar anotado en la guía de ejecución del smoke test para que el criterio pasa/falla sea reproducible por cualquiera que lo repita, no solo por quien lo ejecutó la primera vez.
- **NFR-D10.2**: El "éxito" del despliegue nunca se define solo por el exit code de Render/EAS — un deploy con exit code 0 que no pase el smoke test funcional de NFR-D10.1 se trata como despliegue fallido a todos los efectos (rollback + notificación, ver NFR-D11).
- **NFR-D10.3**: El smoke test de NFR-D10.1 incluye, como parte del mismo procedimiento (no como paso separado opcional), la verificación de logs sin datos sensibles ni credenciales de `security-requirements.md` NFR-D7. **Método concreto (hallazgo quality-agent, cierra la falta de procedimiento)**: revisar el panel de logs de Render de `backend-api-production` y la telemetría/crash log de EAS del build de producción correspondientes a la ventana de tiempo del smoke test, buscando (grep o búsqueda de texto) coincidencias con los patrones `Bearer `, `JWT`, `DATABASE_URL`, `postgres://` y montos/valores numéricos con formato de moneda junto a un nombre de vendedor — ver `security-requirements.md` NFR-D7.4 para el detalle. Un despliegue no se da por exitoso si esa verificación no se ejecutó con este método.
- **NFR-D10.4** *(hallazgo quality-agent — gate de re-verificación de T-10)*: El smoke test de NFR-D10.1 solo es válido como evaluación del despliegue si, inmediatamente antes de ejecutar el despliegue a producción, T-10 (vulnerabilidades de dependencias, `test-results.md` de `260908`) fue re-verificado como **Met**: dependencias actualizadas (`backend-api` y `mobile-app`) y la suite completa de pruebas en verde tras ese fix, no la decisión de aceptación de riesgo registrada en `260908` (que fue tomada *antes* del fix). Este gate se ejecuta como parte de la secuencia de despliegue, en este orden: (1) actualizar dependencias vulnerables → (2) suite de pruebas en verde + `dependency-audit.yml` en verde (ver `security-requirements.md` NFR-D17) → (3) desplegar → (4) ejecutar el smoke test de NFR-D10.1-NFR-D10.3. Un smoke test ejecutado sin haber completado (1)-(2) inmediatamente antes no cuenta como una evaluación válida del despliegue, aunque técnicamente "pase".

## NFR-D11 — Rollback manual y notificación (deriva de FR4.3)

- **NFR-D11.1**: Si cualquiera de las dos condiciones del smoke test falla, se ejecuta una reversión manual: "Redeploy" del build anterior en el dashboard de Render (para `backend-api-production`) y/o `eas update:republish` (para el canal `production` de EAS, si el fallo es de la app móvil).
- **NFR-D11.2**: No hay rollback automático en este primer despliegue — es una decisión y ejecución manual de Carlos, consistente con `team-practices.md` § 4 ("No hay rollback automático para este primer despliegue").
- **NFR-D11.3**: Carlos debe ser notificado de cualquier fallo del smoke test que dispare un rollback — decisión final de Carlos en Q2 de `nfr-requirements-questions.md`: notificaciones nativas separadas (correo de Render por deploy fallido, correo de GitHub Actions por build/test fallido), sin correo consolidado propio. Ver `observability-requirements.md` NFR-D13 para el mecanismo concreto.
- **NFR-D11.4**: El rollback de código no revierte por sí solo una migración de base de datos aplicada por el despliegue revertido (hallazgo R-02 ya documentado en `cicd-pipeline.md` de `260908`, heredado sin cambios) — las migraciones de Prisma para este primer despliegue deben ser aditivas/retrocompatibles, de forma que un rollback de código nunca deje el servicio corriendo contra un esquema incompatible.

## NFR-D12 — Qué significa "disponible" para este despliegue pequeño

- **NFR-D12.1**: "Disponible" no significa 24/7 sin interrupciones — dado el free tier (cold start de Render, ver `performance-requirements.md` NFR-D2) y la ausencia de un SLA formal (NFR5, sin fecha límite fija, prima la corrección sobre la velocidad). Significa: el servicio responde correctamente cuando un vendedor lo usa durante su jornada de ventas, con el entendimiento de que la primera petición tras inactividad puede tardar más.
- **NFR-D12.2**: No se define una ventana de mantenimiento formal ni un proceso de comunicación de downtime a los vendedores en este primer despliegue — el volumen de usuarios (~26, un solo desarrollador/administrador) no justifica ese nivel de proceso todavía; si un vendedor reporta que la app no responde, Carlos es el único punto de contacto y de diagnóstico (consistente con NFR1: solo Carlos tiene acceso a la infraestructura real).

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR-D10.1 | Login + venta de prueba, ambos obligatorios, contra infra real, con caso de prueba fijo y comisión esperada | FR4.2 [hallazgo quality-agent] |
| NFR-D10.2 | Exit code de Render/EAS no basta como criterio de éxito | FR4.2, project.md Forbidden |
| NFR-D10.3 | Verificación de logs incluida en el mismo smoke test, con método grep/búsqueda concreto | FR4.4 [hallazgo quality-agent] |
| NFR-D10.4 | Gate: T-10 re-verificado como Met (dependencias + suite verde) antes del smoke test | test-results.md (260908) [hallazgo quality-agent] |
| NFR-D11.1 | Rollback manual vía Redeploy/eas update:republish | FR4.3, team-practices.md §4 |
| NFR-D11.2 | Sin rollback automático | FR4.3, project.md Forbidden |
| NFR-D11.3 | Notificación a Carlos: nativas separadas de Render + GitHub Actions | FR4.3, FR5.1 [Q2] |
| NFR-D11.4 | Migraciones aditivas/retrocompatibles (rollback de código no revierte esquema) | cicd-pipeline.md R-02 (260908) |
| NFR-D12.1 | "Disponible" = responde durante jornada de ventas, cold start aceptado | NFR5, performance-requirements.md |
| NFR-D12.2 | Sin ventana de mantenimiento formal para este volumen | NFR1 |
