# Code Generation — backend-api — Unit Test Instructions

## Framework y configuración

- **Runner**: `vitest` (mismo runner que `api-contract`, consistencia dentro del monorepo), con `@nestjs/testing` para construir el `TestingModule` de cada suite.
- **Configuración**: `packages/backend-api/vitest.config.ts` — piso de cobertura 80% líneas/statements/functions, 70% branches (mismo piso que `api-contract`, heredado de `team.md` § Testing Posture); `include: ["src/**/*.ts"]`, excluyendo `src/**/*.module.ts` (módulos de NestJS son solo cableado declarativo, sin lógica propia que cubrir) y `main.ts` (bootstrap del proceso).
- **Comando exacto de esta unidad**: `npm test --workspace=packages/backend-api` — ejecuta toda la suite de `packages/backend-api` únicamente, sin afectar `api-contract` ni (más adelante) `mobile-app`.
- **Base de datos de prueba**: las pruebas de repositorio/integración usan una base de datos Postgres efímera (contenedor Docker local vía `testcontainers`, o la rama `staging` de Neon si Docker no está disponible en el entorno de ejecución) — nunca la base de datos de producción. Las pruebas unitarias de lógica de negocio (Step 7-8 del plan) mockean `PrismaClient` en vez de golpear una base de datos real.

## Volumen esperado (estrategia standard)

5-8 pruebas por componente (`AuthModule`, `VendorDirectoryModule`, `CommissionTierModule`, `SalesEntryModule`, `CommissionLedgerModule`, `NotificationModule`) más pruebas de integración en los límites clave (cada endpoint HTTP) — sumado al piso de cobertura de 80% del alcance `mvp`. Con 6 componentes, esto se traduce en un rango aproximado de 40-60 pruebas unitarias más ~20-25 pruebas de integración (una por endpoint, camino feliz + 2 casos de borde cada una, mandato de `phases/construction.md` § Testing Standards).

## Cobertura esperada por capa

| Capa | Qué cubrir |
|---|---|
| Esquema Prisma (Step 3-4) | Constraint `UNIQUE(vendorId, saleDate)` rechaza un duplicado; tipos/enums coinciden con `entities.md` |
| Repositorio (Step 5-6) | Cada método de acceso a datos con `PrismaClient` mockeado — lectura, escritura, manejo de "no encontrado" |
| Lógica de negocio (Step 7-8) | Cada `BRx.y` de `rules.md` con al menos un caso feliz y un caso límite explícito (ver casos límite listados en el plan) |
| Endpoints (Step 9-10) | Cada uno de los 13 workflows: camino feliz (200/201/204) + al menos 2 casos de error (400/401/403/404/409, según aplique) |

## Mocking/stubbing

- `PrismaClient` se mockea con `vitest-mock-extended` (o equivalente) en pruebas de repositorio y de lógica de negocio — nunca una base de datos real en pruebas puramente unitarias.
- `bcrypt` se mockea en pruebas que no verifican específicamente el hash (para no pagar el costo real del factor 10 en cada prueba) — las pruebas de `AuthModule` que sí verifican el mecanismo de hash usan la librería real, no el mock.
- `@nestjs/schedule` — el job de cierre mensual se prueba invocando su método directamente (no esperando el disparo real del cron), con `PrismaClient` mockeado.
- El guard de autenticación/autorización se prueba tanto de forma unitaria (mock de `Reflector`/`ExecutionContext`) como implícitamente en cada prueba de integración de endpoint protegido.

## Gestión de datos de prueba

- Fixtures compartidos en `packages/backend-api/__fixtures__/` (vendedor de ejemplo, tramos de canal preventa/autoventa en y fuera de orden, ventas de distintos días) — reutilizados entre pruebas de lógica de negocio y de integración para mantener consistencia con los ejemplos ya usados en `functional-spec.md`.
- Cada suite de integración limpia su propio estado (transacción revertida al final, o base de datos de prueba reseteada entre archivos) — ninguna prueba depende del orden de ejecución de otra.
