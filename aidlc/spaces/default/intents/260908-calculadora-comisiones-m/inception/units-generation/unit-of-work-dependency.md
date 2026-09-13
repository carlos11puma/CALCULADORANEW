# Units Generation — Unit Dependency DAG

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`

Este artefacto describe únicamente la topología de dependencias entre unidades — qué unidad necesita que otra exista. No recomienda un orden de construcción ni identifica un camino crítico: esa decisión económica corresponde a Delivery Planning (2.9), que consume este DAG.

## Dependencias (prosa)

- **backend-api (U2) depende de api-contract (U1)** — implementa los endpoints definidos por el contrato.
- **mobile-app (U3) depende de api-contract (U1)** — consume los tipos/schema definidos por el contrato para construir sus llamadas a la API.
- **backend-api (U2) y mobile-app (U3) no dependen entre sí** — una vez que api-contract está definido, ambas pueden construirse en paralelo contra ese contrato acordado.

## Puntos de integración

| Entre | Punto de integración |
|---|---|
| api-contract ↔ backend-api | backend-api implementa cada endpoint declarado en el contrato; cualquier cambio de forma de datos se versiona en api-contract primero |
| api-contract ↔ mobile-app | mobile-app importa los tipos del contrato para tipar sus llamadas HTTP y las respuestas |
| backend-api ↔ mobile-app | HTTP/REST sobre el contrato de api-contract; notificaciones push entregadas de forma asíncrona vía el servicio de push (external dependency de NotificationComponent, no una integración unit-a-unit) |

## Oportunidades de paralelismo

- **backend-api y mobile-app** son el único par sin dependencia directa entre sí — pueden desarrollarse en paralelo desde el momento en que api-contract tiene una versión estable inicial. Esta es la única oportunidad de paralelismo real en este proyecto de 3 unidades (decisión del usuario en Q2 de units-generation-questions.md, motivada explícitamente por habilitar este paralelismo).
- api-contract, al ser una unidad `spec` pequeña (complejidad S) y prerequisito de ambas, es candidata natural a completarse primero en cualquier ordenamiento topológico válido — sin que esto sea, en sí, una recomendación de secuencia económica (eso es decisión de 2.9).

## Bloque de aristas (machine-readable)

```yaml
units:
  - name: api-contract
    kind: spec
    depends_on: []
  - name: backend-api
    kind: service
    depends_on: [api-contract]
  - name: mobile-app
    kind: ui
    depends_on: [api-contract]
```
