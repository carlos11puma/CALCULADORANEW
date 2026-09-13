# Code Generation — backend-api — Resumen de Código

## Sources

- [upstream:code-generation-plan] `construction/backend-api/code-generation/code-generation-plan.md`
- [upstream:unit-test-instructions] `construction/backend-api/code-generation/unit-test-instructions.md`
- [upstream:source-manifest] `construction/backend-api/code-generation/source-manifest.json`
- [upstream:traceability] `construction/backend-api/code-generation/traceability.json`

## Archivos creados/modificados

Workspace `packages/backend-api/` completo (NestJS + Prisma), más cambios en la raíz del monorepo. Ver `source-manifest.json` para la lista exhaustiva (92 entradas, incluyendo dos claims de directorio para árboles generados). Resumen por área:

- **Esqueleto del proyecto**: `package.json`, `tsconfig.json`, `nest-cli.json`, `vitest.config.ts`, `.swcrc`, `.env.example`, `Dockerfile`, `render.yaml`, `README.md` — más la adición de `backend-api` como workspace y dependencia en el `package.json`/`package-lock.json` de la raíz del monorepo (ya reclamados originalmente por `api-contract`, modificados aquí).
- **Esquema de datos**: `prisma/schema.prisma` (7 entidades de `entities.md`, incluyendo `@@unique([vendorId, saleDate])` para NFR4.2), `prisma/migrations/20260908000000_init/migration.sql`.
- **Configuración**: `src/config/{configuration,env.validation}.ts`, `src/prisma/{prisma.module,prisma.service}.ts`.
- **Transversal**: `src/common/{errors.ts, guards/{auth,roles,login-throttler}.guard.ts, decorators/{roles,public,current-user}.decorator.ts, interceptors/logging.interceptor.ts, filters/http-exception.filter.ts}`.
- **6 módulos de dominio** (`module`/`controller`/`service`/`repository`/DTOs donde aplica): `src/auth/`, `src/vendor-directory/`, `src/commission-tier/`, `src/sales-entry/`, `src/commission-ledger/`, `src/notification/`.
- **Salud**: `src/health/{health.module,health.controller}.ts` (`@nestjs/terminus`, NFR6.2).
- **Bootstrap**: `src/app.module.ts`, `src/main.ts`.
- **CI/CD**: `.github/workflows/backend-api-ci.yml` (implementa `cicd-pipeline.md`).
- **Pruebas**: `__tests__/` — 25 archivos (unitarias por repositorio/servicio/guard por módulo + 6 suites de integración + `__tests__/setup.ts`), `__fixtures__/index.ts`.
- **Artefactos generados, excluidos de `source-manifest.json`** por estar en `.gitignore` (`dist/`, `coverage/`, `node_modules/`) y no ser código fuente de la aplicación: `packages/backend-api/dist/` (salida de `nest build`, regenerable), `packages/backend-api/coverage/` (reporte de cobertura de Vitest, regenerable), `node_modules/.prisma/client/` (stub escrito a mano — ver Desviaciones; se regenera con `npx prisma generate` a partir de `prisma/schema.prisma`, que sí es la fuente de verdad versionada).

## Decisiones clave de implementación

