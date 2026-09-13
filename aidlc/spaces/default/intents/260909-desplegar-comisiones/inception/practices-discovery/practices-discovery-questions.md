# Practices Discovery — Questions (260909-desplegar-comisiones)

## Sources

- [upstream:team-practices] `team-practices.md`
- [upstream:discovered-rules] `discovered-rules.md`
- [contributions] `contributions/aidlc-quality-agent.md`, `contributions/aidlc-developer-agent.md`, `contributions/aidlc-devsecops-agent.md`

## Contexto ya afirmado (no se vuelve a preguntar)

- Way of Working, Testing Posture y Code Style: heredados sin cambios de `team.md`.
- Despliegue automático a staging en cada integración a `main`; aprobación manual de Carlos antes de producción — ya afirmado, ahora se traduce a infraestructura real.

## Preguntas planteadas a Carlos Puma

### DEP-1/2 — ¿Quién ejecuta el aprovisionamiento inicial y a nombre de quién quedan las cuentas?

**[Answer]: Yo mismo, Carlos** — Carlos Puma crea las cuentas de Neon, Render y Expo/EAS con su propio correo, siguiendo instrucciones paso a paso. Quedan a su nombre.

### DEP-6 — ¿Qué pasa con el stub manual de Prisma (bloqueante para un despliegue real) y las vulnerabilidades de dependencias ya conocidas?

**[Answer]: Resolver ambos antes de desplegar** — regenerar el cliente Prisma real (con conexión a internet/Neon real) y actualizar las dependencias con vulnerabilidades críticas/altas, como primer paso de esta etapa, antes de tocar producción. Cierra el hallazgo R-01 de `code-generation` (backend-api) y T-10 de `build-and-test`.

### DEP-3 — ¿Cómo se guardan las credenciales de Neon/Render/Expo en GitHub Actions?

**[Answer]: Separadas por ambiente** — GitHub Environments distintos (`staging` / `production`) con secretos propios cada uno, nunca compartidos entre ambientes.

### DEP-4/5 — ¿Qué confirma que el primer despliegue real funcionó, y qué se hace si algo sale mal?

**[Answer]: Prueba mínima + reversión manual** — el despliegue se da por bueno solo si (a) el login funciona y (b) una venta de prueba calcula la comisión correctamente contra la base de datos real. Si falla, se revierte manualmente al build anterior y se notifica a Carlos.

## Assumptions & Open Questions

None.

## Consolidated Summary Confirmation

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
