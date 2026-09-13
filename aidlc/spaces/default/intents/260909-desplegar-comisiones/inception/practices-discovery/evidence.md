# Evidence — 260909-desplegar-comisiones — Practices Discovery

## Modo de ejecución

Re-run de practices-discovery dentro de un proyecto activo. `memory/team.md`
ya contiene contenido afirmado (proveniente del intent `260908-calculadora-comisiones-m`)
y se trata como baseline actual, no como default sugerido. Este intent es de
alcance `infra`: cubre únicamente deployment-pipeline, environment-provisioning
y deployment-execution para llevar a producción real la app ya construida.
Walking Skeleton no aplica (no es una etapa de Construction).

## Qué inspeccionó cada participante

### Lead (aidlc-pipeline-deploy-agent)

- `aidlc/spaces/default/memory/org.md` — default de organización para
  `## Deployment` (deploy en merge a staging, aprobación manual antes de
  producción).
- `aidlc/spaces/default/memory/team.md` — las cinco secciones afirmadas para
  este equipo; `## Deployment` [Q4] es la única con implicación directa.
- `aidlc/spaces/default/memory/project.md` — `## Mandated` / `## Forbidden`
  estampados en `260908` (protección de datos de comisión/salario,
  priorizar capas gratuitas, nunca commitear secretos).
- `construction/backend-api/infrastructure-design/infrastructure-specification.md`
  y `cicd-pipeline.md` (`260908`) — Render (dos servicios), Neon (dos
  ramas), `render.yaml` como IaC, GitHub Actions con Environment + required
  reviewer.
- `construction/mobile-app/infrastructure-design/infrastructure-specification.md`
  y `cicd-pipeline.md` (`260908`) — EAS Build (3 perfiles) + EAS Update
  (OTA) + EAS Internal Distribution.
- `construction/ci-pipeline/ci-config.md` y `quality-gates.md` (`260908`) —
  los 4 workflows de GitHub Actions confirmados por Carlos, y la tabla de
  gates bloqueantes/no bloqueantes.

### aidlc-quality-agent

- `construction/backend-api/code-generation/code-generation-plan.md` y
  `build-and-test-summary.md` — confirmó el hallazgo R-01 (stub manual del
  cliente Prisma, `binaries.prisma.sh` bloqueado en sandbox) y la aceptación
  condicional de T-10 ("acción pendiente antes de cualquier despliegue de
  producción real").
- `ci-pipeline/ci-config.md` y `cicd-pipeline.md` — confirmó ausencia de un
  paso de smoke test / health-check post-despliegue en los 4 workflows.
- `quality-gates.md` — confirmó que el piso de cobertura 80/70/80 se
  verifica manualmente, sin `coverageThreshold` en CI (deuda técnica
  registrada, no bloqueante de este intent).

### aidlc-developer-agent

- `infrastructure-specification.md` de `backend-api` y `mobile-app` —
  verificó y documentó la inconsistencia de nombres de ambiente entre
  proveedores (Render `staging`/`production`, Neon `staging`/`main`, EAS
  `preview`/`production`).
- `code-generation/code-summary.md` y `code-generation-plan.md` — confirmó
  R-01 (stub de Prisma) como bloqueador técnico real y verificado del primer
  despliegue, distinto en naturaleza de las preguntas operativas DEP-1 a
  DEP-5.
- Estructura del monorepo (`packages/backend-api`, mobile-app,
  `render.yaml` en raíz) — sin hallazgos, límites de capa correctos.

### aidlc-devsecops-agent

- `cicd-pipeline.md` de ambas unidades — evaluó el mecanismo de GitHub
  Environment + required reviewer y formuló la recomendación concreta de
  environment secrets obligatorios para todo lo sensible de producción.
- `build-and-test-summary.md` y `quality-gates.md` — confirmó T-10
  (vulnerabilidad crítica `tar` DoS + `lodash` code injection en
  `backend-api`; crítica + 11 altas en `mobile-app`) y que
  `dependency-audit.yml` corre con `continue-on-error: true` (no bloquea).
- `project.md` § Mandated (RBAC de comisión/salario) — evaluó que el mandato
  cubre solo la capa de aplicación y señaló los controles adicionales de
  infraestructura necesarios (consola Neon, variables de entorno de Render,
  logs).

## Decisiones de la entrevista (Step 4, Carlos Puma)

1. **DEP-1/DEP-2 — Titularidad y ejecución del aprovisionamiento**: Carlos
   crea personalmente las cuentas de Neon, Render y Expo/EAS con su propio
   correo, siguiendo una guía paso a paso. Quedan a su nombre.
2. **DEP-6 (prerequisitos técnicos) — Stub de Prisma y T-10**: ambos se
   resuelven antes de tocar producción, como primer paso concreto de este
   intent — regenerar el cliente Prisma real y actualizar las dependencias
   con vulnerabilidades críticas/altas. Cierra R-01 y T-10.
3. **DEP-3 — Secretos de GitHub Actions**: separados por ambiente, dos
   GitHub Environments (`staging`/`production`) con secretos propios cada
   uno, nunca compartidos.
4. **DEP-4/DEP-5 — Verificación del primer despliegue y rollback**: el
   despliegue se confirma exitoso solo si el login funciona y una venta de
   prueba calcula la comisión correctamente contra la base de datos real.
   Si falla, reversión manual al build anterior y notificación a Carlos.

Estas cuatro decisiones, junto con las adiciones no conflictivas de los
agentes de soporte (tabla de mapeo de nombres de ambiente del agente de
desarrollo; RBAC a nivel de infraestructura del agente de devsecops — ambas
ya integradas en `team-practices.md` § Deployment), están reflejadas
íntegramente en `team-practices.md` y `discovered-rules.md`.

## Incertidumbre no resuelta

Ninguna. Las cinco preguntas abiertas del draft del lead (DEP-1 a DEP-5) y
el hallazgo adicional de los agentes de soporte (stub de Prisma + T-10,
consolidado como DEP-6) quedaron resueltos en la entrevista. El punto de
calidad sobre ausencia de smoke test/health-check queda resuelto por la
decisión DEP-4/DEP-5. El punto de devsecops sobre T-10 queda resuelto por la
decisión de prerequisitos técnicos. El resumen consolidado fue confirmado
explícitamente por Carlos como correcto ("Looks correct") sin solicitar
cambios.
