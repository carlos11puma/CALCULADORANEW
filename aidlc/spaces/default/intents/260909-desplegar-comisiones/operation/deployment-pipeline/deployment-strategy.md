# Deployment Pipeline — Deployment Strategy

## Sources

- [upstream:reliability-design] `construction/nfr-design/reliability-design.md` (secuencia de 6 pasos, smoke test, rollback — diseño original)
- [upstream:cicd-pipeline] `construction/infrastructure-design/cicd-pipeline.md`
- [upstream:cd-config] `cd-config.md` (esta etapa)
- [Q1] `deployment-pipeline-questions.md`

## Estrategia: reemplazo directo, sin blue/green ni canary

Cada servicio de Render (`backend-api-staging`, `backend-api-production`) corre en plan `free`, una
sola instancia — Render no ofrece balanceo entre versiones ni tráfico dividido en ese plan. Un
despliegue nuevo reemplaza directamente al anterior: hay una ventana breve de indisponibilidad durante
el build/arranque del contenedor nuevo (mitigada por el health check `@nestjs/terminus`, ya diseñado
en `260908`), no una transición gradual. Para una app interna de ~26 vendedores sin requisito de
disponibilidad 24/7, esta estrategia es proporcional — introducir blue/green requeriría al menos dos
instancias de pago simultáneas, en contra de `project.md` § Mandated (priorizar free tier).

Lo mismo aplica a `mobile-app`: EAS Update publica una nueva versión OTA al canal correspondiente;
los dispositivos la reciben en el siguiente arranque de la app, sin mecanismo de rollout progresivo
por porcentaje de usuarios (no disponible en el plan free de EAS).

## Feature flags: no aplica

No existe ningún sistema de feature flags en este proyecto (ni CloudWatch Evidently, ni AppConfig, ni
una librería propia) y este intent no introduce uno — el alcance es desplegar la aplicación ya
construida y probada en `260908`, no cambiar su arquitectura de release. Cualquier cambio futuro que
requiera despliegue gradual por flag queda fuera de este intent.

## Matriz de promoción de ambientes

```
Push a main
   │
   ├── toca packages/backend-api/** o packages/api-contract/**
   │      │
   │      ▼
   │   backend-api-staging (auto-deploy Render)
   │      │
   │      ▼
   │   Smoke test manual (Carlos) contra staging ──── falla ──▶ Rollback (rollback-runbook.md)
   │      │ pasa
   │      ▼
   │   "Manual Deploy" en Render (Carlos) ──▶ backend-api-production
   │      │
   │      ▼
   │   Smoke test manual (Carlos) contra producción ──── falla ──▶ Rollback (rollback-runbook.md)
   │      │ pasa
   │      ▼
   │   Despliegue confirmado exitoso (project.md § Mandated)
   │
   └── toca packages/mobile-app/** o packages/api-contract/**
          │
          ▼
       publish-preview (environment: staging, automático) ──▶ canal preview
          │
          ▼
       Aprobación de Carlos (required reviewer, Environment production)
          │
          ▼
       publish-production ──▶ canal production
```

No existe una etapa `development` desplegada en esta matriz — el perfil `development` de `eas.json`
es exclusivamente para builds locales de desarrollo, nunca se publica a un canal (`deployment-pipeline-questions.md` § Assumptions).

## Criterio de abort / traffic-shifting

No aplica un criterio de traffic-shifting (no hay tráfico dividido en esta estrategia de reemplazo
directo). El criterio de abort equivalente es el smoke test de `reliability-design.md`: si el login
o el cálculo de comisión del caso de prueba fijo fallan contra staging o contra producción, Carlos
no continúa la promoción al siguiente ambiente (o ejecuta el rollback si el fallo aparece en
producción) — ver `rollback-runbook.md`.

## Resumen

| Aspecto del template de esta etapa | Resolución |
|---|---|
| Estrategia de despliegue (blue/green, canary, rolling) | Ninguna — reemplazo directo de instancia única, free tier |
| Gates de promoción de ambiente | Smoke test manual (backend) + required reviewer de GitHub Environment (mobile), ya diseñados |
| Workflows de aprobación para producción | Ya existentes: "Manual Deploy" de Render + Environment `production` con required reviewer = Carlos |
| Procedimiento de rollback | Ver `rollback-runbook.md` — ya diseñado en `reliability-design.md`, formalizado aquí |
| Estrategia de feature flags | No aplica — no hay sistema de flags en este proyecto |
| Matriz de promoción de ambientes | `staging` → `production`, dos pasos, sin ambiente `development` desplegado |
