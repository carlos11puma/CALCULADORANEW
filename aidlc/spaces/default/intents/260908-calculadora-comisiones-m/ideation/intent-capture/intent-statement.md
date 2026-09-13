# Intent Statement

## Problem Statement

La calculadora de comisiones actual es una aplicación web de un solo archivo HTML (React sin build, sin backend) que corre localmente en el navegador de un único dispositivo. No soporta múltiples usuarios, no tiene respaldo centralizado de datos y no puede usarse de forma confiable en campo. [Q1] [Q4]

## Target Customer

- **Carlos Puma**, supervisor de ventas (TIOSA S.A. / Grupo Bimbo Ecuador), quien administra el roster de vendedores por ruta y canal (preventa/autoventa), los presupuestos y los tramos de comisión variable, protegido por PIN de administrador. [Q2] [Q5]
- **Vendedores/preventistas** de sus rutas, quienes hoy no tienen visibilidad directa de su comisión calculada. [Q2] [Q5]

## Success Metrics

- Métrica principal: uso en campo — el supervisor y su equipo pueden calcular/consultar comisiones desde el celular en la ruta, sin depender de una laptop. [Q3]

## Initiative Trigger

Limitación técnica de la app actual: al no tener backend ni multiusuario, no escala más allá de un único dispositivo/navegador y no puede centralizar el respaldo de datos. [Q4]

## Initial Scope Signal

- **Workflow-selected scope**: `mvp` [scope] (23 de 33 etapas, sin fase formal de operaciones).
- **Alcance de producto confirmado por el usuario**: coincide con `mvp` — construir el núcleo funcional (cálculo de comisiones, roster, autenticación) sin ceremonia de despliegue/operación formal. [Q8]

## Assumptions & Open Questions

1. [assumption] Oscar Ramos (gerente divisional) no es stakeholder activo de este proyecto específico.
2. [assumption] No existe requerimiento de reporte/comunicación formal para este proyecto.
3. [assumption] Los vendedores/preventistas accederán a la app solo para **consultar** su comisión calculada; la edición de roster/presupuestos/tramos sigue siendo función exclusiva del supervisor vía PIN de admin.

(Ver `intent-capture-questions.md` § Assumption Confirmation y § Consolidated Summary Confirmation — aceptadas y confirmadas por el usuario.)

## Review

**Reviewer:** aidlc-product-lead-agent
**Iteration:** 1

Revisión adversarial (advisory) de `intent-statement.md` y `stakeholder-map.md` contra `intent-capture-questions.md`.

Fortalezas:
- Cada afirmación sustantiva trae su tag de fuente `[Q<n>]` o `[assumption]`; no encontré una claim sin respaldo en el registro de fuentes.
- El problema de negocio (deuda técnica de la app de un solo archivo) y el disparador coinciden y no se contradicen.

Hallazgos (no bloquean esta etapa, pero deben resolverse antes de Requirements/Feasibility):
1. "Uso en campo" como métrica de éxito no es todavía medible/testeable (Core Review Question #2) — no hay un umbral (p. ej. "X% de rutas usando la app semanalmente" o "cálculo disponible sin señal en Y segundos"). La etapa de requisitos debe convertir esto en un criterio verificable.
2. El rol de Oscar Ramos queda como `Unknown (open question) [assumption]` en el mapa de stakeholders — válido para intent-capture, pero si en algún momento aprueba presupuesto o rutas, su ausencia como decisor podría generar retrabajo. Recomiendo confirmarlo antes de Inception si el alcance crece más allá de MVP.
3. El supuesto "vendedores solo consultan, no editan" fue aceptado como parte del resumen consolidado, no respondido con una pregunta [Q<n>] dedicada — queda correctamente etiquetado como `[assumption]`, pero es una decisión de producto con impacto directo en el modelo de permisos/backend; debe re-confirmarse explícitamente en la etapa de requisitos (define el alcance de roles/autenticación de NestJS).

**Verdict:** READY

El marco de intención es coherente, trazable y suficiente para avanzar. Los tres hallazgos anteriores no son vacíos de este artefacto sino que fijan la agenda de la siguiente etapa (feasibility / requisitos): convertir la métrica en medible y blindar el modelo de permisos consulta-vs-edición.

