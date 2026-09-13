# Contract Design — Contract Summary

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:unit-of-work-dependency] `inception/units-generation/unit-of-work-dependency.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`

Esta etapa mapea la topología completa de bordes formales del sistema. Según `unit-of-work-dependency.md`, hay un único par de bordes reales: **api-contract (U1) → backend-api (U2)** y **api-contract (U1) → mobile-app (U3)**; no hay borde directo entre U2 y U3, y no hay ningún consumidor externo al sistema (confirmado en Q1 de `contract-design-questions.md`). El contrato cubre los 6 componentes de dominio de `components.md` (Auth, VendorDirectory, CommissionTier, SalesEntry, CommissionLedger, Notification), atendiendo el hallazgo #1 del reviewer de Units Generation.

## Contracts Table

| # | Provider Unit | Consumer | Mechanism | Owner |
|---|---|---|---|---|
| 1 | api-contract (U1) | backend-api (U2) | OpenAPI (YAML) + tipos TypeScript generados — implementación de los endpoints | backend-api implementa; api-contract define la forma |
| 2 | api-contract (U1) | mobile-app (U3) | OpenAPI (YAML) + tipos TypeScript generados — consumo vía fetch/axios tipado | api-contract define la forma; mobile-app consume |

No hay fila de consumidor `External:` — confirmado en Q1: el único consumidor de la API es mobile-app.

## Convenciones transversales

- **Base URL versionada**: `/api/v1/...` (Q4). Un cambio aditivo (campo nuevo opcional, endpoint nuevo) no requiere nueva versión — los consumidores ignoran campos no reconocidos. Un cambio incompatible (romper la forma de un campo existente, eliminar un endpoint, cambiar un tipo) requiere `/api/v2/...` con ambas versiones convivendo hasta que mobile-app migre.
- **Autenticación**: todo endpoint salvo login exige `Authorization: Bearer <token de sesión>` (AuthComponent, FR1). El rol (`vendedor` | `supervisor`) se resuelve del token, no de un parámetro de la petición — evita que un vendedor falsifique acciones de supervisor.
- **Formato de error uniforme** (Q5):

```yaml
error-schema:
  type: object
  required: [code, message]
  properties:
    code:
      type: string
      description: "Código estable, ej. VALIDATION_ERROR, UNAUTHORIZED, TIER_ORDER_WARNING"
    message:
      type: string
      description: "Mensaje legible, en español, para mostrar o loguear"
    details:
      type: array
      items:
        type: object
        properties:
          field: { type: string }
          reason: { type: string }
      description: "Detalles de validación por campo, cuando aplica (ej. AC2.2.2 presupuesto negativo)"
```

- **Timeout**: 10s por petición (Q5). Si mobile-app no recibe respuesta en ese plazo, trata la operación como si estuviera sin conexión (cae a persistencia local para las operaciones que lo soportan, como registrar venta).
- **Idempotencia de sincronización**: los endpoints de sincronización de ventas offline son idempotentes por `(vendorId, saleDate)` — reintentar un envío ya aplicado actualiza el mismo registro en vez de duplicarlo, consistente con ADR-004 (sincronización por fecha, sin merge).

## Contrato 1 — Auth (login, sesión)

```yaml
openapi: 3.0.3
info:
  title: Calculadora de Comisiones — Auth
  version: "1.0"
paths:
  /api/v1/auth/login/vendedor:
    post:
      summary: Login de vendedor (usuario/contraseña) — FR1.1
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, password]
              properties:
                username: { type: string }
                password: { type: string, format: password }
      responses:
        "200":
          description: Sesión de larga duración iniciada (FR1.4)
          content:
            application/json:
              schema:
                type: object
                properties:
                  token: { type: string }
                  userId: { type: string }
                  role: { type: string, enum: [vendedor] }
        "401":
          description: Credenciales inválidas
  /api/v1/auth/login/supervisor:
    post:
      summary: Login de supervisor por PIN — FR1.3
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [pin]
              properties:
                pin: { type: string }
      responses:
        "200":
          description: Sesión de supervisor iniciada
          content:
            application/json:
              schema:
                type: object
                properties:
                  token: { type: string }
                  userId: { type: string }
                  role: { type: string, enum: [supervisor] }
        "401":
          description: PIN inválido
  /api/v1/auth/logout:
    post:
      summary: Cierre de sesión explícito — FR1.4
      security: [{ bearerAuth: [] }]
      responses:
        "204":
          description: Sesión revocada
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## Contrato 2 — VendorDirectory (roster, presupuesto)

```yaml
openapi: 3.0.3
info:
  title: Calculadora de Comisiones — VendorDirectory
  version: "1.0"
