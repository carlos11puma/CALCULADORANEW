# NFR Requirements — Despliegue a Producción — Tech Stack Decisions

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` (FR2)
- [upstream:infra-design-backend-260908] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/infrastructure-specification.md`
- [upstream:infra-design-mobile-260908] `260908-calculadora-comisiones-m/construction/mobile-app/infrastructure-design/infrastructure-specification.md`
- [upstream:cicd-pipeline-260908] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/cicd-pipeline.md`

## No hay stack tecnológico nuevo en este intent

Este intent **no toma ninguna decisión de tecnología nueva**. Toda la selección de plataforma ya está cerrada en Construction de `260908`:

| Decisión | Ya fijada en (260908) | Este intent |
|---|---|---|
| Hosting de `backend-api` | Render (Web Service free tier), `render.yaml` Blueprint | Solo aprovisiona las cuentas/servicios ya diseñados (FR2.2) |
| Base de datos | Neon PostgreSQL free tier, dos ramas (`staging`/`main`) | Solo crea la cuenta y las ramas ya diseñadas (FR2.1) |
| Distribución móvil | Expo/EAS Build + Update, perfiles `preview`/`production` | Solo crea la cuenta y los perfiles ya diseñados (FR2.3) |
| CI/CD | GitHub Actions, 4 workflows, GitHub Environments `staging`/`production` | Solo configura los Environments ya diseñados (FR2.4) |

Ningún componente, framework, librería o proveedor de infraestructura se sustituye, se agrega, ni se reconsidera. El rol de este intent es **operacionalizar** ese diseño ya afirmado — crear las cuentas reales, cargar los secretos reales, y ejecutar el primer despliegue real — no rediseñarlo.

## Parámetros operativos genuinamente nuevos en este intent

Lo único que sí es nuevo aquí son valores operativos concretos que `260908` no necesitaba fijar porque no ejecutaba un despliegue real. Estos no son decisiones de tecnología — son parámetros de configuración del mismo stack ya elegido:

| Parámetro | Valor propuesto | Estado |
|---|---|---|
| Timeout del smoke test post-deploy (FR4.2) | **2 minutos** — margen razonable para el cold start del free tier de Render sin alargar demasiado el pipeline | [Q1] Decidido por Carlos — ver `performance-requirements.md` NFR-D1.2 |
| Umbral de reintentos del smoke test antes de considerarlo fallido | Sin reintento automático — un solo intento manual (ejecutado por Carlos siguiendo la guía paso a paso); si falla, se aplica el rollback de `reliability-requirements.md` NFR-D11 directamente | Decidido, no requiere pregunta — consistente con "no hay rollback automático" de `team-practices.md` §4 |
| Canal de notificación de fallo del pipeline (FR5.1) | Notificaciones nativas de Render + GitHub Actions por email, sin servicio propio ni correo consolidado | [Q2] Decidido por Carlos — ver `observability-requirements.md` NFR-D13.2 |
| Cold start del free tier de Render en la primera venta del día (NFR-D2) | Aceptado sin mitigación | [Q3] Decidido por Carlos — ver `performance-requirements.md` NFR-D2.2 |
| Protección contra fuerza bruta en login | Carlos la pidió en Q4, pero se identificó una contradicción de alcance real (requiere código nuevo de `backend-api`, y este intent `infra` no modifica código de producto). Carlos decidió diferirla a una ronda futura de Construction — ver `security-requirements.md` NFR-D16 | [Q4, revertido tras revisión de arquitectura] |

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| — | Render/Neon/EAS/GitHub Actions ya decididos en 260908, sin cambios | FR2.1-FR2.4 |
| — | Timeout de smoke test = 2 minutos, decidido | FR4.2 [Q1] |
| — | Sin reintento automático de smoke test | FR4.3, team-practices.md §4 |
| — | Mecanismo de notificación de falla confirmado como nativo de plataforma, sin correo consolidado | FR5.1 [Q2] |
| — | Cold start del free tier aceptado sin mitigación | NFR4 [Q3] |
| — | Protección contra fuerza bruta en login — diferida, fuera de alcance de 260909 | NFR3 [Q4, revertido tras revisión de arquitectura] |
