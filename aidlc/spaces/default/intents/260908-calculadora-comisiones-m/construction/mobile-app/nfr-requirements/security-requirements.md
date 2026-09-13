# NFR Requirements — mobile-app — Seguridad

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` (NFR3, NFR4)
- [upstream:project-mandated] `aidlc/spaces/default/memory/project.md`
- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md` (Q3/Q5 de Functional Design)
- [Q2] [Q3] `nfr-requirements-questions.md`

- **NFR3.14** — Toda comunicación con `backend-api` usa HTTPS (`https://`), sin excepción, incluso en desarrollo local — hereda NFR3 de `requirements.md` ("HTTPS obligatorio en toda comunicación con el backend").
- **NFR3.15** — La app confía en la validación TLS estándar del sistema operativo (cadena de certificados del SO); no implementa certificate pinning (Q2) — decisión explícita, no una omisión, dado el volumen/riesgo del MVP y el costo operativo de mantener pines al rotar certificados.
- **NFR3.16** — El token de sesión se almacena exclusivamente en `expo-secure-store` (ya decidido en Functional Design, Q5), nunca en `AsyncStorage` ni en texto plano en ningún archivo del dispositivo.
- **NFR3.17** — Ningún log de la app (consola de desarrollo, crash reporting si se agrega en el futuro) incluye el valor del token de sesión, la contraseña/PIN ingresados, ni montos de comisión/salario en texto identificable por vendedor — hereda el mandato de `project.md` ("proteger datos de comisión/salario ... con credenciales cifradas").
- **NFR4.3** — La base de datos local `pending_sales` (`expo-sqlite`, Q1 de Functional Design) no usa cifrado adicional a nivel de aplicación (ej. SQLCipher); se apoya en el cifrado de almacenamiento nativo de iOS/Android, que cifra el sistema de archivos completo del dispositivo por defecto (Q3) — consistente con el presupuesto mínimo del MVP y con que el dato en esa tabla (montos de venta pendientes de un vendedor, sin PII de otros) es de menor sensibilidad relativa que el token de sesión.
- **NFR4.4** — La sincronización de ventas pendientes (`POST /api/v1/sales/sync`, ver `functional-spec.md` § MW8) es idempotente por fecha del lado del servidor (contrato de `backend-api`); el cliente no implementa lógica propia de deduplicación — solo elimina de `pending_sales` los ítems que el servidor confirma como `applied`, evitando reenvíos innecesarios sin asumir responsabilidad de la garantía de no-duplicación, que es del servidor.

## Assumptions & Open Questions

None.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T21:22:46Z
**Iteration:** 2
**Request Challenge:** review:a30e612a0917c8309efaac5717372bab

### Nota de esta iteración (2)

Reapertura administrativa del gate: el único cambio de contenido desde la iteración 1 fue mecánico — completar la columna Status (antes vacía) de la tabla de Findings con el valor de enum válido `New` para R-01 a R-03, requerido por el validador de `aidlc-review-brief.ts`. No hay cambio de sustancia en ningún hallazgo, en el veredicto, ni en el resto del documento. El veredicto READY y los tres hallazgos R-01 a R-03 de la iteración 1 se confirman sin cambios — ver la tabla debajo.

### Historial — iteración 1

Date: 2026-09-08T17:02:35Z (revisión original, contenido sin cambios de sustancia)

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | NFR3.14 | El requisito mandata HTTPS obligatorio pero no especifica un mecanismo técnico de enforcement en el cliente (Android Network Security Config bloqueando cleartext por defecto; iOS App Transport Security, activo por defecto salvo excepción explícita) — sin esto, un bug o una URL mal configurada podría silenciosamente intentar HTTP sin que nada lo bloquee | No bloquea: Code Generation debe configurar explícitamente `usesCleartextTraffic=false` (Android) y confirmar que no se agrega ninguna excepción de ATS (iOS), en vez de depender solo de que el código de la app siempre use `https://` | New |
| R-02 | Minor | NFR4.3 (cifrado local) | El requisito documenta que el cifrado de `pending_sales` se apoya en el cifrado de almacenamiento del SO, pero no menciona el riesgo residual de un dispositivo con jailbreak/root (donde ese cifrado puede estar comprometido) — riesgo aceptado implícitamente, no explícitamente | No bloquea para el MVP (mismo perfil de riesgo aceptado que el resto del proyecto, sin marco regulatorio formal): dejar documentado como riesgo residual conocido, no requiere acción de Code Generation | New |
| R-03 | Minor | NFR4.3, continuidad con `functional-design.md` R-01 | El hallazgo R-01 de la revisión de `functional-design` (tabla `pending_sales` sin `vendorId` en la clave, riesgo si el dispositivo se comparte entre vendedores) tiene una dimensión de seguridad además de la de integridad de datos ya señalada allí — un dato de comisión de un vendedor podría quedar visible/aplicable bajo la sesión de otro | No bloquea (mismo tratamiento que el hallazgo original, no bloqueante): reforzar en Code Generation que la clave de `vendorId` en `pending_sales` (ya requerida por R-01 de Functional Design) también cierra esta lectura de seguridad, sin requerir un requisito nuevo aquí | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `bun .claude/tools/aidlc-sensor-traceability.ts --output-path .../nfr-requirements/traceability.json --stage-slug nfr-requirements` | PASS: `{"pass":true,"gaps":[],"orphans":[],"missing_from_upstream_ids":[],"invalid_entries":[],"invalid_targets":[],"findings_count":0}` | Los 7 grupos NFR de `requirements.md` están cubiertos (NFR1/3/4/5/6 `OK`, NFR2/7 `N/A` justificados por no ser responsabilidad de esta unidad) |
| Verificación cruzada con `nfr-requirements-questions.md` | PASS (manual) | Las 4 decisiones confirmadas (Q1-Q4) están reflejadas exactamente en `performance-requirements.md`, `security-requirements.md` y `tech-stack-decisions.md`, sin desviación |

### Summary

Los requisitos no funcionales de `mobile-app` cubren rendimiento percibido, seguridad de transporte y almacenamiento local, y compatibilidad de plataforma, con decisiones justificadas y consistentes con el presupuesto mínimo del proyecto y con las decisiones ya tomadas en Functional Design (`expo-secure-store`, `expo-sqlite`). Los tres hallazgos son endurecimientos de detalle técnico y de documentación de riesgo residual, ninguno bloquea — verdict READY.
