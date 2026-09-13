**Collaborator:** aidlc-devsecops-agent

## Contribution

### 1. DEP-3 — Gestión de secretos hacia GitHub Actions (Render/Neon/EAS)

El draft plantea correctamente la pregunta pero no fija una recomendación. Mi
posición como control de seguridad para esta primera puesta en producción
real:

- **Repository secrets**: solo para valores no sensibles o compartidos que no
  otorgan acceso a datos de comisión/salario ni a despliegue a producción
  (por ejemplo, tokens de solo-lectura de servicios de terceros sin datos
  sensibles, si los hubiera). En este proyecto, prácticamente ningún secreto
  real califica para este nivel.
- **Environment secrets, obligatorio para todo lo que importa**:
  - `EXPO_TOKEN` de producción, `DATABASE_URL` de Neon `main` y cualquier
    credencial de despliegue de `backend-api-production` deben vivir
    **exclusivamente** en el GitHub Environment `production`, con el
    `required reviewer` (Carlos) como control de acceso — esto ya es
    coherente con el diseño de `cicd-pipeline.md`, pero el draft no lo cierra
    explícitamente como mandato.
  - Las contrapartes de `staging` (Neon rama `staging`, credenciales de
    `backend-api-staging`, canal/perfil `preview` de EAS) van en el
    Environment `staging`, separado de `production` — esto evita que un
    workflow que solo debería tocar staging pueda leer un secreto de
    producción por accidente de scoping.
  - **Nunca** un mismo `EXPO_TOKEN` u otra credencial debe cubrir tanto
    `staging` como `production`: un token de Expo con alcance de
    "owner"/organización entero puede publicar a cualquier canal, anulando
    el aislamiento del Environment. Si Expo/EAS no permite emitir tokens
    scoped por canal, la mitigación es un token por Environment con rotación
    documentada, no compartir el mismo token.
- **Quién tiene acceso**: dado que ninguna cuenta real existe todavía
  (DEP-1/DEP-2), recomiendo que sea quien resulte titular de las cuentas
  (Carlos o cuenta de organización TIOSA, según se resuelva DEP-1) quien
  genere y cargue los secretos de `production` directamente en GitHub, sin
  que pasen por chat, código, o un canal no auditado — y que el desarrollador
  solo tenga acceso a los secretos de `staging`.

### 2. Vulnerabilidades de dependencias conocidas (T-10, `quality-gates.md`)

Encuentro un salto no resuelto entre lo que Construction ya decidió y lo que
implica este intent:

- `build-and-test-summary.md` de `260908` es explícito: T-10 fue aceptado
  como riesgo conocido **"por ahora"**, con la condición escrita
  "**queda como acción pendiente antes de cualquier despliegue de
  producción real**" — y el propio documento aclara que "deployment-ready:
  no sin antes resolver T-10".
- Este intent `260909` **es** ese despliegue de producción real. El draft no
  menciona T-10 en absoluto dentro de `## Deployment` ni en DEP-1..DEP-5, a
  pesar de que la condición que Construction fijó para permitirlo ya se
  cumple aquí.
- Los hallazgos concretos (`backend-api`: 1 crítica `tar` DoS + 5 altas
  incluyendo `lodash` code injection; `mobile-app`: 1 crítica + 11 altas) son
  vulnerabilidades de severidad crítica/alta en dependencias de producción,
  no de dev. `dependency-audit.yml` ya las reporta mediante
  `npm audit --omit=dev --audit-level=high`, pero corre con
  `continue-on-error: true` — es decir, **no bloquea nada hoy**.
- Postura: no exijo resolver las 16+ vulnerabilidades antes de este
  despliegue (romper 336 pruebas para perseguir un `npm audit fix --force`
  sin red de seguridad de producción sería un riesgo mayor que el que
  mitiga). Pero sí debe agregarse una tarea explícita a este intent —o
  como mínimo una decisión humana registrada— para: (a) triage manual de si
  la vulnerabilidad crítica de `tar` en `backend-api` es explotable en el
  patrón de uso real (¿se procesan archivos subidos por usuario?), y (b) un
  compromiso de fecha para actualizar antes de que el volumen real de datos
  de comisión/salario de los ~26 vendedores esté en producción por un
  período prolongado. Esto debería quedar como DEP-6 o como nota explícita
  en `## Deployment`, no solo heredado tácitamente de `260908`.

