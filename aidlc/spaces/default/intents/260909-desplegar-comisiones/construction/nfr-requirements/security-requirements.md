# NFR Requirements — Despliegue a Producción — Security Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR3, FR4.4)
- [upstream:team-practices] `inception/practices-discovery/team-practices.md` § Deployment, puntos 3 y 5
- [upstream:project-rules] `aidlc/spaces/default/memory/project.md` § Forbidden / Mandated
- [upstream:nfr-requirements-questions] `nfr-requirements-questions.md` (Q4)
- [upstream:feasibility-260908] `260908-calculadora-comisiones-m/ideation/feasibility/feasibility-assessment.md` (registro de riesgos, mitigación "HTTPS obligatorio")
- [contributions] `contributions/aidlc-devsecops-agent.md`, `contributions/aidlc-compliance-agent.md`

Estos requisitos operacionalizan, para el despliegue real, las decisiones de seguridad ya afirmadas en `requirements.md` y `team-practices.md`. No se introduce ningún patrón de seguridad nuevo — se traduce lo ya decidido en verificaciones concretas y verificables durante el despliegue. Esta revisión incorpora, además, la decisión final de Carlos sobre protección contra fuerza bruta (Q4) y los hallazgos válidos de devsecops y compliance sobre cifrado en tránsito y el gate de dependencias vulnerables.

## NFR-D4 — Separación de secretos por ambiente (deriva de NFR2)

- **NFR-D4.1**: Ningún secreto de producción (`DATABASE_URL` de Neon `main`, `EXPO_TOKEN` de producción, credenciales de despliegue de `backend-api-production`) vive como GitHub repository secret — todos viven exclusivamente en el GitHub Environment `production`.
- **NFR-D4.2**: El GitHub Environment `staging` tiene su propio conjunto de secretos, sin overlap con `production` — en particular, nunca el mismo `EXPO_TOKEN` cubre ambos ambientes (si EAS no soporta tokens scoped por canal, se documenta un token por Environment con rotación manual, per `team-practices.md` § 3).
- **NFR-D4.3**: Las variables de entorno de Render (`DATABASE_URL`, JWT secret) se configuran directamente en el dashboard de Render con `sync: false` en `render.yaml`, nunca comiteadas ni transmitidas por GitHub Actions — consistente con `infrastructure-specification.md`/`cicd-pipeline.md` de `260908`.

## NFR-D5 — Aprobación manual y titularidad de secretos de producción (deriva de NFR1, NFR2)

- **NFR-D5.1**: Solo Carlos Puma, como titular de las cuentas, genera y carga los secretos de `production` directamente en la interfaz de GitHub — nunca por chat, código, o un canal no auditado.
- **NFR-D5.2**: El GitHub Environment `production` queda protegido por un "required reviewer" = Carlos; ningún despliegue a `backend-api-production` corre sin su aprobación explícita en GitHub (ya diseñado en `cicd-pipeline.md` de `260908`, confirmado aquí como requisito de este despliegue).

## NFR-D6 — RBAC a nivel de infraestructura (deriva de NFR3)

- **NFR-D6.1**: La rama Neon `main` usa un rol de Postgres con permisos mínimos para el backend en runtime — nunca el rol superusuario/owner del proyecto Neon.
- **NFR-D6.2**: El acceso a la consola de Neon (lectura SQL directa de montos de comisión/salario) queda limitado al titular de la cuenta (Carlos) — sin invitar colaboradores adicionales en este primer despliegue (per NFR1 de `requirements.md`).
- **NFR-D6.3**: Las variables de entorno del servicio `backend-api-production` en Render (incluye `DATABASE_URL` real y el JWT secret) quedan visibles solo a quien tenga acceso Member/Admin al servicio de Render — scopeado al mismo titular.
- **NFR-D6.4**: El RBAC de aplicación (roles JWT en NestJS, ya construido en `260908`) sigue vigente sin cambios y no sustituye el control de acceso a nivel de infraestructura de NFR-D6.1-NFR-D6.3 — ambas capas son complementarias, no una alternativa a la otra.

## NFR-D7 — Scrubbing de logs (deriva de FR4.4)

