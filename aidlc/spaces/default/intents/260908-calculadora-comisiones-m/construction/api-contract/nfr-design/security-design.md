# NFR Design — api-contract — Security Design

## Sources

- [upstream:security-requirements] `construction/api-contract/nfr-requirements/security-requirements.md`
- [upstream:functional-spec] `construction/api-contract/functional-design/functional-spec.md`

Diseño arquitectónico (patrones y decisiones, no código) que satisface los requisitos de `security-requirements.md`. Es el contrato de diseño que `backend-api` implementa; sin implementación concreta (interceptores, middleware real, librerías) — eso es Code Generation.

## Patrón: token opaco con lookup server-side

Satisface NFR3.1, NFR3.3, NFR3.6, NFR3.7.

- El `token` devuelto por login (`POST /api/v1/auth/login/*`) es un identificador opaco (no un JWT autocontenido) — no codifica claims que un cliente pueda decodificar; su único propósito es indexar la fila `Session` correspondiente.
- Cada petición a un endpoint protegido resuelve la `Session` con un lookup server-side por ese token (el patrón, no la implementación concreta — ej. índice sobre el token en el almacén de sesiones).
- La revocación (logout, o revocación manual futura por el supervisor) es instantánea: marca `revokedAt` en la `Session`; el siguiente lookup la encuentra revocada de inmediato — sin esperar una expiración ni mantener una lista de bloqueo separada (Q1).
- **Trade-off aceptado**: un lookup por petición añade una consulta de base de datos por request, frente a un JWT autocontenido que no la necesita. Se acepta porque la revocación instantánea es un requisito explícito (NFR3.3 / FR1.4 "cierre de sesión manual explícito") y el volumen esperado (~26 rutas, un puñado de peticiones por vendedor por día) hace irrelevante el costo de esa consulta adicional.

## Patrón: guard/middleware transversal de autorización

Satisface NFR3.6, NFR3.7.

- Un único componente transversal (un "guard" en el vocabulario de frameworks como NestJS, aplicado antes de que la petición llegue al handler del endpoint) resuelve `Session` → `User.role` y lo adjunta al contexto de la petición.
- Cada endpoint declara qué rol requiere (o ninguno, para los de solo-autenticación) como metadato, no como código repetido de verificación `if role !== 'supervisor'` dentro de cada handler.
- Un rol insuficiente se rechaza en el guard, antes de ejecutar cualquier lógica del handler — evita que un endpoint nuevo "olvide" la verificación de rol, porque el guard es la puerta obligatoria, no una convención que cada handler deba recordar aplicar.

## Patrón: TLS en el borde

Satisface NFR3.4, NFR3.5.

- TLS se termina en el borde de la infraestructura (ej. el balanceador/proxy del hosting), no dentro del código de `backend-api` — patrón estándar, evita reinventar manejo de certificados en la aplicación.
- Cualquier petición que llegue al borde por HTTP plano se redirige a HTTPS o se rechaza — decisión de infraestructura que Infrastructure Design (siguiente etapa) detalla con el proveedor concreto.

## Patrón: exposición mínima de datos de compensación

Satisface NFR3.8.

- Los endpoints que devuelven `CommissionPeriod`/comisión resuelven el `vendorId` desde la `Session` del token, nunca desde un parámetro de la petición — ya documentado en `contract-summary.md` (`GET /api/v1/commission/current`). El guard de autorización y este patrón de resolución de identidad trabajan juntos: uno decide "puede llamar este endpoint", el otro decide "de cuál vendedor".

## Traceability

Ver `traceability.json` — cada patrón de este documento mapea a los `NFR3.x`/`NFR4.x` de `security-requirements.md` que satisface.

## Review

**Reviewer:** aidlc-architecture-reviewer-agent
**Iteration:** 1

Fortalezas: la decisión de token opaco sobre JWT autocontenido está justificada con el trade-off explícito (una consulta extra por petición vs. revocación instantánea) en vez de simplemente afirmarla — es exactamente el tipo de "al menos dos alternativas consideradas" que `phases/inception.md` pide para decisiones arquitectónicas, aplicado aquí a un patrón de diseño. El patrón de guard/middleware transversal resuelve directamente el riesgo real de un guard mal aplicado ("un endpoint nuevo olvida la verificación") declarándolo como metadato en vez de código repetido — previene la clase de bug más común en autorización por rol. El patrón de exposición mínima de datos de compensación conecta explícitamente dos mecanismos que deben trabajar juntos (guard de rol + resolución de `vendorId` desde la sesión) sin confundirlos, evitando la falsa sensación de seguridad de tener solo uno de los dos.

Intento adversarial de encontrar huecos:
1. **Ataque de sesión robada (token opaco robado)** — el diseño no menciona explícitamente qué previene que un token robado (ej. interceptado sin TLS, o extraído del dispositivo) sea usado por un atacante hasta que alguien lo revoque manualmente, dado que NFR3.3 decidió sesión sin expiración por tiempo. Es un trade-off real de la decisión tomada (sesión larga sin expiración → ventana de exposición más larga si un token se compromete), pero TLS obligatorio (patrón de esta misma unidad) ya cierra el vector de intercepción en tránsito, y la exposición del dispositivo físico es responsabilidad de `mobile-app` (almacenamiento seguro del token en el dispositivo), fuera del alcance de esta unidad `spec`. No es un hueco que bloquee esta unidad, pero conviene que el NFR Design de `mobile-app` lo retome explícitamente (almacenamiento seguro del token, ej. Keychain/Keystore).
2. **NFR3.2 marcado N/A** — correcto: no hay patrón de *diseño* adicional que agregar a "el campo nunca se expone en response", es una regla de forma ya capturada en `entities.md`. No es una evasión, es la clasificación correcta.
3. **Verificación cruzada con `contract-summary.md`**: el patrón de resolución de `vendorId` desde la sesión (no desde parámetro) coincide con cómo están definidos los endpoints `GET /api/v1/commission/*` en Contract Design — ningún endpoint del contrato contradice este patrón.

Ningún hallazgo bloquea — el punto #1 es una nota de continuidad hacia `mobile-app`, no un vacío de esta unidad.

**Verdict:** READY

Los patrones de diseño de seguridad cubren todos los `NFR3.x`/`NFR4.x` aplicables (7 `OK`, 2 `N/A` justificados), son coherentes con `functional-design` y `contract-summary.md`, y las dos decisiones de la ronda de preguntas (token opaco, guard transversal) están reflejadas fielmente con su justificación.
