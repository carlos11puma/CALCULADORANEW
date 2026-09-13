# Deployment Execution — Bitácora de Despliegue (plantilla — sin ejecutar)

## Sources

- [upstream:reliability-design] `construction/nfr-design/reliability-design.md` (secuencia de 6 pasos)
- [upstream:cicd-pipeline] `construction/infrastructure-design/cicd-pipeline.md`
- [Q1] `deployment-execution-questions.md`

**Estado de este documento: plantilla, no ejecutado.** Ningún paso de abajo se corrió todavía —
`environment-provisioning/validation-report.md` sigue con sus 12 puntos pendientes. Carlos completa
las columnas "Resultado real" y "Hora" a medida que ejecuta cada paso; no se marca ningún ✅ por
adelantado.

## Precondición — no avanzar sin esto en verde

| Prerequisito | Fuente | Estado |
|---|---|---|
| Cliente Prisma real generado (`npx prisma generate` + `npm run build` sin error) | `environment-inventory.md` Paso 0.1 | Pendiente |
| Sin vulnerabilidades críticas/altas (`npm audit`) | `environment-inventory.md` Paso 0.2 | Pendiente |
| Suite de pruebas en verde tras el fix | `environment-inventory.md` Paso 0.2 | Pendiente |
| Los 12 puntos de aprovisionamiento completos | `environment-provisioning/validation-report.md` | Pendiente (0/12) |

## Secuencia de despliegue (6 pasos, `reliability-design.md`)

| # | Paso | Cómo se ejecuta | Resultado real | Hora |
|---|---|---|---|---|
| 1 | Confirmar `dependency-audit.yml` en verde y la suite de pruebas en verde | Revisar el check de GitHub Actions en el último push a `main` | _(pendiente)_ | _(pendiente)_ |
| 2 | Push a `main` dispara `backend-api-ci.yml` → Render auto-deploy de `backend-api-staging` | Automático tras el push | _(pendiente)_ | _(pendiente)_ |
| 3 | Ejecutar el smoke test contra `backend-api-staging` | Ver `smoke-test-results.md` § Staging | _(pendiente)_ | _(pendiente)_ |
| 4 | Si el smoke test de staging pasa: Carlos presiona "Manual Deploy" en Render para `backend-api-production` | Dashboard de Render → `backend-api-production` → Manual Deploy | _(pendiente)_ | _(pendiente)_ |
| 5 | Ejecutar el smoke test contra `backend-api-production` | Ver `smoke-test-results.md` § Producción | _(pendiente)_ | _(pendiente)_ |
| 6 | Si 5 pasa: despliegue confirmado exitoso (`project.md` § Mandated). Si falla: ejecutar `operation/deployment-pipeline/rollback-runbook.md` | — | _(pendiente)_ | _(pendiente)_ |

## Despliegue de `mobile-app` (en paralelo, independiente del backend)

| # | Paso | Resultado real | Hora |
|---|---|---|---|
| 1 | Push a `main` → `mobile-app-ci.yml` job `test` en verde | _(pendiente)_ | _(pendiente)_ |
| 2 | `publish-preview` (`environment: staging`) publica a canal `preview` | _(pendiente)_ | _(pendiente)_ |
| 3 | Carlos instala/actualiza la build `preview` en su teléfono y confirma que abre y funciona | _(pendiente)_ | _(pendiente)_ |
| 4 | Carlos aprueba el Environment `production` en GitHub | _(pendiente)_ | _(pendiente)_ |
| 5 | `publish-production` publica a canal `production` | _(pendiente)_ | _(pendiente)_ |
| 6 | Carlos instala/actualiza la build `production` y confirma que abre y funciona | _(pendiente)_ | _(pendiente)_ |

## Migraciones de base de datos

Ninguna migración nueva de Prisma se introduce en este intent — el esquema ya fue construido y
migrado contra Neon en `260908`. El primer despliegue real solo aplica las migraciones ya existentes
(vía el flujo estándar de Prisma) a las bases de datos reales `staging`/`main`, sin ningún `DROP` ni
rename destructivo (ya garantizado por diseño en `reliability-design.md`).

## Cómo continuar

Cuando Carlos ejecute cada paso, puede volver a esta sesión (o abrir una nueva) y pedir que se
actualice esta bitácora con los resultados reales, hora por hora, tal como ocurrieron.
