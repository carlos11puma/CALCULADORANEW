# Nota de aprobación humana directa — CI Pipeline

**Fecha:** 2026-09-09
**Aprobado por:** Carlos Puma (vía respuesta directa a pregunta estructurada en esta sesión)

## Qué se aprobó

`ci-config.md` y `quality-gates.md`, tras presentarle a Carlos el hallazgo real de esta etapa:
el piso de cobertura de pruebas (80% líneas/statements/funciones, 70% branches, ya decidido en
`team.md` § Testing Posture) estaba declarado en `vitest.config.ts` de `backend-api` y
`api-contract`, pero **no se aplicaba en CI** porque sus pasos de test no pasaban el flag
`--coverage` — a diferencia de `mobile-app-ci.yml`, que sí lo hacía correctamente. Carlos aprobó
cerrar esa brecha.

## Qué se ejecutó de verdad (no solo diseño)

A diferencia de Infrastructure Design (que dejó las ediciones de archivos reales para esta
etapa), aquí sí se aplicó el cambio real:

- `.github/workflows/backend-api-ci.yml`: se agregó `-- --coverage` al paso de test.
- `.github/workflows/api-contract-ci.yml`: se agregó `-- --coverage` al paso de test.

Ambos cambios son de una línea, no tocan código de aplicación, y usan exactamente el mismo patrón
que ya funcionaba en `mobile-app-ci.yml`.

## Por qué existe esta nota (mismo motivo que en Infrastructure Design)

El gate formal de revisión automatizada de esta herramienta sigue sin poder completarse en esta
sesión (el hook de auditoría no dispara en este entorno de Cowork/Claude Agent SDK en la nube —
ver la nota equivalente en `construction/infrastructure-design/human-approval-note.md` para el
detalle técnico completo). Carlos, informado de esta limitación, decidió continuar con aprobación
directa en el chat en lugar de instalar Claude Code CLI en su computadora.

## Estado real en la herramienta

`aidlc-state.md` sigue mostrando `ci-pipeline` como pendiente del veredicto automatizado y del
gate de aprobación formal, igual que `infrastructure-design`. El contenido y los cambios reales
en los workflows ya están hechos y aprobados por Carlos; solo falta el "sello" mecánico de la
herramienta, que se puede cerrar más adelante desde una sesión de Claude Code CLI real sin
rehacer nada (ver la nota de Infrastructure Design para los comandos exactos).
