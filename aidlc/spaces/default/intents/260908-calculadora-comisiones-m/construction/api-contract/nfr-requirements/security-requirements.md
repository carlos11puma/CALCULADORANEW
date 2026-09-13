# NFR Requirements — api-contract — Security Requirements

## Sources

- [upstream:functional-spec] `construction/api-contract/functional-design/functional-spec.md`
- [upstream:rules] `construction/api-contract/functional-design/rules.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`

Requisitos de seguridad exigidos por esta unidad a cualquier implementación del contrato — no a cómo `backend-api` los implementa internamente (eso es su propio NFR Requirements). Cada requisito hereda el ID `NFR{n}` de inception y agrega un sub-número.

## NFR3 — Seguridad (inception: "los datos de comisión/salario se protegen con control de acceso por rol, credenciales cifradas y HTTPS obligatorio")

- **NFR3.1**: todo endpoint salvo `/api/v1/auth/login/*` exige `Authorization: Bearer <token>`; la petición sin token, o con token inválido/revocado/expirado, se rechaza con `401` (BR1.1 de `functional-design/rules.md`).
- **NFR3.2**: la contraseña de vendedor y el PIN de supervisor nunca se exponen en ninguna respuesta del contrato (ni siquiera hasheados) — `entities.md` los marca explícitamente como "nunca se expone en response".
- **NFR3.3**: el token de sesión de vendedor no expira por tiempo — permanece válido hasta `logout` explícito o revocación manual por el supervisor, tal como describe FR1.4 literalmente (Q2 de `nfr-requirements-questions.md`). La duración de la sesión de supervisor queda pendiente de una decisión más específica en el Functional Design de `backend-api`, que es quien la implementa.
- **NFR3.4**: TLS obligatorio en toda comunicación con la API — HTTPS únicamente, sin fallback a HTTP (Q1). Justificación directa del texto de NFR3 ("HTTPS obligatorio en toda comunicación con el backend"), reforzado por el mandato de `project.md` de proteger datos de comisión/salario.
- **NFR3.5**: cualquier cliente (mobile-app u otro) que intente una llamada por HTTP plano debe ser rechazado o redirigido a HTTPS — detalle de implementación de infraestructura, pero la exigencia de "nunca HTTP plano" es del contrato.
- **NFR3.6**: los endpoints de administración (roster, presupuesto, tramos) y el envío manual de notificación exigen rol `supervisor` resuelto del token — nunca de un parámetro de la petición, para que un vendedor no pueda falsificar una acción de supervisor cambiando un campo del body (BR1.2, BR1.3). Esto es el "control de acceso por rol" que NFR3 exige explícitamente.
- **NFR3.7**: el rol se resuelve server-side a partir de la `Session` asociada al token en cada petición — el contrato nunca confía en un rol que el cliente afirme tener.
- **NFR3.8**: los campos de comisión, presupuesto y devolución (datos de compensación) solo se exponen al propio vendedor dueño del dato o a un supervisor autenticado — ningún endpoint de este contrato acepta un `vendorId` ajeno para leer comisión de otro vendedor (nota heredada del hallazgo #2 de la revisión de Functional Design de esta unidad).

## NFR4 — Disponibilidad offline (inception: "sincronizar de forma confiable al recuperar señal, sin pérdida ni duplicación de datos")

- **NFR4.1**: el contrato garantiza idempotencia de sincronización por `(vendorId, saleDate)` en `POST /api/v1/sales` y `POST /api/v1/sales/sync` (BR3.3) — la base contractual sobre la que `backend-api` y `mobile-app` construyen la garantía completa de "sin pérdida ni duplicación" de NFR4. Esta unidad no implementa la lógica de reintento del lado del cliente (eso es de `mobile-app`), solo garantiza que el servidor nunca duplica un reintento.

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR3.1 | Autenticación Bearer obligatoria en endpoints protegidos | NFR3 / BR1.1 |
| NFR3.2 | Credenciales nunca se exponen en response | NFR3 |
| NFR3.3 | Sesión de vendedor sin expiración por tiempo, hasta logout/revocación | NFR3 / FR1.4 |
| NFR3.4 | TLS obligatorio (HTTPS únicamente) | NFR3 (texto literal) |
| NFR3.5 | Rechazo de HTTP plano | NFR3.4 |
| NFR3.6 | Autorización de administración y envío manual exige rol supervisor del token | NFR3 / BR1.2, BR1.3 |
| NFR3.7 | Rol siempre resuelto server-side, nunca confiado del cliente | NFR3.6 |
| NFR3.8 | Datos de compensación solo visibles al propio vendedor o a un supervisor | Hallazgo de revisión de Functional Design |
| NFR4.1 | Idempotencia de sincronización por fecha+vendedor (base contractual de "sin pérdida ni duplicación") | NFR4 / BR3.3 |

## Review

**Reviewer:** aidlc-architecture-reviewer-agent
**Iteration:** 1

Fortalezas: cada requisito hereda correctamente su `NFR{n}` de inception con sub-numeración (NFR3.x, NFR4.x) en vez de inventar una numeración propia — corrige lo que habría sido un error de trazabilidad. NFR3.6/3.7 traducen "control de acceso por rol" (texto literal de NFR3 en requirements.md) en una regla concreta y verificable (rol resuelto del token, nunca de un parámetro), que es precisamente el tipo de vaguedad que `phases/inception.md` pide evitar ("fast", "easy" sin umbral medible) — aquí el umbral es binario y verificable. NFR4.1 conecta correctamente la garantía de idempotencia de esta unidad con el NFR4 de inception sin sobre-prometer: dice explícitamente que la lógica de reintento del cliente es responsabilidad de `mobile-app`, no de este contrato.

Intento adversarial de encontrar huecos:
1. **NFR3 exige "credenciales cifradas"** — el texto de NFR3 en `requirements.md` menciona credenciales cifradas explícitamente. NFR3.2 cubre que la contraseña/PIN nunca se exponen en response, pero no dice explícitamente que se almacenan cifradas (hasheadas) — eso es responsabilidad de `backend-api` (cómo almacena, no qué expone el contrato), y de hecho `entities.md` ya nombra el atributo `passwordHash` (no `password`), lo que documenta la intención de hash. No es un hueco real: el contrato no almacena nada, solo define la forma; el requisito de almacenamiento cifrado pertenece al NFR Requirements de `backend-api`. Se sugiere que `backend-api` cite explícitamente este NFR3 al heredarlo, para no perder la trazabilidad.
2. **Traceability NFR7** — marcado `N/A` con la observación de que el contrato "ya modela role sin cardinalidad fija" pero delega la garantía real a la base de datos. Es una justificación honesta (no oculta que el contrato contribuye parcialmente) y no bloquea, pero conviene que `backend-api` la retome explícitamente al justificar su propio NFR7.
3. **Verificación de traceability.json**: las 8 sub-reglas de NFR3.1–3.8 y NFR4.1 están todas cubiertas en el `coverage`; no hay sub-regla huérfana ni target inventado que no exista en `security-requirements.md`. Correcto.

Ningún hallazgo bloquea — ambos son notas de continuidad hacia `backend-api`, no vacíos de esta unidad.

**Verdict:** READY

Los requisitos de seguridad y disponibilidad-offline aplicables a `api-contract` están completos, correctamente heredados de los NFR de inception con sub-numeración, y consistentes con `rules.md`/`entities.md`. `tech-stack-decisions.md` documenta con justificación las dos decisiones propias de esta unidad (monorepo, generación de tipos). La trazabilidad no tiene huecos ni huérfanos.
