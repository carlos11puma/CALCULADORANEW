# Observability Setup — Por qué esta etapa se reporta como omitida

## Sources

- [upstream:monitoring-design] `construction/infrastructure-design/monitoring-design.md`
- [upstream:reliability-design] `construction/nfr-design/reliability-design.md`
- [upstream:deployment-execution] `operation/deployment-execution/` (sin despliegue real todavía)
- [stage-rule] `.claude/aidlc-common/stages/operation/observability-setup.md` § Step 1: "If no deployed target exists, this CONDITIONAL stage reports skipped."

## Por qué no se genera contenido nuevo en esta etapa

Esta etapa depende explícitamente de que exista un despliegue real (`requires_stage:
deployment-execution`), y su propia regla dice que si no hay un target desplegado, se reporta como
omitida — no se inventa una configuración de observabilidad sobre infraestructura que no existe.
`operation/deployment-execution/` sigue siendo un paquete listo para ejecutar, no un despliegue
real (`environment-provisioning/validation-report.md` en 0/12).

Además, no hay trabajo de diseño pendiente que esta etapa necesitara hacer: `monitoring-design.md`
(Infrastructure Design, ya aprobado por Carlos en esta misma sesión) ya resolvió completamente el
alcance de observabilidad de este intent — sin dashboards nuevos, sin SLIs/SLOs formales, sin
tracing distribuido, solo las alertas nativas de Render (email por "deploy failed") y de GitHub
Actions (email por check fallido), justificado por el volumen real del proyecto (~26 vendedores, app
interna, free tier).

## Qué se agregó, en el lugar correcto

La única acción de observabilidad de este intent que no estaba todavía activada como paso concreto
era el checkbox "Notify on failed deploys" de Render — se agregó como Paso 2.6 de
`operation/environment-provisioning/environment-inventory.md`, junto al resto del aprovisionamiento
real que Carlos ejecuta, en vez de crear una etapa separada de observabilidad para una sola casilla.

## Cuándo revisitar esta etapa

Cuando Carlos complete el despliegue real (`deployment-execution` con resultados reales, no la
plantilla), esta etapa puede volver a evaluarse — aunque, dado que `monitoring-design.md` ya cubre
el alcance completo decidido para este intent, es probable que siga sin requerir contenido nuevo,
salvo que Carlos decida en ese momento que quiere algo más que las alertas nativas ya diseñadas.
