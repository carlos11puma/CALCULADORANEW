# NFR Design — Despliegue a Producción — Security Design

## Sources

- [upstream:security-requirements] `construction/nfr-requirements/security-requirements.md`
- [upstream:security-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/security-design.md` (autenticación, autorización, rate limiting de login ya diseñados — no se rediseñan aquí)
- [upstream:team-practices] `inception/practices-discovery/team-practices.md`

## Diseño: separación física de secretos por Environment (deriva de NFR-D4)

Dos GitHub Environments (`staging`, `production`), cada uno con su propio conjunto de secretos configurado en GitHub (Settings → Environments), nunca como repository secret:

| Secreto | Environment `staging` | Environment `production` |
|---|---|---|
| `DATABASE_URL` | Rama Neon `staging` (endpoint pooled) | Rama Neon `main` (endpoint pooled) |
| JWT secret | Valor propio de staging | Valor propio de producción, distinto al de staging |
| `EXPO_TOKEN` | Token scoped a `preview` si EAS lo permite; si no, token dedicado con rotación manual documentada | Token scoped a `production` si EAS lo permite; si no, token dedicado con rotación manual documentada |

En Render, las mismas variables se configuran directamente en el dashboard de cada servicio (`backend-api-staging`, `backend-api-production`) con `sync: false` en `render.yaml`, nunca inyectadas desde GitHub Actions.

## Diseño: RBAC de infraestructura — pasos concretos de aprovisionamiento (deriva de NFR-D6)

- **Neon**: al crear la rama `main`, Carlos crea un rol de Postgres dedicado para el runtime del backend (no el rol owner/superusuario del proyecto) con permisos `SELECT`/`INSERT`/`UPDATE`/`DELETE` solo sobre las tablas de la aplicación — este es el rol que va en el `DATABASE_URL` de producción. El acceso a la consola SQL de Neon queda limitado a la cuenta de Carlos (no se invita a nadie más).
- **Render**: el acceso Member/Admin al servicio `backend-api-production` (que permite ver `DATABASE_URL` y el JWT secret en las variables de entorno) queda limitado a la cuenta de Carlos — no se invita a colaboradores adicionales en este primer despliegue.
- El RBAC de aplicación (JWT + `RolesGuard`, ya construido en `260908`) sigue operando sin cambios sobre estas mismas credenciales de infraestructura — ambas capas son complementarias.

## Diseño: cifrado en tránsito — puntos de verificación concretos (deriva de NFR-D15)

- La URL pública de `backend-api-production` en Render es HTTPS por defecto (Render no expone HTTP en el free tier para servicios web) — no requiere configuración adicional, solo confirmar que la URL usada en `mobile-app` (variable de entorno de build de EAS) comienza con `https://`.
- El `DATABASE_URL` copiado del dashboard de Neon incluye `sslmode=require` por defecto en el string que Neon genera — el diseño aquí es simplemente: nunca editar manualmente ese string para quitar el parámetro `sslmode`.
- Verificación en el smoke test: Carlos confirma visualmente, antes de dar el despliegue por exitoso, que (a) la URL configurada en el build de producción de la app empieza con `https://`, y (b) el valor de `DATABASE_URL` en el Environment `production` contiene `sslmode=require`.

## Diseño: verificación de logs sin datos sensibles — mecánica concreta (deriva de NFR-D7)

Carlos ejecuta la búsqueda de texto de NFR-D7.4 (`Bearer `, `JWT`, `DATABASE_URL`, `postgres://`, montos junto a nombre de vendedor) directamente en dos lugares, sin herramienta adicional:
1. El panel de logs de Render para `backend-api-production` (Logs tab del servicio), filtrado a la ventana de tiempo del smoke test.
2. El panel de EAS (`expo.dev`) para el build de producción, sección de crash/telemetry.

Ningún resultado positivo de esa búsqueda es la condición de aprobación — un resultado positivo (un secreto o monto expuesto) invalida el smoke test aunque login y venta de prueba hayan funcionado, y dispara el mismo rollback manual de `reliability-design.md`.

## Diseño: gate de CI bloqueante para dependencias vulnerables (deriva de NFR-D17)

El workflow `dependency-audit.yml` (ya existente de `260908`) se configura como **required status check** en la regla de protección de rama de `main` y, adicionalmente, el Environment `production` de GitHub queda con el required reviewer = Carlos como ya está diseñado — la combinación de ambos (status check bloqueante + reviewer humano) es lo que impide que un despliegue a producción avance con vulnerabilidades críticas/altas sin resolver, sin necesidad de un paso de verificación manual separado.

## Diseño: protección contra fuerza bruta en login — diferida (deriva de NFR-D16)

Sin cambio de diseño en este intent: el `LoginThrottlerGuard` (ya diseñado en `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/security-design.md`, 5 intentos/min con backoff exponencial) **no existe todavía en el código desplegado** — Carlos decidió diferir esta protección a una ronda futura de Construction sobre `backend-api` (ver `security-requirements.md` NFR-D16). Este primer despliegue avanza sin ella; el RBAC de infraestructura y de aplicación ya diseñados siguen siendo el control vigente.

## Resumen

| ID | Diseño |
|---|---|
| NFR-D4.1 / NFR-D4.2 / NFR-D4.3 | Dos GitHub Environments con secretos propios; variables de Render con `sync: false` |
| NFR-D5.1 / NFR-D5.2 | Solo Carlos carga secretos de producción; required reviewer = Carlos ya diseñado en `260908` |
| NFR-D6.1 | Rol de Postgres dedicado (no superusuario) creado explícitamente al aprovisionar Neon `main` |
| NFR-D6.2 / NFR-D6.3 | Consola de Neon y variables de Render limitadas a la cuenta de Carlos |
| NFR-D6.4 | RBAC de aplicación (JWT + roles) opera sin cambios, complementario al de infraestructura |
| NFR-D7.1-D7.4 | Búsqueda de texto en panel de logs de Render + EAS, en la ventana del smoke test, sin herramienta adicional |
| NFR-D15.1-D15.4 | HTTPS por defecto de Render; `sslmode=require` por defecto del string de Neon; verificación visual en el smoke test |
| NFR-D16 | Diferido — sin cambio de diseño, el guard de `260908` no se despliega todavía |
| NFR-D17.1-D17.3 | `dependency-audit.yml` como required status check + required reviewer, combinados |

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-09T11:20:00Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | `packages/backend-api/render.yaml` vs. `logical-components.md` y `team.md` §2 | El Blueprint de Render que ya existe en el repo (`260908`) declara un único servicio (`calculadora-comisiones-backend-api`), pero el diseño de este intent asume dos servicios separados (`backend-api-staging`, `backend-api-production`) con secretos y ramas de Neon distintos — el archivo tal como está hoy no materializa esa separación (hallazgo del aws-platform-agent, `contributions/aidlc-aws-platform-agent.md`). No es una contradicción del diseño de NFR (los nombres y la separación ya están correctamente decididos en `team.md` y aquí), solo un desfase entre el IaC existente y el diseño. | Resolver en Infrastructure Design (la siguiente etapa): actualizar `render.yaml` con dos definiciones de servicio, o documentar la creación manual del segundo servicio desde el dashboard de Render sin depender del Blueprint. No bloquea este diseño de NFR. | New |
| R-02 | Minor | `reliability-design.md` § riesgo del cron de cierre mensual (Q1) | El diseño acepta el riesgo de retraso del cierre mensual sin mitigación técnica, consistente con la decisión de Carlos — pero no queda explícito quién revisa que el cron efectivamente corrió, más allá de que el log dedicado (`260908` NFR6.8) exista. Si nadie consulta ese log nunca, un retraso real pasaría desapercibido indefinidamente, no solo unos días. | No bloquea (Carlos decidió explícitamente no agregar verificación activa) — documentar como nota de continuidad: si Carlos alguna vez sospecha un cierre retrasado, el primer lugar a revisar es ese log dedicado en el panel de Render. | New |

### Validation Tool Results

| Tool | Result | Interpretación |
|---|---|---|
| Verificación cruzada manual de los 7 artefactos + `nfr-requirements` | PASS | Cada `NFR-Dx.y` de `nfr-requirements` tiene un diseño concreto correspondiente en `traceability.json`; ningún documento reabre la arquitectura de aplicación ya afirmada en `260908`; NFR-D16 se mantiene diferido de forma consistente en `security-design.md`, `tech-stack-decisions.md` (nfr-requirements) y `traceability.json` de esta etapa |
| Verificación de disciplina de alcance | PASS | Ningún artefacto introduce código de aplicación nuevo ni reabre una decisión de arquitectura ya cerrada en `260908` — consistente con `requirements.md` § Fuera de alcance y `team-practices.md` § Walking Skeleton |

### Summary

El diseño de rendimiento, seguridad, escalabilidad, confiabilidad, observabilidad y el inventario de componentes lógicos para el despliegue son completos, trazables a `nfr-requirements`, y no reabren ninguna decisión de arquitectura ya afirmada en `260908`. Los dos hallazgos (R-01, R-02) son continuidad hacia la siguiente etapa (Infrastructure Design) y una nota operativa respectivamente — ninguno bloquea: Carlos podría aprovisionar la infraestructura a partir de este diseño sin preguntarle al arquitecto.