- **NFR-D7.1**: Como parte del mismo smoke test de FR4.2, se verifica explícitamente que ningún log de aplicación generado durante el smoke test (panel de logs de Render para `backend-api-production`, crash/telemetry de EAS para el build de producción) exponga en texto plano: montos de comisión/salario por vendedor, o credenciales (`JWT`, `DATABASE_URL`).
- **NFR-D7.2**: Esta verificación es una condición de éxito del primer despliegue, no una revisión opcional posterior — el primer despliegue no se da por exitoso si NFR-D7.1 no se ejecutó y confirmó, per FR4.4.
- **NFR-D7.3**: El mecanismo de verificación es una revisión manual del panel de logs (no hay herramienta automatizada de scrubbing de logs en este alcance) — consistente con la ausencia de plataforma de monitoreo de pago afirmada en `monitoring-design.md` de `260908`.
- **NFR-D7.4** *(hallazgo quality-agent)*: El método concreto de revisión es: exportar/abrir el panel de logs de Render para `backend-api-production` y la telemetría/crash log de EAS del build de producción correspondientes a la ventana de tiempo del smoke test, y buscar (grep o búsqueda de texto del panel) coincidencias con los patrones `Bearer `, `JWT`, `DATABASE_URL`, `postgres://`, y valores numéricos con formato de moneda junto a un nombre de vendedor. Ningún resultado de esa búsqueda en texto plano es la condición de aprobación de NFR-D7.1. Ver `reliability-requirements.md` NFR-D10.3 para cómo este método se integra en la secuencia del smoke test.

## NFR-D15 — Cifrado en tránsito (TLS/HTTPS obligatorio) *(hallazgo devsecops-agent y compliance-agent)*

Render y Neon imponen HTTPS/TLS por defecto, pero eso no estaba declarado como requisito verificable — `feasibility-assessment.md` de `260908` cita explícitamente "HTTPS obligatorio" como mitigación mandatoria del riesgo de filtración de datos de comisión/salario. Este NFR cierra ese vacío de operacionalización.

- **NFR-D15.1**: Toda comunicación `mobile-app` ↔ `backend-api-production` (Render) viaja exclusivamente sobre HTTPS — la URL pública del servicio Render usada por la app y por EAS es `https://...`, nunca `http://`.
- **NFR-D15.2**: La cadena de conexión (`DATABASE_URL`) de Neon `main` usada por `backend-api-production` incluye `sslmode=require` (o el equivalente que Neon exija por defecto en su connection string) — la conexión `backend-api-production` ↔ Neon `main` nunca se establece en texto plano.
- **NFR-D15.3**: Verificación: como parte del mismo smoke test de FR4.2 (ver `reliability-requirements.md` NFR-D10), se confirma visualmente que (a) la URL base configurada en la app de producción y usada durante la venta de prueba comienza con `https://`, y (b) el valor de `DATABASE_URL` cargado en el Environment `production` de GitHub / dashboard de Render contiene `sslmode=require`. Esta verificación es tan obligatoria como las de NFR-D7 — su ausencia invalida el smoke test.
- **NFR-D15.4**: No se requiere ninguna configuración nueva para cumplir esto — Render y Neon lo proveen por defecto; este NFR solo lo convierte en un requisito explícito y verificable en lugar de un supuesto implícito.

## NFR-D16 — Protección contra fuerza bruta en login: diferida a un ciclo posterior

Carlos pidió esta protección en la entrevista (Q4), pero la revisión de
arquitectura identificó una contradicción real: implementarla requiere
cambiar código del backend (`backend-api`), y este intent (`260909`,
alcance `infra`) tiene declarado en `requirements.md` § Fuera de alcance
que "no modifica código de producto, solo lo despliega" — coherente con
`team-practices.md` § Walking Skeleton, que confirma que `260909` "no
genera Bolts nuevos ni código de aplicación". Este intent tampoco tiene
etapa propia de Code Generation ni Build-and-Test donde esa lógica se
pueda implementar y probar de forma trazable.

Presentada esta contradicción a Carlos, decidió dejarlo para una próxima
ronda: **NFR-D16 queda fuera de alcance de `260909`** y se registra aquí
como mejora pendiente para un futuro intent de Construction sobre
`backend-api` — el primer despliegue a producción avanza sin esta
protección. El RBAC de aplicación (JWT + roles, ver NFR-D6.4) y el RBAC de
infraestructura (NFR-D6) ya construidos y afirmados siguen siendo el
control vigente sobre el acceso a los datos de comisión/salario.

