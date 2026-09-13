# NFR Requirements — backend-api — Tech Stack Decisions

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:decisions] `inception/domain-design/decisions.md`
- [upstream:api-contract-tech-stack] `construction/api-contract/nfr-requirements/tech-stack-decisions.md`
- [upstream:project-rules] `aidlc/spaces/default/memory/project.md`
- [upstream:nfr-requirements-questions] `construction/backend-api/nfr-requirements/nfr-requirements-questions.md`

El lenguaje/runtime/base de datos ya están fijos por `requirements.md` § Constraints (NestJS, PostgreSQL en Neon) — no son decisiones de esta etapa. Lo que sigue son las decisiones concretas de implementación que sí quedaban abiertas, resueltas en la ronda de preguntas de esta etapa.

## Decisión: hash de credenciales — bcrypt

**Elección**: `bcrypt` con salt automático para `User.passwordHash` (vendedor) y `User.pin` (supervisor) (Q1).

**Justificación**: cumple el requisito literal de NFR3 ("credenciales cifradas") sin infraestructura adicional — librería estándar del ecosistema Node/NestJS, sin costo ni dependencia externa (coherente con NFR6). Hashear también el PIN, y no solo la contraseña, cierra la nota de continuidad #1 dejada por la revisión de `api-contract`'s NFR Requirements (que solo confirmó que las credenciales nunca se exponen en response, no cómo se almacenan).

**Alternativas consideradas**: cifrado simétrico reversible (AES) — rechazado porque permitiría recuperar la credencial en texto plano si la clave de cifrado se comprometiera, peor práctica que un hash de una vía para credenciales que nunca necesitan leerse de vuelta (solo compararse).

## Decisión: mecanismo de sesión — token opaco con lookup en base de datos

**Elección**: token opaco de alta entropía (ej. UUID v4 o equivalente aleatorio), persistido en `Session.id` (o un campo de token dedicado), validado con una consulta a base de datos en cada petición protegida (Q2).

**Justificación**: BR1.4/BR1.5 ya fijaron que ninguna sesión expira por tiempo — un JWT autocontenido con expiración larga sería un anti-patrón aquí, porque revocar un JWT ya emitido (`revokedAt`, entities.md) requeriría de todas formas una blacklist consultada en cada petición, lo cual anula la ventaja de "sin estado" del JWT. El token opaco con lookup directo logra el mismo resultado (revocación inmediata) sin la complejidad añadida de mantener dos mecanismos.

**Alternativas consideradas**: JWT sin estado + blacklist de revocación — rechazado por la razón anterior; el volumen de peticiones esperado (~26 rutas) hace irrelevante la ventaja de rendimiento que un JWT sin lookup ofrecería a mayor escala.

## Decisión: mecanismo del job de cierre mensual — `@nestjs/schedule` in-process

**Elección**: `@nestjs/schedule` (cron in-process dentro del mismo servicio NestJS) implementa BR4.5, confirmando el candidato que ADR-005 (Domain Design) ya había dejado anotado (Q3).

**Justificación**: sin infraestructura adicional ni costo — coherente con NFR6 y el mandato de `project.md` de priorizar capas gratuitas. El riesgo aceptado (el job solo corre si el proceso está activo en el instante exacto) se mitiga con el diseño de reintento cubierto en `reliability-requirements.md` (NFR6.2).

**Alternativas consideradas**: cron externo de la plataforma de hosting golpeando un endpoint protegido — rechazado por añadir configuración fuera del código de la aplicación y depender de que la capa gratuita del hosting elegido soporte cron, sin necesidad real dado el volumen.

## Decisión: ORM — Prisma

**Elección**: Prisma como capa de acceso a datos sobre PostgreSQL/Neon (Q4).

**Justificación**: esquema declarativo tipado end-to-end (reduce el riesgo de divergencia entre el modelo de `entities.md` y el código, el mismo principio que ya guio la decisión de tipos generados de `api-contract`), migraciones integradas, y buen soporte del modo serverless/pooled de conexión de Neon — relevante para un equipo de un solo desarrollador que se beneficia de menos código repetitivo de acceso a datos.

**Alternativas consideradas**: TypeORM — más idiomático dentro de NestJS (integración `@nestjs/typeorm` de primera clase), pero históricamente con migraciones y tipado menos robustos que Prisma; se prefiere la robustez de tipado dado que un solo desarrollador no tiene una segunda persona que detecte una migración mal generada en revisión de código.

## Decisión: observabilidad — logging estructurado a stdout, sin plataforma externa

**Elección**: logging estructurado (JSON) vía el `Logger` nativo de NestJS a stdout, sin una plataforma de monitoreo/alertas de terceros en el MVP (Q5).

**Justificación**: suficiente para depurar manualmente al volumen esperado (~26 rutas, un solo supervisor); los logs ya quedan capturados por el hosting gratuito elegido, sin agregar un servicio adicional de pago (NFR6).

**Alternativas consideradas**: Sentry/Datadog desde el MVP — rechazado por costo y dependencia no justificados para el tamaño de este equipo; se puede añadir en una fase posterior si el volumen de uso crece.

## Decisión: disponibilidad — sin SLA 24/7 formal, cold start aceptado

**Elección**: no se fija un objetivo de disponibilidad 24/7 para el MVP; se acepta y documenta explícitamente el riesgo de "cold start" (latencia elevada del primer request tras un período de inactividad) típico de un hosting gratuito (Q6).

**Justificación**: NFR6 prioriza capas gratuitas por sobre disponibilidad continua garantizada; NFR1 (recálculo <2s) se mide sobre peticiones en caliente, no sobre el primer request tras dormir — documentar esto explícitamente evita prometer un objetivo que la capa gratuita no puede garantizar.

**Alternativas consideradas**: exigir un hosting con disponibilidad continua sin cold start (con costo) — rechazado por contradecir NFR6 y el mandato de `project.md`.