paths:
  /api/v1/vendors:
    get:
      summary: Listar roster — FR2.1 (solo supervisor)
      security: [{ bearerAuth: [] }]
      responses:
        "200":
          description: Lista de vendedores
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/Vendor" }
    post:
      summary: Crear vendedor con presupuesto — FR2.1, FR2.2
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/VendorInput" }
      responses:
        "201":
          description: Vendedor creado
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Vendor" }
        "400":
          description: "Presupuesto negativo o vacío (AC2.2.2) — VALIDATION_ERROR"
  /api/v1/vendors/{vendorId}:
    patch:
      summary: Editar roster/presupuesto de un vendedor — FR2.1, FR2.2
      security: [{ bearerAuth: [] }]
      parameters:
        - { name: vendorId, in: path, required: true, schema: { type: string } }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/VendorInput" }
      responses:
        "200":
          description: Vendedor actualizado
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Vendor" }
        "400":
          description: Presupuesto inválido
        "404":
          description: Vendedor no existe
components:
  schemas:
    Vendor:
      type: object
      properties:
        id: { type: string }
        userId: { type: string }
        route: { type: string }
        name: { type: string }
        channel: { type: string, enum: [preventa, autoventa] }
        budget: { type: number }
        active: { type: boolean }
    VendorInput:
      type: object
      required: [route, name, channel, budget]
      properties:
        route: { type: string }
        name: { type: string }
        channel: { type: string, enum: [preventa, autoventa] }
        budget: { type: number, minimum: 0.01 }
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## Contrato 3 — CommissionTier (tramos de comisión)

```yaml
openapi: 3.0.3
info:
  title: Calculadora de Comisiones — CommissionTier
  version: "1.0"
paths:
  /api/v1/tiers:
    get:
      summary: Listar tramos por canal — FR2.3
      security: [{ bearerAuth: [] }]
      parameters:
        - { name: channel, in: query, required: false, schema: { type: string, enum: [preventa, autoventa] } }
      responses:
        "200":
          description: Tramos del canal, con indicador de orden
          content:
            application/json:
              schema:
                type: object
                properties:
                  tiers:
                    type: array
                    items: { $ref: "#/components/schemas/CommissionTier" }
                  inOrder:
                    type: boolean
                    description: "Si el conjunto vigente de tramos del canal está ordenado de mejor a peor beneficio (AC2.3.2)"
    put:
      summary: Reemplazar el conjunto de tramos de un canal — FR2.3
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items: { $ref: "#/components/schemas/CommissionTierInput" }
      responses:
        "200":
          description: "Guardado exitoso; puede incluir warning si quedó fuera de orden (Q3 de domain-design, guarda con advertencia, no bloquea)"
          content:
            application/json:
              schema:
                type: object
                properties:
                  tiers:
                    type: array
                    items: { $ref: "#/components/schemas/CommissionTier" }
                  inOrder: { type: boolean }
                  warning:
                    type: string
                    nullable: true
                    description: "TIER_ORDER_WARNING si el conjunto guardado quedó fuera de orden"
        "400":
          description: Tramo inválido (umbral o tasa vacíos/negativos)
components:
  schemas:
    CommissionTier:
      type: object
      properties:
        id: { type: string }
        channel: { type: string, enum: [preventa, autoventa] }
        tierType: { type: string, enum: ["por_devolucion", "por_efectividad"] }
        order: { type: integer }
        thresholdValue: { type: number }
        commissionRate: { type: number }
    CommissionTierInput:
      type: object
      required: [channel, tierType, order, thresholdValue, commissionRate]
      properties:
        channel: { type: string, enum: [preventa, autoventa] }
        tierType: { type: string, enum: ["por_devolucion", "por_efectividad"] }
        order: { type: integer }
        thresholdValue: { type: number }
        commissionRate: { type: number }
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## Contrato 4 — SalesEntry (venta diaria, online/offline)

```yaml
openapi: 3.0.3
info:
  title: Calculadora de Comisiones — SalesEntry
  version: "1.0"
