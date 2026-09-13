# NFR Requirements — backend-api — Questions

## Sources

- [upstream:functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:rules] `construction/backend-api/functional-design/rules.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:decisions] `inception/domain-design/decisions.md`
- [upstream:api-contract-nfr] `construction/api-contract/nfr-requirements/security-requirements.md`, `construction/api-contract/nfr-requirements/tech-stack-decisions.md`

`api-contract` ya fijó los requisitos de seguridad exigidos **al contrato** (NFR3.1-NFR3.8, NFR4.1) y dejó explícitamente pendientes, para que `backend-api` los resuelva como quien implementa: el almacenamiento cifrado de credenciales (NFR3 texto literal "credenciales cifradas", nota de continuidad #1 de su revisión) y la duración de sesión de supervisor (ya resuelta en Functional Design — Q1, BR1.5). Estas preguntas cubren lo que `backend-api` decide como implementación concreta: cómo protege datos, qué mecanismo de infraestructura usa para el cierre mensual (ADR-005 lo deja abierto explícitamente), y el stack técnico específico dentro de las restricciones ya fijas (NestJS, PostgreSQL en Neon).

## Q1. NFR3 exige "credenciales cifradas" — `api-contract` ya nombra `passwordHash`/`pin` como atributos internos, pero no fija el algoritmo de hash. ¿Qué mecanismo usa `backend-api` para almacenar la contraseña del vendedor y el PIN del supervisor?

A. `bcrypt` (o `argon2`) con salt automático para `passwordHash`; el PIN del supervisor se hashea igual (mismo mecanismo, aunque su espacio de valores sea más chico) — estándar de la industria para NestJS, sin dependencias adicionales de infraestructura, cumple NFR3 sin costo
B. Cifrado simétrico reversible (ej. AES) en vez de hash — permitiría recuperar la contraseña en texto plano si se necesitara, pero es peor práctica de seguridad para credenciales
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: C → A. No estoy seguro; se adopta la opción propuesta: bcrypt con salt automático para passwordHash y pin.

## Q2. El contrato (NFR3.1) exige `Authorization: Bearer <token>` y una sesión sin expiración por tiempo (BR1.4/BR1.5). ¿Qué mecanismo concreto de token usa `backend-api`?

A. Token opaco aleatorio (UUID/random de alta entropía) persistido en la tabla `Session`, validado con lookup a base de datos en cada petición protegida — permite revocación inmediata (`revokedAt`) sin lógica adicional, coherente con que la sesión "no expira por tiempo" (un JWT con expiración larga sería un anti-patrón: revocar un JWT ya emitido requiere una lista de revocación aparte)
B. JWT firmado sin estado, con revocación vía lista de tokens invalidados (blacklist) — evita el lookup a base de datos en cada petición, a costa de necesitar esa blacklist de todas formas para soportar `revokedAt`
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: C → A. No estoy seguro; se adopta la opción propuesta: token opaco persistido en Session, validado por lookup a base de datos.

## Q3. ADR-005 deja abierto el mecanismo concreto del job de cierre mensual (BR4.5) — nombra `@nestjs/schedule` como candidato dentro de las capas gratuitas. ¿Se confirma ese mecanismo?

A. `@nestjs/schedule` (cron in-process dentro del mismo servicio NestJS) — sin infraestructura adicional ni costo, coherente con el mandato de `project.md` de priorizar capas gratuitas; el riesgo aceptado es que el job solo corre si el proceso del servidor está activo en ese instante (mitigado porque el hosting gratuito objetivo mantiene el proceso corriendo de forma continua, no serverless-on-demand)
B. Job programado de la plataforma de hosting (cron externo que golpea un endpoint protegido) — más resiliente a reinicios del proceso, pero añade configuración fuera del código de la aplicación y depende de que la capa gratuita del hosting elegido soporte cron
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. @nestjs/schedule, cron in-process dentro del mismo servicio.

## Q4. El stack fijo es NestJS + PostgreSQL en Neon (`requirements.md` § Constraints), pero no se ha elegido el ORM/query builder. ¿Cuál usa `backend-api`?

A. Prisma — esquema declarativo tipado end-to-end, migraciones integradas, cliente generado type-safe; buen ajuste con Neon (soporta el modo serverless/pooled de Neon vía su adaptador) y con un equipo de un solo desarrollador que se beneficia de menos código repetitivo
B. TypeORM — más idiomático dentro del ecosistema NestJS (decoradores, integración `@nestjs/typeorm` de primera clase), pero con migraciones y tipado históricamente menos robustos que Prisma
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Prisma.

## Q5. NFR6 (costo de infraestructura) y el volumen esperado (~26 rutas, un solo vendedor por dispositivo) acotan la escala real de este servicio. ¿Qué nivel de observabilidad es proporcionado al tamaño del equipo (un solo desarrollador, Carlos como único supervisor)?

A. Logging estructurado (JSON) a stdout de cada request/error vía el logger nativo de NestJS, sin plataforma de monitoreo externa de pago — suficiente para depurar manualmente a este volumen; se revisa vía los logs que el hosting gratuito ya captura, sin agregar servicio adicional (coherente con NFR6/priorizar capas gratuitas)
B. Logging estructurado + una plataforma de monitoreo/alertas de terceros (ej. Sentry, Datadog) desde el MVP — mejor visibilidad proactiva, pero añade una dependencia y potencial costo no justificado para ~26 usuarios finales
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Logging estructurado a stdout vía el logger nativo de NestJS, sin plataforma externa de pago.

## Q6. NFR6 prioriza capas gratuitas; un hosting gratuito típico (ej. Render free tier, Railway free tier) puede "dormir" el servicio tras inactividad. ¿Qué objetivo de disponibilidad se fija para `backend-api` en el MVP, dado ese riesgo conocido?

A. Sin SLA formal de disponibilidad 24/7 — se acepta latencia de "cold start" (primer request tras inactividad puede tardar varios segundos) como riesgo conocido del tier gratuito (NFR6), documentado explícitamente en vez de prometer un objetivo que la capa gratuita no puede garantizar; NFR1 (recálculo <2s) se mide sobre peticiones en caliente, no sobre el primer request tras dormir
B. Exigir un hosting que garantice disponibilidad continua sin cold start, aunque tenga costo — contradice NFR6 y el mandato de `project.md` de priorizar capas gratuitas
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. Sin SLA formal 24/7 — se acepta el riesgo de cold start del tier gratuito, documentado explícitamente.

## Consolidated Summary Confirmation

- Almacenamiento de credenciales: `bcrypt` con salt para `passwordHash` y `pin`
- Mecanismo de sesión: token opaco persistido en `Session`, validado por lookup a base de datos (coherente con "sin expiración por tiempo" + revocación inmediata)
- Cierre mensual (BR4.5): `@nestjs/schedule`, cron in-process
- ORM: Prisma
- Observabilidad: logging estructurado a stdout vía logger nativo de NestJS, sin plataforma de pago
- Disponibilidad: sin SLA 24/7 formal — riesgo de cold start del tier gratuito aceptado y documentado

Does this all look correct before I generate the NFR Requirements artifacts for backend-api?

- Looks correct
- Request changes

[Answer]: Looks correct
