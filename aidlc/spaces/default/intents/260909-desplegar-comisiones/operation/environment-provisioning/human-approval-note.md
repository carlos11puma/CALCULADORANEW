# Nota de aprobación humana directa — Environment Provisioning

**Fecha:** 2026-09-09
**Aprobado por:** Carlos Puma (vía respuesta directa a pregunta estructurada en esta sesión)

## Qué se aprobó

Dos hallazgos reales de esta etapa:

1. **Sin JWT**: `security-design.md` e `infrastructure-specification.md` asumían un secreto JWT que
   el código real de `260908` nunca implementó (el backend usa sesiones opacas respaldadas en
   Postgres). Carlos confirmó que `render.yaml` y los GitHub Environments solo provisionan
   `DATABASE_URL` como secreto real — sin agregar un `JWT_SECRET` ficticio.
2. **Prerequisitos bloqueados desde esta sesión**: los dos prerequisitos de `team.md` §1 (cliente
   Prisma real, dependencias vulnerables) no se pueden cerrar desde este chat — `npx prisma generate`
   real fue probado y falla por la misma restricción de red de este sandbox que ya bloqueó el hook
   de auditoría (sin salida hacia `binaries.prisma.sh`). Carlos confirmó documentar los comandos
   exactos y el criterio de éxito para ejecutarlos él mismo, en vez de intentar un workaround.

## Qué se ejecutó de verdad (no solo diseño)

- `packages/backend-api/render.yaml`: dividido de un servicio a dos (`backend-api-staging`,
  `backend-api-production`), cada uno con `DATABASE_URL` como único secreto — sin `JWT_SECRET`.
- `.github/workflows/mobile-app-ci.yml`: agregado `environment: staging` al job `publish-preview`.

Ambos cambios ya estaban diseñados y aprobados en Infrastructure Design (`cicd-pipeline.md`,
`infrastructure-specification.md`); esta etapa los aplicó por primera vez al código real, ajustando
`render.yaml` para no incluir el secreto JWT inexistente (hallazgo nuevo de esta etapa).

Ninguna cuenta real (Neon, Render, Expo/EAS) se creó desde esta sesión — eso lo ejecuta Carlos
siguiendo `environment-inventory.md`, fuera de este chat.

## Por qué existe esta nota (mismo motivo que en las etapas anteriores)

El gate formal de revisión automatizada de esta herramienta sigue sin poder completarse en esta
sesión (el hook de auditoría no dispara en este entorno de Cowork/Claude Agent SDK en la nube — ver
`construction/infrastructure-design/human-approval-note.md` para el detalle técnico completo). Esta
misma etapa además confirmó, de forma independiente, que la restricción de red de este sandbox no es
exclusiva del hook de auditoría — también bloquea el acceso real a `binaries.prisma.sh` que
`team.md` §1 requiere como prerequisito. Carlos, informado de ambas limitaciones, decidió continuar
con aprobación directa en el chat.

## Estado real en la herramienta

`aidlc-state.md` sigue mostrando `environment-provisioning` como pendiente del veredicto
automatizado y del gate de aprobación formal, igual que las etapas anteriores. El contenido y los
cambios de código reales ya están hechos y aprobados por Carlos; el aprovisionamiento real de
cuentas queda como trabajo pendiente de Carlos fuera de esta sesión (`environment-inventory.md`,
`validation-report.md`). El "sello" mecánico de la herramienta se puede cerrar más adelante desde
una sesión de Claude Code CLI real sin rehacer nada (ver la nota de Infrastructure Design para los
comandos exactos).
