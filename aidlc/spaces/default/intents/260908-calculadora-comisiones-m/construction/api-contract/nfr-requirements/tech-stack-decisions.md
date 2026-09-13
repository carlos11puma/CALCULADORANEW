# NFR Requirements — api-contract — Tech Stack Decisions

## Sources

- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:project-rules] `aidlc/spaces/default/memory/project.md`

## Decisión: distribución como workspace de monorepo

**Elección**: `api-contract` vive como un paquete/workspace dentro de un monorepo (npm/yarn/pnpm workspaces), conteniendo el YAML OpenAPI (fuente de verdad, ya definido en `contract-summary.md`) más un paquete de tipos TypeScript generado a partir de ese YAML (ej. con `openapi-typescript`). `backend-api` y `mobile-app` lo consumen como dependencia de workspace local, sin publicar a un registro npm externo (Q3 de `nfr-requirements-questions.md`).

**Justificación**: consistente con el mandato de `project.md` de "priorizar capas gratuitas de infraestructura" — un registro npm privado (ej. GitHub Packages privado, npm privado) añade una capa de configuración y potencial costo que un workspace local no necesita para un equipo de un solo desarrollador. También reduce la fricción de publicar una nueva versión del contrato en cada iteración durante Construction.

**Alternativas consideradas**:
- Paquete npm publicado en registro privado — rechazado por costo/complejidad operativa innecesaria para el tamaño de este equipo.
- Contrato definido solo dentro de `backend-api` (Swagger generado en runtime, sin unidad separada) — ya rechazado en Contract Design (Q2 de `contract-design-questions.md`); se reafirma aquí por consistencia.

## Decisión: generación de tipos desde OpenAPI

**Elección**: los tipos TypeScript de `mobile-app` (y los DTOs de `backend-api`, según decida su propio Functional Design/tech-stack) se generan automáticamente desde el YAML OpenAPI, no se escriben a mano.

**Justificación**: mantiene el YAML como única fuente de verdad (ADR de Contract Design Ownership Rules) — un tipo escrito a mano puede divergir silenciosamente del spec; uno generado no puede.

**Alternativas consideradas**: tipos TypeScript escritos a mano en paralelo al YAML — rechazado por riesgo de divergencia silenciosa entre spec y tipos, que es justamente el problema que la unidad `api-contract` existe para prevenir (Contract Design, Q2).

## Sin decisiones de lenguaje/runtime en esta unidad

`api-contract` no ejecuta código propio (es un `spec`, no un `service`) — no hay decisión de lenguaje de ejecución, framework de servidor, ni base de datos que tomar aquí; esas decisiones son de `backend-api` y `mobile-app`, cada una en su propio `tech-stack-decisions.md`.