## NFR-D17 — Gate de CI bloqueante para dependencias vulnerables *(hallazgo devsecops-agent)*

- **NFR-D17.1**: El Mandated de `project.md` ("resolver... las dependencias con vulnerabilidades críticas/altas... antes de cualquier aprovisionamiento o despliegue real") se traduce aquí en un gate de pipeline verificable, no solo en una tarea previa narrada: el workflow de `dependency-audit.yml` (o el chequeo equivalente de `npm audit`/similar en GitHub Actions) debe estar en verde (sin vulnerabilidades críticas/altas abiertas) como condición **bloqueante** para que cualquier workflow de despliegue a `production` pueda ejecutarse — no basta con haberlas resuelto una vez de forma manual antes de este intent.
- **NFR-D17.2**: Este gate no es un paso opcional ni informativo — un `dependency-audit.yml` en rojo bloquea el merge a `main` y/o el despliegue a `backend-api-production`, de la misma forma que ya bloquea el build y la suite de pruebas (heredado del diseño de `cicd-pipeline.md` de `260908`, ahora declarado explícitamente como requisito de este despliegue).
- **NFR-D17.3**: Este gate es la misma verificación que condiciona la validez del smoke test post-deploy — ver `reliability-requirements.md` NFR-D10.4 para el gate de re-verificación de T-10 inmediatamente antes del despliegue a producción.

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR-D4.1 | Secretos de producción nunca como repository secret | NFR2, team-practices.md §3 |
| NFR-D4.2 | Sin overlap de secretos entre staging/production | NFR2, team-practices.md §3 |
| NFR-D4.3 | Variables de Render con `sync: false`, nunca en GitHub Actions | NFR2 |
| NFR-D5.1 | Solo Carlos carga secretos de producción | NFR1, NFR2 |
| NFR-D5.2 | Required reviewer = Carlos en Environment production | NFR1, team-practices.md §3 |
| NFR-D6.1 | Rol Postgres mínimo en Neon main, nunca superusuario | NFR3, team-practices.md §5 |
| NFR-D6.2 | Consola de Neon limitada a Carlos | NFR1, NFR3 |
| NFR-D6.3 | Variables de Render production limitadas a Carlos | NFR3, team-practices.md §5 |
| NFR-D6.4 | RBAC de infraestructura complementa, no sustituye, RBAC de aplicación | NFR3 |
| NFR-D7.1 | Verificación de logs sin datos sensibles ni credenciales en texto plano | FR4.4, team-practices.md §5 |
| NFR-D7.2 | Verificación de logs es condición de éxito del despliegue | FR4.4 |
| NFR-D7.3 | Verificación manual, sin herramienta automatizada | FR4.4 |
| NFR-D7.4 | Método concreto: grep/búsqueda de `JWT`/`DATABASE_URL`/montos en logs de Render+EAS | FR4.4 [hallazgo quality-agent] |
| NFR-D15.1 | Toda comunicación mobile-app↔backend-api-production sobre HTTPS | feasibility-assessment.md (260908) [hallazgo devsecops/compliance] |
| NFR-D15.2 | `DATABASE_URL` de Neon main con `sslmode=require` | feasibility-assessment.md (260908) [hallazgo devsecops/compliance] |
| NFR-D15.3 | Verificación de HTTPS/sslmode integrada al smoke test | FR4.2 [hallazgo devsecops/compliance] |
| NFR-D16 | Protección contra fuerza bruta en login — diferida, fuera de alcance de 260909 | [Q4, revertido tras revisión de arquitectura] |
| NFR-D17.1 | Gate de CI bloqueante: `dependency-audit.yml` en verde antes de desplegar a production | project.md Mandated [hallazgo devsecops-agent] |
| NFR-D17.2 | Gate bloqueante, no informativo | cicd-pipeline.md (260908) [hallazgo devsecops-agent] |

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-09T11:12:00Z
**Iteration:** 1
**Request Challenge:** review:299e01d77267330a19f1736e40b97b13

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | — | `security-requirements.md` § NFR-D16 | Resuelto. La iteración anterior de esta revisión (ver Historial abajo) encontró una contradicción Critical: NFR-D16 exigía bloqueo de fuerza bruta desde este primer despliegue, lo que requiere código nuevo de `backend-api` y contradice el alcance ya afirmado en `requirements.md` § Fuera de alcance y `team-practices.md` § Walking Skeleton. Presentado a Carlos, quien decidió diferir la protección a una ronda futura de Construction. `security-requirements.md` § NFR-D16 quedó reescrito como nota de alcance diferido, y la referencia correspondiente en `tech-stack-decisions.md` y `traceability.json` (NFR3, Q4) se actualizó para reflejar la misma decisión — ya no hay ninguna referencia residual que describa la protección como vigente en este despliegue. | Verificado, ninguna acción pendiente. | Resolved |
| R-02 | — | `performance-requirements.md` NFR-D1.2 | Resuelto. La ambigüedad entre el timeout de 2 minutos del smoke test y la revisión de logs/TLS se aclaró con el nuevo `NFR-D1.2.1`: el reloj de 2 minutos cubre exclusivamente login + venta de prueba; la revisión de logs (NFR-D7) y la verificación de HTTPS/TLS (NFR-D15) son posteriores a ese reloj y nunca disparan un rollback por sí mismas. | Verificado, ninguna acción pendiente. | Resolved |