paths:
  /api/v1/sales:
    post:
      summary: >
        Registrar o corregir la venta del día — FR3.1, FR3.2, FR3.3.
        Idempotente por (vendorId, saleDate): un reintento del mismo envío
        actualiza el mismo registro en vez de duplicarlo (ADR-004, AC3.3.4).
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/DailySaleInput" }
      responses:
        "200":
          description: Venta guardada o corregida (día aún abierto)
          content:
            application/json:
              schema: { $ref: "#/components/schemas/DailySale" }
        "400":
          description: "Monto negativo o vacío (FR3.2) — VALIDATION_ERROR"
        "409":
          description: "El día ya cerró; el valor quedó fijo (FR3.3) — no se puede corregir"
  /api/v1/sales/sync:
    post:
      summary: >
        Sincronizar un lote de ventas guardadas offline, cada una identificada
        por su propia fecha — cada ítem se aplica de forma independiente, sin
        fusión entre dispositivos (ADR-004, Q2 de units-generation).
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items: { $ref: "#/components/schemas/DailySaleInput" }
      responses:
        "200":
          description: Resultado por ítem del lote (aplicado / rechazado con motivo)
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    saleDate: { type: string, format: date }
                    status: { type: string, enum: [applied, rejected] }
                    error:
                      $ref: "#/components/schemas/Error"
                      nullable: true
components:
  schemas:
    DailySale:
      type: object
      properties:
        id: { type: string }
        vendorId: { type: string }
        saleDate: { type: string, format: date }
        amount: { type: number }
        returns: { type: number }
        syncStatus: { type: string, enum: [synced, pending] }
        closed: { type: boolean }
    DailySaleInput:
      type: object
      required: [saleDate, amount, returns]
      properties:
        saleDate: { type: string, format: date }
        amount: { type: number, minimum: 0 }
        returns: { type: number, minimum: 0 }
    Error:
      type: object
      properties:
        code: { type: string }
        message: { type: string }
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## Contrato 5 — CommissionLedger (reporte, historial)

```yaml
openapi: 3.0.3
info:
  title: Calculadora de Comisiones — CommissionLedger
  version: "1.0"
paths:
  /api/v1/commission/current:
    get:
      summary: Reporte del período vigente en tiempo real — FR4.1, FR5, FR8.1
      security: [{ bearerAuth: [] }]
      responses:
        "200":
          description: Comisión, venta vs. presupuesto, indicador de devolución vigentes
          content:
            application/json:
              schema: { $ref: "#/components/schemas/CommissionPeriod" }
  /api/v1/commission/history:
    get:
      summary: Historial de períodos cerrados — FR6
      security: [{ bearerAuth: [] }]
      parameters:
        - { name: limit, in: query, required: false, schema: { type: integer } }
      responses:
        "200":
          description: Lista de períodos cerrados, más recientes primero
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/CommissionPeriod" }
components:
  schemas:
    CommissionPeriod:
      type: object
      properties:
        id: { type: string }
        vendorId: { type: string }
        periodMonth: { type: string, description: "AAAA-MM" }
        accumulatedSales: { type: number }
        accumulatedReturns: { type: number }
        returnRate: { type: number }
        commissionEarned: { type: number }
        budgetProgress: { type: number, description: "% de venta acumulada sobre presupuesto vigente" }
        closed: { type: boolean }
        closedAt: { type: string, format: date-time, nullable: true }
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## Contrato 6 — Notification (umbrales automáticos, notificación manual)

```yaml
openapi: 3.0.3
info:
  title: Calculadora de Comisiones — Notification
  version: "1.0"
paths:
  /api/v1/notifications:
    get:
      summary: Notificaciones del vendedor autenticado, agrupadas por tipo en cliente — FR7, FR8.2, V5
      security: [{ bearerAuth: [] }]
      responses:
        "200":
          description: Lista de notificaciones (umbral de venta/presupuesto, devolución, manual)
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/Notification" }
  /api/v1/notifications/manual:
    post:
      summary: >
        Envío manual de notificación del supervisor a uno/varios/todos
        los vendedores — FR9.1, pantalla A5
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [message, recipients]
              properties:
                message: { type: string, minLength: 1 }
                recipients:
                  oneOf:
                    - type: string
                      enum: [all]
                    - type: array
                      items: { type: string }
                      description: "Lista de vendorId"
      responses:
        "202":
          description: Notificación encolada para envío push
        "400":
          description: Mensaje vacío o lista de destinatarios inválida
        "403":
          description: Quien envía no es un supervisor autenticado
components:
  schemas:
    Notification:
      type: object
      properties:
        id: { type: string }
        vendorId: { type: string }
        type: { type: string, enum: ["umbral_venta", "umbral_devolucion", "manual"] }
        thresholdCrossed: { type: number, nullable: true }
        earningOpportunity:
          type: object
          nullable: true
          description: "Solo en umbral_devolucion; omitido si CommissionTierComponent reporta tramos fuera de orden (AC8.3.2)"
          properties:
            nextTierThreshold: { type: number }
            potentialGain: { type: number }
        message: { type: string }
        sentAt: { type: string, format: date-time }
        read: { type: boolean }
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

## Contract Ownership Rules

