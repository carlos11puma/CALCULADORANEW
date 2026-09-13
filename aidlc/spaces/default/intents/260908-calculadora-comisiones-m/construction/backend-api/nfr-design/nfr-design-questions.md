# NFR Design — backend-api — Questions

## Sources

- [upstream:performance-requirements] `construction/backend-api/nfr-requirements/performance-requirements.md`
- [upstream:security-requirements] `construction/backend-api/nfr-requirements/security-requirements.md`
- [upstream:scalability-requirements] `construction/backend-api/nfr-requirements/scalability-requirements.md`
- [upstream:reliability-requirements] `construction/backend-api/nfr-requirements/reliability-requirements.md`
- [upstream:observability-requirements] `construction/backend-api/nfr-requirements/observability-requirements.md`
- [upstream:tech-stack-decisions] `construction/backend-api/nfr-requirements/tech-stack-decisions.md`
- [upstream:functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

La revisión de NFR Requirements dejó dos hallazgos concretos que esta etapa debe resolver con un diseño explícito (no bloquearon esa etapa, pero quedaron como trabajo pendiente): R-01 (sin límite de intentos fallidos en el login), R-02 (la validación de sesión no cruza `User.active`). Estas preguntas cubren esos dos puntos más las decisiones de arquitectura NFR que aún no tenían un diseño concreto.

## Q1. R-01 de la revisión de NFR Requirements: `POST /api/v1/auth/login/supervisor` (y también `login/vendedor`) no tiene límite de intentos fallidos. ¿Qué patrón de resiliencia se diseña para esto?

A. Rate limiting por IP + por `username`/rol, vía `@nestjs/throttler` (ej. 5 intentos fallidos por minuto por combinación IP+credencial, con backoff exponencial de bloqueo temporal) — librería NestJS de primera clase, sin infraestructura externa, coherente con NFR6 (capas gratuitas)
B. Solo rate limiting global por IP en todos los endpoints (no específico de login) — más simple, pero no cierra el hallazgo R-01 específicamente (un atacante podría rotar IPs o el límite global sería demasiado laxo para proteger un PIN de 4-6 dígitos)
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Rate limiting por IP + credencial vía @nestjs/throttler, con backoff exponencial.

## Q2. R-02: la validación de sesión (`NFR3.10`) no cruza `User.active`. ¿Cómo se diseña el guard de autenticación para cerrar esto?

A. El guard de NestJS que resuelve la sesión hace un único `JOIN` (o consulta con `include` de Prisma) `Session → User` y rechaza con `401` tanto si `revokedAt` no es nulo como si `User.active=false` — una sola consulta, sin round-trip adicional a base de datos, cerrando R-02 sin costo de rendimiento extra
B. Verificación separada: primero resolver la sesión, luego una segunda consulta a `User` para chequear `active` — más simple de implementar por partes, pero duplica el round-trip a base de datos en cada petición protegida
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: C → A. No estoy seguro; se adopta la opción propuesta: un único JOIN/include Session→User en el guard, rechazando por revokedAt o por active=false.

## Q3. `GET /api/v1/commission/current` (W8) es el endpoint de lectura más frecuente (se consulta cada vez que el vendedor abre la app). ¿Se diseña una capa de caché para este endpoint?

A. Sin caché — es una lectura indexada directa por `(vendorId, periodMonth)` (NFR1.3: <500ms ya sin caché), y el valor cambia con cada venta guardada (BR4.4 recalcula en cada escritura); una caché añadiría complejidad de invalidación (invalidar en cada W6/W7) sin beneficio claro al volumen esperado (~26 vendedores, no miles de lecturas concurrentes)
B. Caché en memoria (ej. `cache-manager` de NestJS) con invalidación activa en cada recálculo de `CommissionPeriod` — reduce carga a Neon en el caso de múltiples aperturas de app seguidas, a costa de la complejidad de invalidación
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: C → A. No estoy seguro; se adopta la opción propuesta: sin caché — lectura indexada directa es suficiente al volumen esperado.

## Q4. ¿Cómo se organizan los límites lógicos de componente (module boundaries) dentro del único servicio NestJS desplegable?

A. Un módulo de NestJS por componente de dominio (`AuthModule`, `VendorDirectoryModule`, `CommissionTierModule`, `SalesEntryModule`, `CommissionLedgerModule`, `NotificationModule`), cada uno con su propio controller/service/DTO, importándose entre sí solo a través de servicios exportados explícitamente — mantiene los límites de `components.md` dentro de un único deployable, sin la complejidad operativa de microservicios separados (injustificada al volumen y tamaño de equipo de este proyecto)
B. Un único módulo monolítico sin subdivisión por componente — más simple al inicio, pero pierde la trazabilidad directa con `components.md` y dificulta ubicar a qué componente pertenece cada regla de negocio durante Code Generation
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: C → A. No estoy seguro; se adopta la opción propuesta: un módulo de NestJS por componente de dominio, con límites explícitos vía servicios exportados.

## Q5. Gestión de secretos: ¿cómo se cargan la cadena de conexión de Neon y el resto de configuración sensible en cada ambiente?

A. `@nestjs/config` con validación de esquema al arrancar (ej. con `zod` o `class-validator`) — variables de entorno locales vía `.env` (nunca comiteado, ya en `.gitignore` por mandato de `project.md`) en desarrollo, y las variables de entorno nativas de la plataforma de hosting elegida en producción; el proceso falla rápido al arrancar si falta una variable requerida, en vez de fallar en el primer request que la necesite
B. Variables de entorno leídas directamente con `process.env` sin capa de validación — más simple, pero un typo en el nombre de una variable solo se descubre en tiempo de ejecución, en el peor momento (ej. al primer intento de conexión a la base de datos)
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. @nestjs/config con validación de esquema al arrancar, fail-fast si falta una variable requerida.

## Consolidated Summary Confirmation

- Rate limiting de login: `@nestjs/throttler` por IP+credencial, con backoff exponencial (cierra R-01)
- Validación de sesión: un único JOIN/include Session→User en el guard, rechazando por `revokedAt` o `User.active=false` (cierra R-02)
- Caché de `GET /commission/current`: ninguna — lectura indexada directa es suficiente
- Límites de módulo: uno por componente de dominio (`AuthModule`, `VendorDirectoryModule`, etc.), con servicios exportados explícitos
- Gestión de secretos: `@nestjs/config` con validación de esquema al arrancar, fail-fast

Does this all look correct before I generate the NFR Design artifacts for backend-api?

- Looks correct
- Request changes

[Answer]: Looks correct
