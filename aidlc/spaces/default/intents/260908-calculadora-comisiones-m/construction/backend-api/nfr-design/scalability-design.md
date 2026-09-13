# NFR Design — backend-api — Scalability Design

## Sources

- [upstream:scalability-requirements] `construction/backend-api/nfr-requirements/scalability-requirements.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`

## Diseño: conexión pooled a Neon (NFR6.1)

La cadena de conexión de Prisma usa el endpoint "pooled" de Neon (pgBouncer integrado, modo `transaction`), configurada en `DATABASE_URL`, en vez de la conexión directa — evita que cada instancia del proceso NestJS agote el límite de conexiones concurrentes del tier gratuito de Neon. Un único `PrismaClient` (patrón singleton vía `PrismaModule` de NestJS) por proceso, reutilizado entre requests, mantiene el número de conexiones activas bajo, coherente con el volumen esperado (~26 vendedores, sin concurrencia alta).

## Diseño: escalado horizontal — no aplica en el MVP

El servicio es stateless a nivel de aplicación (toda sesión vive en `Session` de la base de datos, no en memoria del proceso — NFR3.10), por lo que técnicamente soportaría múltiples instancias detrás de un balanceador sin cambios; sin embargo, el volumen esperado (NFR7.2) no lo justifica en el MVP — se despliega como una única instancia, y el diseño stateless queda documentado como la razón por la que escalar horizontalmente después (si el volumen creciera) no requeriría un rediseño.

## Diseño: modelo de datos multi-supervisor (NFR7.1)

Ningún query ni regla de autorización de esta unidad asume `role=supervisor` como singleton — el `RolesGuard` (`security-design.md`) valida el rol, no un `userId` específico; activar un segundo supervisor es una operación de datos (crear un segundo `User` con `role=supervisor`), no un cambio de código.

## Diseño: proyección de volumen (NFR7.2)

| Entidad | Volumen anual proyectado | Estrategia |
|---|---|---|
| `DailySale` | ~26 vendedores × ~260 días hábiles ≈ 6,760 filas/año | Índice `(vendorId, saleDate)` único, sin partición |
| `CommissionPeriod` | ~26 vendedores × 12 meses = 312 filas/año | Índice `(vendorId, periodMonth)` único, sin partición |
| `Notification` | del orden de decenas por vendedor/mes (umbrales + manuales) — cientos/año | Índice `(vendorId, type, período vigente)`, sin partición ni archivado especial en el MVP |

Ninguna de estas proyecciones se acerca a un volumen que requiera particionamiento de tabla, sharding, ni una estrategia de archivado en frío — se revisita si el volumen de rutas activas (NFR2, adopción) crece un orden de magnitud por encima del rango esperado.

## Resumen

| ID | Diseño |
|---|---|
| NFR6.1 | Conexión pooled de Neon (pgBouncer, modo transaction), `PrismaClient` singleton por proceso |
| NFR7.1 | Ningún query/guard asume un supervisor singleton — activar uno nuevo es una operación de datos |
| NFR7.2 | Proyección de volumen documentada por entidad; ninguna requiere partición/sharding en el MVP |