1. **Credenciales de Vendor auto-generadas**: `VendorInput` (DTO de `POST /vendors`) no incluye username/password — `vendor-directory.service.ts` genera un username único y una contraseña temporal aleatoria (hasheada con bcrypt) al crear un Vendor, sin flujo de recuperación (consistente con la Q4 de `functional-design-questions.md` — fuera del alcance del MVP; el supervisor comunica la credencial fuera de banda).
2. **Definición operacional de "tramos en orden" (ADR-003)**: `commission-tier.service.ts` define "en orden" como `commissionRate` no creciente a medida que `order` asciende — no estaba fijado por los artefactos previos; es una decisión propia de esta etapa.
3. **Cierre de R-01** (rate-limiting ausente en login/PIN): `LoginThrottlerGuard` implementado — 5 intentos/minuto por IP+credencial con backoff exponencial, aplicado a los endpoints de `AuthModule`.
4. **Cierre de R-02** (validación de sesión sin cruzar `User.active`): `auth.guard.ts` usa un único `findUnique` con `include: { user: true }` y rechaza si `revokedAt` está seteado o `!user.active`.
5. **Continuidad de R-03/R-04** (`nfr-design/security-design.md`): la nota de continuidad sobre `Vendor.active` no cruzado en `AuthGuard` (R-03) fue evaluada — no hay historia asignada que active/desactive un Vendor en el alcance de `backend-api`, por lo que se documenta como limitación conocida, no como bug; R-04 (storage en memoria de `@nestjs/throttler`, no apto para múltiples instancias) se documenta igual — el servicio corre como instancia única en el MVP (`scalability-design.md`).

## Resumen de cobertura de pruebas

- **Suite completa**: 134/134 pruebas pasando (verificado independientemente por el orquestador, no solo reportado por el subagente).
- **Cobertura**: líneas 91.87%, branches 84.64%, funciones 90.84% — todas por encima del piso 80%/70%/80% del Testing Contract (`team.md` § Testing Posture, heredado de `org.md` para alcance `mvp`).
- **Punto débil identificado**: `login-throttler.guard.ts` tiene cobertura de branch más baja (35.71%) que el resto del código — el promedio global sigue superando el piso, pero se señala como hallazgo candidato para la revisión de esta etapa (ver `code-generation-plan.md` § Review).
- Comando exacto: `npm test --workspace=packages/backend-api` (desde la raíz) o `npx vitest run --coverage` (desde `packages/backend-api/`).

## Desviaciones del plan

1. **Stub de cliente Prisma escrito a mano**: `binaries.prisma.sh` está bloqueado por la política de red/proxy de este entorno sandbox (403 Forbidden en la descarga del checksum del schema-engine), por lo que `npx prisma generate` no pudo ejecutarse. Se escribió a mano un stub en `node_modules/.prisma/client/{index,default}.{js,d.ts}` (y los demás archivos del árbol) que coincide con la forma de `schema.prisma`, para permitir que pruebas y build avancen. `prisma/schema.prisma` sigue siendo la fuente de verdad real. **Acción requerida antes de cualquier despliegue real**: ejecutar `npx prisma generate` con acceso de red real para regenerar el cliente desde el esquema — el stub nunca debe llegar a producción tal cual.
2. **`npm run build --workspace=packages/backend-api` falla en el prestep `prisma generate`** por el mismo bloqueo de red — verificado independientemente por el orquestador reproduciendo el mismo error 403. La compilación real de NestJS se verificó exitosa ejecutando `npx nest build` directamente (evitando el prestep bloqueado): exit 0, `dist/` generado correctamente.
3. **Pruebas de repositorio/esquema completamente mockeadas**: por la misma limitación de red (sin acceso a `binaries.prisma.sh` ni, en este entorno, a una base de datos Postgres efímera vía Docker/testcontainers), las pruebas de la Step 3-6 del plan (constraint `UNIQUE(vendorId, saleDate)`, acceso a datos) se ejecutan con `PrismaClient` mockeado en vez de contra una base de datos real — desviación de `unit-test-instructions.md` § Base de datos de prueba, que preveía esta posibilidad ("si Docker no está disponible en el entorno de ejecución"). Acción recomendada: correr la suite de integración contra una base Neon/Postgres real en el pipeline de CI (que sí tiene la red necesaria) antes del primer despliegue.
4. **`unplugin-swc` agregado a `vitest.config.ts`**: necesario para que `emitDecoratorMetadata` funcione bajo Vitest y permita que el contenedor de inyección de dependencias de NestJS resuelva correctamente los tipos en tiempo de ejecución — no estaba anticipado en el plan original, es un detalle de tooling necesario para que la Step 2 (bootstrap del test runner) funcionara con NestJS.
