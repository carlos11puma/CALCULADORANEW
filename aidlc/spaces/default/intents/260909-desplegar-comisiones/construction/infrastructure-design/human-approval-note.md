# Nota de aprobación humana directa — Infrastructure Design

**Fecha:** 2026-09-09
**Aprobado por:** Carlos Puma (vía respuesta directa a pregunta estructurada en esta sesión)

## Qué se aprobó

Los cuatro artefactos de esta etapa (`infrastructure-specification.md`, `monitoring-design.md`,
`cicd-pipeline.md`, `traceability.json`), tras presentarle a Carlos un resumen del contenido real
de cada uno (no solo el resumen consolidado de preguntas, que ya había confirmado antes por
separado). Carlos respondió "Apruebo" explícitamente a la pregunta: "¿Apruebas este contenido de
Infrastructure Design tal como se resume arriba? [...] esta es tu aprobación directa reemplazando
el paso del revisor automatizado [...]".

## Por qué existe esta nota

El gate formal de revisión de esta herramienta (`aidlc-log.ts review` → `aidlc-orchestrate.ts
report --result awaiting-approval` → `--result approved`) requiere que un hook automático
(`aidlc-write-audit-log.ts`, PostToolUse) registre un evento `ARTIFACT_CREATED`/`ARTIFACT_UPDATED`
cada vez que se escribe un artefacto de la etapa. En esta sesión (entorno Cowork/Claude Agent SDK
en la nube) ese hook no se dispara automáticamente — se confirmó con una prueba limpia (escribir
un archivo de prueba y verificar que no apareció ningún evento nuevo ni se actualizó el heartbeat
de salud del hook). Sin esos eventos, `aidlc-log.ts review` rechaza sistemáticamente la solicitud
de revisión con "this stage's output document was not saved after the confirmed answers", y por lo
tanto tampoco puede completarse el veredicto del revisor ni abrirse el gate de aprobación —
confirmado también intentando `report --result awaiting-approval` directamente, que fue rechazado
por la ausencia de revisión.

No existe un mecanismo legítimo en esta herramienta para saltarse esto: la única variable de
entorno relacionada (`AIDLC_SKIP_REVIEWER_GATE_GUARD`) está documentada en el código como
"Test-only bypass for synthetic gate-transition fixtures" y explícitamente "Completion paths never
honor this variable" — no es una ruta real de finalización, así que no se usó.

## Estado real en la herramienta

`aidlc-state.md` de este intent **sigue mostrando `infrastructure-design` como pendiente** del
veredicto del revisor y del gate de aprobación formal — esta nota no lo cambia, y deliberadamente
no se editó `aidlc-state.md` a mano para forzar ese cambio (violaría la misma disciplina de "nunca
fabricar" que motivó todo este proceso de recuperación).

## Qué falta para cerrar esto formalmente

En una sesión de Claude Code CLI real (donde el hook de auditoría sí se dispara automáticamente,
por ejemplo en tu máquina local con `bun` instalado), sin necesidad de rehacer ningún contenido:

1. Confirmar el resumen consolidado una vez más si el sistema lo pide (`aidlc-log.ts answer
   --checkpoint summary-confirmation ...` con los mismos archivos ya escritos aquí).
2. `bun .claude/tools/aidlc-log.ts review --stage infrastructure-design --unit "deployment"
   --reviewer aidlc-architecture-reviewer-agent --iteration 1` para abrir la revisión — debería
   pasar sin problema porque los 4 artefactos y el `## Review` de `cicd-pipeline.md` ya existen.
3. Completar el veredicto (`--verdict READY`) y `aidlc-orchestrate.ts report --result
   awaiting-approval` → `--result approved`.

El contenido sustantivo de los 4 documentos no necesita cambios — esta nota es puramente sobre el
mecanismo de registro de la herramienta, no sobre el diseño en sí, que Carlos ya revisó y aprobó
dos veces (resumen consolidado y contenido real).