- **Dueño de cada spec**: backend-api (U2) es el dueño técnico de la implementación de cada endpoint; api-contract (U1) es la fuente de verdad de su forma. Un cambio de forma se propone primero en api-contract (este archivo), luego se implementa en backend-api y se consume en mobile-app — nunca al revés.
- **Cambios rotos**: requieren nueva versión de ruta (`/api/v2/...`) conviviendo con `/api/v1/...` hasta que mobile-app migre; se acuerdan entre quien mantiene backend-api y quien mantiene mobile-app antes de implementarse (ambas unidades son del mismo equipo en este proyecto, así que el acuerdo es una conversación de equipo, no un proceso formal externo).
- **Cambios aditivos son seguros por diseño**: mobile-app debe ignorar campos de respuesta que no reconoce (no debe fallar si el backend agrega un campo nuevo); un campo nuevo requerido en una petición SIEMPRE cuenta como cambio roto (nunca aditivo), porque un consumidor viejo no lo enviaría.
- **Idempotencia** de `/api/v1/sales` y `/api/v1/sales/sync` es parte del contrato, no un detalle de implementación — cualquier cambio a esa garantía es en sí mismo un cambio roto.

## Open Questions

| Contract | Question | Blocks |
|---|---|---|
| CommissionLedger | ¿`CommissionPeriod` debe exponer también con qué configuración de tramos se calculó (hallazgo #4 de Domain Design), y si es así, en qué endpoint? | Functional Design — no bloquea Contract Design ni Code Generation del MVP, el campo puede agregarse de forma aditiva después |
| SalesEntry | El caso de borde de dos dispositivos editando la misma fecha offline (ADR-004) no tiene una regla de resolución explícita todavía — el contrato asume "el último en sincronizar gana" por ser idempotente por fecha, pero esa semántica exacta debe confirmarse en Functional Design | Functional Design — Delivery Planning debe recordarlo al planificar los Bolts de US3.3 |

## Review

**Reviewer:** aidlc-architecture-reviewer-agent
**Iteration:** 1

Fortalezas: el artefacto respeta el límite de la etapa (topología de bordes formales, no secuencia de construcción) y cubre correctamente los 6 componentes de dominio de `components.md`, no solo los más obvios — resuelve directamente el hallazgo #1 heredado de Units Generation. Los 6 bloques OpenAPI son consistentes con las entidades y atributos definidos en Domain Design (mismos nombres de campo: `budget`, `channel`, `tierType`, `order`, `accumulatedSales`, `returnRate`, `thresholdCrossed`, `earningOpportunity`, etc.), lo que reduce el riesgo de que backend-api y mobile-app diverjan al construirse en paralelo. La idempotencia de `/api/v1/sales` y `/api/v1/sales/sync` por `(vendorId, saleDate)` traduce correctamente ADR-004 (sincronización por fecha, sin merge) a una garantía de contrato explícita, y AC3.3.4 (fallo de red a mitad de guardado) queda cubierto por el mismo mecanismo de reintento idempotente. El endpoint de tramos (`PUT /api/v1/tiers`) traduce correctamente la decisión de "guardar con advertencia, no bloquear" (ADR-003) en un campo `warning` explícito en la respuesta 200, en vez de forzar un error. La regla de "campo nuevo requerido en petición = siempre cambio roto" en Contract Ownership Rules es la distinción correcta que muchos equipos omiten.

Hallazgos (no bloquean esta etapa; pasan a Delivery Planning / Functional Design):
1. El Open Questions ya señala explícitamente que la semántica exacta de "dos dispositivos, misma fecha, offline" (ADR-004) queda como supuesto de contrato ("el último en sincronizar gana") pendiente de confirmar en Functional Design — correcto no inventar la regla aquí, y correcto dejarlo trazado en vez de silenciarlo.
2. `CommissionPeriod` en el contrato de CommissionLedger no incluye el campo de "configuración de tramos usada en el cálculo" (hallazgo #4 de Domain Design) — la nota en Open Questions es correcta al marcarlo como adición aditiva futura y no bloqueante, dado que un campo de solo lectura nuevo no rompe a mobile-app.
3. El endpoint `/api/v1/notifications` no expone un parámetro de paginación — con el volumen de un MVP de un equipo pequeño esto no es un problema funcional, pero Delivery Planning podría anotarlo como mejora de bajo costo si el histórico de notificaciones crece.

**Verdict:** READY

Los 6 contratos cubren todos los componentes de dominio, son consistentes con `components.md` y `requirements.md`, y las convenciones transversales (versionado, errores, timeout, idempotencia) son suficientes para que backend-api y mobile-app se construyan en paralelo sin bloquearse. Los hallazgos anteriores son refinamientos para Functional Design y Delivery Planning, no huecos de contrato.
