# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER commitear secretos (cadena de conexión de Neon, JWT secret de NestJS) — usar variables de entorno. [contributions/aidlc-devsecops-agent] (affirmed 2026-09-08)
- NEVER desplegar a producción (Render `backend-api-production`, Neon (affirmed 2026-09-09)
`main`, EAS canal/perfil `production`) sin haber regenerado y validado el (affirmed 2026-09-09)
cliente Prisma real primero. (affirmed 2026-09-09)
- NEVER compartir secretos entre los Environments `staging` y `production` (affirmed 2026-09-09)
de GitHub Actions — en particular, nunca un mismo `EXPO_TOKEN` cubre (affirmed 2026-09-09)
ambos ambientes. (affirmed 2026-09-09)
- NEVER guardar secretos de producción (connection string de Neon, JWT (affirmed 2026-09-09)
secret, `EXPO_TOKEN`) como repository secret de GitHub — deben vivir (affirmed 2026-09-09)
exclusivamente en el Environment correspondiente. (affirmed 2026-09-09)
- NEVER dar por exitoso el primer despliegue real basándose solo en el exit (affirmed 2026-09-09)
code del deploy de Render/EAS, sin el smoke test funcional (login + venta (affirmed 2026-09-09)
de prueba con cálculo de comisión). (affirmed 2026-09-09)
- NEVER ejecutar un rollback automático del primer despliegue a producción (affirmed 2026-09-09)
sin notificar a Carlos — la reversión y la notificación son manuales. (affirmed 2026-09-09)
- NEVER usar el rol superusuario/owner del proyecto Neon como credencial de (affirmed 2026-09-09)
runtime del backend en producción. (affirmed 2026-09-09)
## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

- ALWAYS proteger los datos de comisión/salario con control de acceso por rol (supervisor vs. vendedor) y credenciales cifradas — heredado de Feasibility (datos sensibles sin marco regulatorio formal). [upstream:feasibility-assessment] (affirmed 2026-09-08)
- ALWAYS priorizar capas gratuitas de infraestructura (Neon free tier, hosting económico, Expo/EAS free tier) dado el presupuesto mínimo/gratuito confirmado en Feasibility. [upstream:constraint-register] (affirmed 2026-09-08)
- ALWAYS resolver el stub manual del cliente Prisma (regenerar (affirmed 2026-09-09)
`npx prisma generate` con conexión de red real a `binaries.prisma.sh`) y (affirmed 2026-09-09)
actualizar las dependencias con vulnerabilidades críticas/altas conocidas, (affirmed 2026-09-09)
como primer paso de este intent, antes de cualquier aprovisionamiento de (affirmed 2026-09-09)
infraestructura o despliegue real. Cierra R-01 (`code-generation-plan.md`) (affirmed 2026-09-09)
y T-10 (`build-and-test-summary.md`) de `260908`. (affirmed 2026-09-09)
- ALWAYS crear las cuentas de Neon, Render y Expo/EAS a nombre de Carlos (affirmed 2026-09-09)
Puma, siguiendo instrucciones paso a paso — nunca a nombre de una cuenta (affirmed 2026-09-09)
compartida o de terceros sin su participación directa. (affirmed 2026-09-09)
- ALWAYS separar los secretos de GitHub Actions por ambiente, usando (affirmed 2026-09-09)
GitHub Environments distintos (`staging` / `production`) con secretos (affirmed 2026-09-09)
propios cada uno. (affirmed 2026-09-09)
- ALWAYS scopear a nivel de Environment `production` (protegido por el (affirmed 2026-09-09)
required reviewer = Carlos) todo secreto de producción: `DATABASE_URL` de (affirmed 2026-09-09)
Neon `main`, `EXPO_TOKEN` de producción y credenciales de despliegue de (affirmed 2026-09-09)
`backend-api-production`. (affirmed 2026-09-09)
- ALWAYS confirmar el primer despliegue a producción solo si el login (affirmed 2026-09-09)
funciona Y una venta de prueba calcula la comisión correctamente contra la (affirmed 2026-09-09)
base de datos real (Neon `main`). (affirmed 2026-09-09)
- ALWAYS limitar el acceso humano a la infraestructura real (consola de (affirmed 2026-09-09)
Neon, variables de entorno de Render, logs de Render/EAS) al titular de (affirmed 2026-09-09)
las cuentas (Carlos) — el RBAC de aplicación (roles NestJS) no sustituye (affirmed 2026-09-09)
este control a nivel de infraestructura. (affirmed 2026-09-09)
## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
