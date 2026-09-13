# backend-api

Servicio NestJS + Prisma + PostgreSQL (Neon) de **Calculadora de Comisiones**. Implementa los 6 componentes de dominio (`AuthModule`, `VendorDirectoryModule`, `CommissionTierModule`, `SalesEntryModule`, `CommissionLedgerModule`, `NotificationModule`) contra el contrato de `@calculadora-comisiones/api-contract`.

## Requisitos

- Node.js 22+
- Una base de datos PostgreSQL (Neon recomendado — capa gratuita, `project.md` § Mandated)

## Configuración local

1. Instalar dependencias desde la raíz del monorepo: `npm install`
2. Copiar `.env.example` a `.env` y completar `DATABASE_URL` con la cadena de conexión real (nunca commitear este archivo)
3. Generar el cliente Prisma: `npm run prisma:generate --workspace=packages/backend-api`
4. Aplicar las migraciones: `npm run prisma:migrate:deploy --workspace=packages/backend-api` (o `prisma:migrate:dev` en desarrollo, contra una base vacía)
5. Levantar el servicio: `npm run start:dev --workspace=packages/backend-api`

El servicio escucha en `http://localhost:3000/api/v1` (prefijo de versión — `contract-summary.md`).

## Pruebas

Comando exacto de esta unidad: `npm test --workspace=packages/backend-api` (vitest, ver `vitest.config.ts` — piso de cobertura 80% líneas/statements/functions, 70% branches).

**Nota sobre pruebas de base de datos**: este entorno de generación de código no tuvo Docker/testcontainers ni una rama Neon staging disponibles, así que **todas** las pruebas mockean `PrismaClient` (`vitest-mock-extended`) en vez de golpear una base de datos real — incluidas las de "esquema"/constraint (Step 3-4 del plan), que verifican la forma del `schema.prisma` y el comportamiento esperado del constraint `UNIQUE(vendorId, saleDate)` simulando el error `P2002` que Prisma lanzaría. Antes de desplegar a un entorno real, correr `prisma:migrate:dev` contra una base de prueba real y validar el constraint manualmente.

## Migraciones

- `npm run prisma:migrate:dev --workspace=packages/backend-api` — desarrollo, contra una base vacía o de prueba
- `npm run prisma:migrate:deploy --workspace=packages/backend-api` — producción/CI, aplica migraciones ya generadas sin crear nuevas

## Variables de entorno

Ver `.env.example`. `DATABASE_URL` es la única variable requerida — el proceso falla al arrancar (antes de aceptar tráfico) si falta, vía `@nestjs/config` con validación de esquema (NFR3.12).

## Despliegue

`render.yaml` describe el servicio Docker en Render (capa gratuita). `Dockerfile` construye `api-contract` y `backend-api` en un multi-stage build y corre `prisma migrate deploy` al arrancar el contenedor.

## Job de cierre mensual

`CommissionLedgerService.closeOverduePeriods` corre diariamente a la 1am (`@nestjs/schedule`, `EVERY_DAY_AT_1AM`) y evalúa una condición de estado idempotente (¿hay un período vigente cuyo mes ya terminó?) en vez de dispararse solo el último día del mes — así se auto-recupera si el proceso estuvo caído justo en el cambio de mes (NFR6.3, `reliability-design.md`).