### Summary

Ambos hallazgos de la iteración anterior están resueltos con ediciones directas y coherentes entre `security-requirements.md`, `performance-requirements.md`, `tech-stack-decisions.md` y `traceability.json` — no queda ninguna referencia residual que contradiga el alcance ya afirmado en `requirements.md`/`team-practices.md`, ni ambigüedad sobre qué cubre el timeout de 2 minutos del smoke test. El batch de NFR es internamente consistente, trazable, y no introduce ninguna funcionalidad de aplicación fuera del alcance `infra` de este intent. Veredicto: READY.

### Historial — iteración 1 (revisión original, antes de las correcciones)

Veredicto original (previo a estas correcciones): NOT-READY, registrado por aidlc-architecture-reviewer-agent el 2026-09-09T04:02:41Z.

| ID | Severity | Location | Finding | Required action |
|---|---|---|---|---|
| R-01 | Critical | `security-requirements.md` § NFR-D16 (NFR-D16.1-NFR-D16.4), vs. `inception/requirements-analysis/requirements.md` § Fuera de alcance y `inception/practices-discovery/team-practices.md` § Walking Skeleton | NFR-D16.1 exige que `POST /api/v1/auth/login` de `backend-api-production` implemente **desde este primer despliegue** un bloqueo temporal tras intentos fallidos repetidos, y NFR-D16.3 confirma que el mecanismo ("rate limiting en memoria del proceso NestJS" o "una tabla de intentos fallidos en Neon") requiere cambiar código de la aplicación backend, no solo configuración de infraestructura. Esto contradice directamente dos afirmaciones explícitas y ya aprobadas de este mismo intent: (1) `requirements.md` § Fuera de alcance dice literalmente "Cualquier funcionalidad nueva de la app (ya cerrado en Construction, `260908`) — este intent no modifica código de producto, solo lo despliega"; y (2) `team-practices.md` § Walking Skeleton confirma que `260909` "no es una etapa de Construction: no genera Bolts nuevos ni código de aplicación". | Resolver la contradicción de alcance antes de tratar esto como listo. |
| R-02 | Minor | `performance-requirements.md` NFR-D1.2 vs. `security-requirements.md` NFR-D7.2/NFR-D15.3 y `reliability-requirements.md` NFR-D10.3 | El timeout de 2 minutos del smoke test (NFR-D1.2) se define explícitamente solo para "ambos pasos" (login + venta de prueba), pero NFR-D7.2 y NFR-D15.3 describen la revisión manual de logs y la verificación de HTTPS/`sslmode=require` como parte del "mismo smoke test", sin aclarar si esas verificaciones corren dentro de ese mismo reloj o después. | Aclarar la secuencia del smoke test. |

Ambos hallazgos fueron presentados a Carlos vía pregunta estructurada; su decisión ("Dejarlo para una próxima ronda") resolvió R-01, y la aclaración de NFR-D1.2.1 resolvió R-02 — ver la iteración vigente arriba.
