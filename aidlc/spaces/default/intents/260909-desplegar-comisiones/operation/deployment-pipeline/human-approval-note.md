# Nota de aprobación humana directa — Deployment Pipeline

**Fecha:** 2026-09-09
**Aprobado por:** Carlos Puma (vía respuesta directa a pregunta estructurada en esta sesión)

## Qué se aprobó

`cd-config.md`, `deployment-strategy.md` y `rollback-runbook.md`, tras presentarle a Carlos el único
hallazgo nuevo de esta etapa: `packages/mobile-app/eas.json` declara `API_BASE_URL` con dominios
placeholder (`...internal`) heredados de Construction (`260908`), de cuando no existía backend
desplegado. Esas URLs deben reemplazarse por las URLs reales que Render asigna a
`backend-api-staging`/`backend-api-production` — documentado como acción concreta de la siguiente
etapa (Environment Provisioning), no ejecutado aquí porque las URLs todavía no existen. El resto del
contenido formaliza decisiones ya tomadas en etapas previas (sin blue/green ni canary, sin feature
flags, matriz de promoción de dos pasos, runbook de rollback ya diseñado en
`nfr-design/reliability-design.md`) sin reabrir ninguna.

## Qué se ejecutó de verdad (no solo diseño)

Ningún cambio de código o configuración real en esta etapa — a diferencia de CI Pipeline. Esta etapa
es puramente de formalización/documentación; las dos ediciones de archivo pendientes (`render.yaml`,
`environment: staging` en `mobile-app-ci.yml`) y la actualización de `eas.json` quedan explícitamente
para Environment Provisioning, la siguiente etapa.

## Por qué existe esta nota (mismo motivo que en Infrastructure Design y CI Pipeline)

El gate formal de revisión automatizada de esta herramienta sigue sin poder completarse en esta
sesión (el hook de auditoría no dispara en este entorno de Cowork/Claude Agent SDK en la nube — ver
la nota equivalente en `construction/infrastructure-design/human-approval-note.md` para el detalle
técnico completo). Carlos, informado de esta limitación, decidió continuar con aprobación directa en
el chat en lugar de instalar Claude Code CLI en su computadora.

## Estado real en la herramienta

`aidlc-state.md` sigue mostrando `deployment-pipeline` como pendiente del veredicto automatizado y
del gate de aprobación formal, igual que `infrastructure-design` y `ci-pipeline`. El contenido ya está
hecho y aprobado por Carlos; solo falta el "sello" mecánico de la herramienta, que se puede cerrar más
adelante desde una sesión de Claude Code CLI real sin rehacer nada (ver la nota de Infrastructure
Design para los comandos exactos).
