# Environment Provisioning — Reporte de Validación

## Sources

- [contexto] `environment-inventory.md` (esta etapa)
- [upstream:infrastructure-specification] `construction/infrastructure-design/infrastructure-specification.md`

## Estado en el momento de escribir esta etapa

Ningún paso de `environment-inventory.md` se ejecutó todavía — esta sesión no tiene acceso a cuentas
de terceros ni a la computadora de Carlos. Este documento es el checklist que Carlos completa a
medida que avanza; no se marca nada como hecho por adelantado.

## Checklist de validación

| # | Verificación | Cómo confirmarlo | Estado |
|---|---|---|---|
| 1 | Cliente Prisma real generado y buildeado sin error | `npx prisma generate && npm run build` en `packages/backend-api` sale limpio | Pendiente |
| 2 | Sin vulnerabilidades críticas/altas conocidas | `npm audit` no reporta crítica/alta | Pendiente |
| 3 | Suite de pruebas en verde tras el fix de dependencias | 336+ pruebas pasan, cobertura ≥80%/70% en los 3 workspaces | Pendiente |
| 4 | Neon: dos ramas (`staging`, `main`) existen | Dashboard de Neon | Pendiente |
| 5 | Render: `backend-api-staging` y `backend-api-production` existen, cada uno con su `DATABASE_URL` propio cargado | Dashboard de Render → cada servicio → Environment | Pendiente |
| 6 | Render: auto-deploy ON en staging, OFF en producción | Settings → Build & Deploy de cada servicio | Pendiente |
| 7 | `eas.json` con URLs reales de Render (no placeholders `...internal`) | Diff del archivo | Pendiente |
| 8 | GitHub Environment `staging` creado, sin required reviewer, con `EXPO_TOKEN` propio | Settings → Environments | Pendiente |
| 9 | GitHub Environment `production` creado, required reviewer = Carlos, con `EXPO_TOKEN` propio y **distinto** al de staging | Settings → Environments | Pendiente |
| 10 | Branch protection de `main` exige los 4 checks (`backend-api-ci` test, `api-contract-ci` test, `mobile-app-ci` test, `dependency-audit` audit) | Settings → Branches | Pendiente |
| 11 | Rol de Postgres de producción no es superusuario/owner | Consola de Neon → Roles | Pendiente |
| 12 | Acceso a Neon console y a Render `backend-api-production` limitado a la cuenta de Carlos | Members de cada plataforma | Pendiente |

## Qué NO valida este reporte

Este reporte no incluye el smoke test funcional (login + venta de prueba con cálculo de comisión) —
eso es la validación de la etapa Deployment Execution, no de Environment Provisioning; aprovisionar
correctamente la infraestructura es condición necesaria pero no suficiente para un despliegue
exitoso (`project.md` § Mandated).

## Cómo continuar

Cuando Carlos complete los 12 puntos (puede volver a esta sesión o abrir una nueva y pedir que se
actualice este checklist con el estado real), la siguiente etapa (Deployment Execution) ejecuta el
primer despliegue real siguiendo `reliability-design.md` y el runbook de rollback si algo falla.
