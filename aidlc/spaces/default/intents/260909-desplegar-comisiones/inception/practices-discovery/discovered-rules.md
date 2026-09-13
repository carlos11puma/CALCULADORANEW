# Discovered Rules — 260909-desplegar-comisiones

> Reglas duras nuevas o directamente aplicables al despliegue real,
> declaradas por Carlos en la entrevista de Practices Discovery (Step 4) de
> este intent. Las reglas ya afirmadas en `memory/project.md` (heredadas de
> `260908`) no se repiten salvo que apliquen directamente a la puesta en
> producción.

## Mandated

- ALWAYS resolver el stub manual del cliente Prisma (regenerar
  `npx prisma generate` con conexión de red real a `binaries.prisma.sh`) y
  actualizar las dependencias con vulnerabilidades críticas/altas conocidas,
  como primer paso de este intent, antes de cualquier aprovisionamiento de
  infraestructura o despliegue real. Cierra R-01 (`code-generation-plan.md`)
  y T-10 (`build-and-test-summary.md`) de `260908`.
- ALWAYS crear las cuentas de Neon, Render y Expo/EAS a nombre de Carlos
  Puma, siguiendo instrucciones paso a paso — nunca a nombre de una cuenta
  compartida o de terceros sin su participación directa.
- ALWAYS separar los secretos de GitHub Actions por ambiente, usando
  GitHub Environments distintos (`staging` / `production`) con secretos
  propios cada uno.
- ALWAYS scopear a nivel de Environment `production` (protegido por el
  required reviewer = Carlos) todo secreto de producción: `DATABASE_URL` de
  Neon `main`, `EXPO_TOKEN` de producción y credenciales de despliegue de
  `backend-api-production`.
- ALWAYS confirmar el primer despliegue a producción solo si el login
  funciona Y una venta de prueba calcula la comisión correctamente contra la
  base de datos real (Neon `main`).
- ALWAYS limitar el acceso humano a la infraestructura real (consola de
  Neon, variables de entorno de Render, logs de Render/EAS) al titular de
  las cuentas (Carlos) — el RBAC de aplicación (roles NestJS) no sustituye
  este control a nivel de infraestructura.

## Forbidden

- NEVER desplegar a producción (Render `backend-api-production`, Neon
  `main`, EAS canal/perfil `production`) sin haber regenerado y validado el
  cliente Prisma real primero.
- NEVER compartir secretos entre los Environments `staging` y `production`
  de GitHub Actions — en particular, nunca un mismo `EXPO_TOKEN` cubre
  ambos ambientes.
- NEVER guardar secretos de producción (connection string de Neon, JWT
  secret, `EXPO_TOKEN`) como repository secret de GitHub — deben vivir
  exclusivamente en el Environment correspondiente.
- NEVER dar por exitoso el primer despliegue real basándose solo en el exit
  code del deploy de Render/EAS, sin el smoke test funcional (login + venta
  de prueba con cálculo de comisión).
- NEVER ejecutar un rollback automático del primer despliegue a producción
  sin notificar a Carlos — la reversión y la notificación son manuales.
- NEVER usar el rol superusuario/owner del proyecto Neon como credencial de
  runtime del backend en producción.
