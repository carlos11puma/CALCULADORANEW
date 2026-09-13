# Deployment Pipeline — Preguntas de Clarificación

## Sources

- [upstream:ci-config] `construction/ci-pipeline/ci-config.md`
- [upstream:quality-gates] `construction/ci-pipeline/quality-gates.md`
- [upstream:infrastructure-specification] `construction/infrastructure-design/infrastructure-specification.md`
- [upstream:cicd-pipeline] `construction/infrastructure-design/cicd-pipeline.md`
- [upstream:reliability-design] `construction/nfr-design/reliability-design.md` (secuencia de despliegue de 6 pasos, smoke test, rollback — ya diseñados)
- [contexto: archivos reales del repo] `packages/mobile-app/eas.json`, `packages/backend-api/render.yaml`

## Q1 — `eas.json` apunta a dominios placeholder que nunca van a existir

`packages/mobile-app/eas.json` declara `API_BASE_URL` con tres dominios internos inventados
(`api-dev...internal`, `api-staging...internal`, `api...internal`) que no corresponden a ninguna
URL real de Render — son placeholders de Construction (`260908`), donde no existía backend
desplegado todavía. Una vez que Environment Provisioning cree `backend-api-staging` y
`backend-api-production` en Render, cada uno tendrá su propia URL pública real
(`https://<nombre-del-servicio>.onrender.com`, salvo que Carlos configure un dominio propio).

Si `eas.json` no se actualiza con las URLs reales antes de un build/publish de EAS, cada perfil
(`preview`, `production`) apunta la app móvil a un dominio que no resuelve — la app compilaría
pero ninguna llamada a la API funcionaría, incluyendo el propio smoke test de `reliability-design.md`.

**¿Cuándo y cómo se actualiza `eas.json` con las URLs reales de Render?**

A. Este intent deja documentado en esta etapa que `eas.json` se edita en Environment Provisioning
   (la etapa siguiente, que es cuando Render asigna las URLs reales por primera vez), como parte del
   mismo paquete de configuración que editar `render.yaml` y crear los GitHub Environments — no se
   edita ahora porque las URLs todavía no existen.
B. Editar `eas.json` ahora mismo con URLs de marcador de posición más realistas, a confirmar después.
C. Otra estrategia (especificar).

[Answer]: A. Este intent deja documentado en esta etapa que `eas.json` se edita en Environment Provisioning (la etapa siguiente, que es cuando Render asigna las URLs reales por primera vez), como parte del mismo paquete de configuración que editar `render.yaml` y crear los GitHub Environments — no se edita ahora porque las URLs todavía no existen.

## Assumptions & Open Questions

- No aplica ninguna estrategia blue/green ni canary — cada servicio de Render (`backend-api-staging`,
  `backend-api-production`) es una única instancia free tier sin balanceo entre versiones; un
  despliegue reemplaza directamente al anterior (ya afirmado implícitamente por el plan `free` en
  `infrastructure-specification.md`).
- No hay sistema de feature flags (LaunchDarkly, CloudWatch Evidently, AppConfig) ni se introduce uno
  en este intent — fuera de alcance para una app interna de ~26 vendedores con presupuesto free tier
  (`project.md` § Mandated: priorizar capas gratuitas).
- La matriz de promoción de ambientes es de dos pasos únicamente: `staging` → `production` — no existe
  un ambiente `development` desplegado (el perfil `development` de `eas.json` es solo para builds
  locales de desarrollo con Expo Dev Client, nunca se publica a un canal ni se despliega a Render).
- La secuencia de despliegue de 6 pasos, el caso de prueba fijo del smoke test, y los pasos de
  rollback manual ya están completamente diseñados en `nfr-design/reliability-design.md` — esta etapa
  los formaliza en `deployment-strategy.md`/`rollback-runbook.md` sin rediseñarlos.

**Confirmación de asunciones:**

A. Accept assumptions
B. Convert to follow-up questions

[Answer]: A. Accept assumptions

## Consolidated Summary Confirmation

Resumen de lo que esta etapa formaliza (sin agregar decisiones de arquitectura nuevas más allá de Q1):

- **CD pipeline**: reafirma que no hay un pipeline de CD separado del de CI — el mismo push a `main`
  que dispara CI también dispara el despliegue (auto-deploy de Render para staging, publish de EAS
  para `preview`), consistente con `org.md` § Deployment.
- **Estrategia de despliegue**: sin blue/green ni canary; asimetría staging-automático/producción-manual
  ya decidida en `cicd-pipeline.md`; secuencia de 6 pasos y smoke test de `reliability-design.md`
  formalizados aquí como el runbook operativo que Carlos ejecuta a mano.
- **Matriz de promoción**: `staging` → `production` únicamente, sin ambiente `development` desplegado.
- **Feature flags**: no aplica — no hay sistema de flags en este proyecto.
- **Rollback**: Redeploy de Render / `eas update:republish`, manual, ya diseñado — formalizado aquí
  como runbook paso a paso con puntos de contacto.
- **Hallazgo nuevo (Q1)**: `eas.json` tiene URLs placeholder que deben reemplazarse por las URLs reales
  de Render — el reemplazo se documenta aquí como acción concreta para Environment Provisioning, no
  se ejecuta en esta etapa.

**¿Es correcto este resumen?**

[Answer]: Looks correct
