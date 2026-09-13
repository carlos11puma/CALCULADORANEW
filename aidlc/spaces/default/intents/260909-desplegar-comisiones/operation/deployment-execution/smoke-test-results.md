# Deployment Execution — Resultados del Smoke Test (plantilla — sin ejecutar)

## Sources

- [upstream:reliability-design] `construction/nfr-design/reliability-design.md` (caso de prueba fijo, criterio de éxito)
- [upstream:team-practices] `team.md` §4 (DEP-4)
- [Q2] `deployment-execution-questions.md`

**Estado: plantilla, no ejecutado.** El criterio de éxito viene de `project.md` § Mandated: el
despliegue solo se confirma exitoso si el login funciona Y una venta de prueba calcula la comisión
correctamente contra la base de datos real. Coincidencia exacta con el valor esperado — no "un
número razonable" — es la única condición de éxito (`reliability-design.md`).

## Caso de prueba fijo (Carlos completa esto ANTES de ejecutar, no después)

| Campo | Valor |
|---|---|
| Vendedor (ya cargado en el roster real) | _(Carlos completa)_ |
| Ruta / canal | _(Carlos completa)_ |
| Monto de venta de la prueba | _(Carlos completa)_ |
| Comisión esperada (calculada a mano, de antemano, con la regla de negocio real) | _(Carlos completa)_ |
| Fecha en que se calculó a mano el valor esperado | _(Carlos completa)_ |

Un smoke test corrido sin este caso ya documentado por escrito de antemano no cuenta como una
evaluación válida (`reliability-design.md`), aunque técnicamente "pase".

## Staging (`backend-api-staging`)

| Verificación | Cómo se prueba | Resultado | Coincide con lo esperado |
|---|---|---|---|
| Login (supervisor o vendedor) | Login real contra `backend-api-staging` | _(pendiente)_ | _(pendiente)_ |
| Cálculo de comisión del caso fijo | Registrar la venta del caso fijo y leer la comisión calculada por la API | _(pendiente)_ | _(pendiente)_ |
| Coincidencia exacta con el valor esperado | Comparar dígito por dígito | _(pendiente)_ | _(pendiente)_ |

**Veredicto de staging:** _(pendiente — PASA / NO PASA)_

## Producción (`backend-api-production`) — solo se ejecuta si staging pasó

| Verificación | Cómo se prueba | Resultado | Coincide con lo esperado |
|---|---|---|---|
| Login (supervisor o vendedor) | Login real contra `backend-api-production` | _(pendiente)_ | _(pendiente)_ |
| Cálculo de comisión del caso fijo | Registrar la venta del caso fijo y leer la comisión calculada por la API | _(pendiente)_ | _(pendiente)_ |
| Coincidencia exacta con el valor esperado | Comparar dígito por dígito | _(pendiente)_ | _(pendiente)_ |

**Veredicto de producción:** _(pendiente — PASA / NO PASA)_

## Si algún veredicto es "NO PASA"

Ejecutar `operation/deployment-pipeline/rollback-runbook.md` de inmediato — no se continúa la
promoción al siguiente ambiente, y Carlos recibe la notificación nativa de la plataforma
correspondiente (ver `observability-setup`, siguiente etapa).

## Verificación de logs (deriva de `team.md` §5, en paralelo al smoke test funcional)

| Verificación | Resultado |
|---|---|
| Ningún log de Render/EAS muestra montos de comisión/salario en texto plano junto al nombre del vendedor | _(pendiente)_ |
| Ningún log muestra `DATABASE_URL` ni el token de sesión en texto plano | _(pendiente)_ |
