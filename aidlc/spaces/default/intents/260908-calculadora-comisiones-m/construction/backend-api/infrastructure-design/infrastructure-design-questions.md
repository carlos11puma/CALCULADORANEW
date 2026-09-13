# Infrastructure Design — backend-api — Questions

## Sources

- [upstream:performance-design] `construction/backend-api/nfr-design/performance-design.md`
- [upstream:security-design] `construction/backend-api/nfr-design/security-design.md`
- [upstream:scalability-design] `construction/backend-api/nfr-design/scalability-design.md`
- [upstream:reliability-design] `construction/backend-api/nfr-design/reliability-design.md`
- [upstream:observability-design] `construction/backend-api/nfr-design/observability-design.md`
- [upstream:logical-components] `construction/backend-api/nfr-design/logical-components.md`
- [upstream:components] `inception/domain-design/components.md`
- [upstream:team-rules] `aidlc/spaces/default/memory/team.md`

`nfr-design` ya fijó el diseño (proceso único NestJS, sin caché, sin warm-up activo, cron in-process, logging a stdout) — esta etapa fija dónde corre concretamente ese proceso, y cómo el pipeline de CI/CD lo despliega. `team.md` § Deployment ya mandató "despliegue automático a un ambiente de pruebas en cada integración a `main`; aprobación manual del supervisor requerida antes de desplegar a producción" — estas preguntas concretan ese mandato para esta unidad.

## Q1. NFR6 (priorizar capas gratuitas) + `reliability-design.md` (cold start aceptado, proceso continuo esperado para que `@nestjs/schedule` funcione). ¿Qué plataforma de hosting concreta se elige?

A. Render (free tier de "Web Service") — soporta un proceso Node de larga duración (necesario para el cron in-process de `@nestjs/schedule`, a diferencia de una función serverless-on-demand que no mantendría el proceso vivo entre invocaciones), despliegue automático desde GitHub, variables de entorno nativas, y health check configurable — el cold start ya aceptado (`reliability-design.md` NFR6.2) es exactamente el comportamiento conocido de su free tier tras 15 minutos de inactividad
B. Railway (free tier con créditos mensuales limitados) — mismo modelo de proceso de larga duración, pero el free tier se agota por consumo de créditos en vez de por inactividad, lo que es menos predecible para un uso continuo de un mes completo
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: C → A. No estoy seguro; se adopta la opción propuesta: Render (free tier de Web Service).

## Q2. `team.md` ya mandató despliegue automático a un ambiente de pruebas en cada merge a `main`, con aprobación manual antes de producción. ¿Cuántos ambientes físicos se provisionan para esta unidad?

A. Dos servicios Render separados (`backend-api-staging`, `backend-api-production`), cada uno con su propia base de datos Neon (rama de base de datos `staging`/`main`, usando el branching nativo de Neon) — aísla completamente los datos de prueba de los datos reales de comisión de los vendedores, evitando que una prueba en staging corrompa datos de producción
B. Un solo servicio Render con una variable de entorno que cambia de comportamiento — más simple, pero mezclaría datos de prueba con datos reales en la misma base de datos, contradiciendo el mandato de `project.md` de proteger los datos de comisión/salario
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: C → A. No estoy seguro; se adopta la opción propuesta: dos servicios Render separados, cada uno con su propia rama de base de datos Neon (branching nativo).

## Q3. ¿Qué enfoque de Infraestructura como Código (IaC) se usa para definir estos recursos?

A. `render.yaml` (Render Blueprint) comiteado en el repositorio — define ambos servicios (staging/producción) y sus variables de entorno no sensibles como código versionado, reproducible y revisable en pull request, en vez de configuración manual en el dashboard de Render que nadie más que Carlos podría reconstruir si se perdiera
B. Configuración manual vía el dashboard de Render, sin código — más rápido de configurar una vez, pero no queda versionado ni es reproducible si hubiera que recrear el servicio
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. render.yaml (Render Blueprint) comiteado en el repositorio.

## Q4. ¿Qué plataforma de CI/CD ejecuta build, lint y pruebas antes de cada despliegue (mandato de `org.md`/`team.md`: CI antes de merge, piso de cobertura 80%)?

A. GitHub Actions — el repositorio del monorepo ya vive en GitHub (asumido, dado que Render se integra nativamente con despliegue automático desde GitHub); un workflow corre `npm ci`, lint, `npm test --workspace=packages/backend-api` con el piso de cobertura, y solo si todo pasa permite que el push a `main` dispare el despliegue automático a staging que Render ya hace por su cuenta
B. Un pipeline de CI separado (ej. CircleCI, Jenkins) desconectado de GitHub — añade una integración adicional sin necesidad, dado que GitHub Actions ya cubre el flujo completo sin costo para un repositorio de este tamaño
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. GitHub Actions — build, lint, pruebas con piso de cobertura antes de permitir el despliegue.

## Q5. Gestión de secretos en el pipeline de CI/CD (la cadena de conexión de Neon, cualquier secreto de configuración) — ¿cómo fluyen desde CI/CD hasta el proceso en ejecución?

A. GitHub Actions Secrets (a nivel de repositorio, nunca en el código ni en `render.yaml`) para lo que CI/CD necesita en tiempo de build/test (ej. una base de datos Neon efímera de pruebas, si las pruebas de integración la requieren); las variables de entorno del proceso en ejecución (`DATABASE_URL` de staging/producción) se configuran directamente en el dashboard de Render como "environment variables" marcadas secretas (`sync: false` en `render.yaml`, para que el valor nunca quede en el archivo versionado) — Render las inyecta al proceso sin que pasen por los logs de CI/CD
B. Las mismas variables de entorno de producción se definen también como GitHub Actions Secrets y se pasan a Render en cada despliegue vía la CLI de Render — duplica dónde vive el secreto (dos sistemas a mantener sincronizados) sin necesidad, dado que Render ya despliega automáticamente desde el push sin que CI/CD necesite pasarle nada
C. No estoy seguro, propón una opción razonable
X. Other (please specify)

[Answer]: A. GitHub Actions Secrets para CI/CD; variables de entorno secretas directamente en el dashboard de Render (sync: false en render.yaml).

## Consolidated Summary Confirmation

- Hosting: Render (free tier de Web Service), proceso de larga duración
- Ambientes: dos servicios Render separados (staging/producción), cada uno con su propia rama de base de datos Neon
- IaC: `render.yaml` (Render Blueprint) comiteado en el repositorio
- CI/CD: GitHub Actions — build, lint, pruebas con piso de cobertura 80% antes de permitir el despliegue
- Secretos: GitHub Actions Secrets para CI/CD; variables de entorno secretas del proceso en ejecución directamente en el dashboard de Render (`sync: false`)

Does this all look correct before I generate the Infrastructure Design artifacts for backend-api?

- Looks correct
- Request changes

[Answer]: Looks correct