### 3. RBAC de datos de comisión/salario en infraestructura real

`project.md` § Mandated ya fija: "proteger los datos de comisión/salario con
control de acceso por rol (supervisor vs. vendedor) y credenciales
cifradas". Esto fue afirmado en el nivel de diseño de aplicación en `260908`
(autenticación JWT, roles en NestJS). Para este intent de infraestructura,
señalo controles adicionales que no aparecen en el draft y que sí son
responsabilidad de esta puesta en producción real:

- **Neon**: la rama `main` (producción) debe tener su propia
  `DATABASE_URL`/rol de Postgres distinto del de `staging`, con permisos
  mínimos necesarios para el backend (no rol de superusuario/owner del
  proyecto Neon usado en runtime). El acceso a la consola de Neon
  (capacidad de leer datos crudos de comisión/salario vía SQL directo) debe
  quedar limitado a quien sea titular de la cuenta (DEP-1) — es un control de
  acceso humano, no solo de aplicación.
  a la infraestructura no solo dentro de la app.
- **Render**: variables de entorno del servicio `backend-api-production`
  (que incluyen el `DATABASE_URL` de producción y el JWT secret) son visibles
  a quien tenga acceso de "Member"/"Admin" al servicio de Render — esto debe
  scopearse al mismo titular/es que DEP-1 resuelva, no a todo el equipo.
- **Logs**: verificar que ningún log de aplicación (Render logs, EAS
  crash/telemetry) registre en texto plano montos de comisión/salario por
  vendedor individual o el JWT/`DATABASE_URL`. No está cubierto ni en el
  draft ni en `cicd-pipeline.md` de `260908` — lo marco como gap a confirmar
  en DEP-5 (smoke test) o como ítem separado de esta etapa.
- Esto es una extensión operativa del mandato ya afirmado, no una nueva
  decisión de arquitectura — coherente con `phases/operation.md` §
  Infrastructure Safety ("Infrastructure changes require security review").

## Positions

AGREE: DEP-1 (titularidad de cuentas) es correcto y necesario — sin
titularidad clara no se puede scopear ningún secreto ni RBAC de
infraestructura de forma responsable; debe resolverse antes o junto con
DEP-3.

AGREE: DEP-3 identifica correctamente la brecha repository-vs-environment
secrets; mi contribución arriba fija una recomendación concreta
(environment secrets obligatorios para todo lo sensible de `production`,
sin compartir `EXPO_TOKEN` entre entornos) que el draft deja abierta sin
inclinarse.

AGREE: DEP-5 (smoke test post-despliegue) es un control de seguridad
razonable además de funcional — pido que incluya explícitamente una
verificación de que el RBAC supervisor/vendedor funciona contra
infraestructura real (no solo que el endpoint responde 200) antes de firmar
la puesta en producción.

OBJECT: el draft no menciona T-10 (vulnerabilidades críticas/altas de
dependencias de producción, `quality-gates.md`) en ningún punto de
`## Deployment` pese a que `build-and-test-summary.md` de `260908` condicionó
explícitamente "deployment-ready" a resolver T-10 antes de "cualquier
despliegue de producción real" — que es exactamente lo que cubre este
intent. Pido agregar un ítem explícito (DEP-6 o nota en DEP-4/DEP-5) que
capture el triage de la vulnerabilidad crítica de `tar` en `backend-api` y
un compromiso de fecha de actualización, en vez de dejarlo heredado
tácitamente sin mención.

OBJECT: el draft no cubre RBAC/control de acceso a nivel de infraestructura
real (consola Neon, variables de entorno de Render, logs) — solo hereda el
mandato de `project.md` a nivel de aplicación. Dado que esta es la primera
vez que datos reales de comisión/salario de ~26 vendedores existirán en
infraestructura real, pido que `## Deployment` incluya al menos una
referencia a quién tiene acceso humano a esa infraestructura y bajo qué
criterio, no solo al RBAC dentro de la app.
