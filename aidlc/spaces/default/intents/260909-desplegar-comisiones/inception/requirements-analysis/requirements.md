# Requisitos — Despliegue a Producción (260909-desplegar-comisiones)

## Sources

- [desc] `project-description.json` (intent 260909)
- [upstream:team-practices] `inception/practices-discovery/team-practices.md`
- [Q1-Q4] `requirements-analysis-questions.md`

## Análisis de intención

Carlos ya construyó y verificó por completo la calculadora de comisiones
(intent `260908-calculadora-comisiones-m`): 336/336 pruebas pasando, 3
unidades (api-contract, backend-api, mobile-app), diseño de infraestructura
ya especificado (Render + Neon + EAS). El objetivo de este intent no es
construir nada nuevo — es llevar ese código ya probado a infraestructura
real, por primera vez, de forma que Carlos termine con una app instalable en
su teléfono y datos reales de sus ~26 rutas cargados.

## Requisitos funcionales

### FR1 — Prerequisitos técnicos resueltos antes de cualquier despliegue real

- **FR1.1**: El cliente Prisma real debe regenerarse (`npx prisma generate`
  con salida de red real) y reemplazar el stub manual, con `npm run build`
  y la suite de integración de `backend-api` pasando contra este cliente
  real y una Neon real de staging.
- **FR1.2**: Las dependencias de producción con vulnerabilidades críticas/altas
  ya identificadas (T-10 de `260908`) deben actualizarse, con la suite de
  336 pruebas verde después de la actualización.

### FR2 — Aprovisionamiento de infraestructura real

- **FR2.1**: Cuenta de Neon creada a nombre de Carlos Puma, con dos ramas
  (`staging`, `main`) siguiendo el diseño ya afirmado.
- **FR2.2**: Cuenta de Render creada a nombre de Carlos Puma, con dos
  servicios (`backend-api-staging`, `backend-api-production`).
- **FR2.3**: Cuenta de Expo/EAS creada a nombre de Carlos Puma, con los
  perfiles `preview` y `production` ya definidos en `cicd-pipeline.md` de
  `260908`.
- **FR2.4**: GitHub Environments `staging` y `production` configurados con
  secretos propios y separados, con `production` protegido por el required
  reviewer (Carlos), tal como se afirmó en `team-practices.md`.

### FR3 — Migración de datos iniciales

- **FR3.1**: El roster de vendedores por ruta y canal (preventa/autoventa)
  de la calculadora actual debe cargarse en la base de datos de producción
  (Neon `main`) antes del primer uso real por parte de los vendedores.
- **FR3.2**: Los presupuestos y tramos de comisión variable actualmente
  vigentes deben cargarse junto con el roster, en el mismo paso — no quedan
  para carga manual posterior. [Q1]
- **FR3.3**: El mecanismo de carga es el panel de administración ya
  construido en `260908` (pantallas A2-A4: roster, presupuestos, tramos),
  operado por Carlos con su PIN de administrador — no se construye un script
  de migración nuevo ni se hace carga SQL directa, ya que el panel existente
  cubre exactamente estos tres tipos de dato.

### FR4 — Ejecución del primer despliegue real

- **FR4.1**: El pipeline de CI/CD ya existente (4 workflows de GitHub
  Actions de `260908`) debe ejecutar el despliegue a `staging` en el primer
  push a `main` de este intent, y a `production` solo tras la aprobación
  manual de Carlos vía el GitHub Environment.
- **FR4.2**: El primer despliegue a producción se considera exitoso solo si
  se verifican ambas condiciones contra la infraestructura real: login
  funcional y una venta de prueba que calcula la comisión correctamente
  (smoke test ya definido en `team-practices.md`).
- **FR4.3**: Si el smoke test falla, el sistema debe permitir una reversión
  manual al build anterior (Redeploy en Render / `eas update:republish` en
  EAS) y notificar a Carlos.
- **FR4.4**: Como parte del mismo smoke test de FR4.2, verificar que ningún
  log de aplicación (Render logs, EAS crash/telemetry) exponga en texto
  plano montos de comisión/salario por vendedor ni credenciales (`JWT`,
  `DATABASE_URL`) — heredado de `team-practices.md` § Deployment, punto 5.
  El primer despliegue no se da por exitoso si esta verificación no se hizo.

### FR5 — Notificación de fallas de despliegue

- **FR5.1**: Ante cualquier falla del pipeline automático (build, test, o
  smoke test post-deploy), Carlos debe recibir un aviso por correo
  electrónico a la cuenta usada para Neon/Render. [Q2]

## Requisitos no funcionales

- **NFR1 — Acceso**: Solo Carlos Puma tiene visibilidad y acceso a la
  infraestructura real (consola de Neon, variables de entorno de Render,
  builds/logs de EAS) durante este primer despliegue; nadie más se agrega
  por ahora. [Q4] Esto resuelve, para este despliegue concreto, la mención
  condicional a "el desarrollador" en `team-practices.md` § Deployment › 3:
  ese rol describe cómo se otorgaría acceso a secretos de `staging` *si* en
  el futuro Carlos delega el aprovisionamiento técnico a alguien más — hoy
  ese rol no existe, por lo que no hay ningún acceso de terceros que
  configurar en este primer despliegue.
- **NFR2 — Seguridad de credenciales**: Ningún secreto de producción vive a
  nivel de repositorio ni se comparte entre ambientes (heredado de
  `team-practices.md` § Deployment, punto 3).
- **NFR3 — Disponibilidad de datos**: Los datos de comisión/salario en Neon
  `main` deben quedar protegidos con control de acceso por rol a nivel de
  aplicación (ya afirmado en `project.md`) y con acceso humano limitado al
  titular de la cuenta a nivel de infraestructura (ya afirmado en
  `team-practices.md` § Deployment, punto 5).
- **NFR4 — Costo**: Toda la infraestructura debe mantenerse dentro de las
  capas gratuitas de Neon, Render y Expo/EAS (heredado de `project.md` §
  Mandated), consistente con el presupuesto mínimo/gratuito confirmado en
  Feasibility de `260908`.
- **NFR5 — Sin fecha límite**: No existe una fecha objetivo fija para
  completar el despliegue; prima la corrección sobre la velocidad. [Q3]

## Restricciones

- Free tier de Neon, Render y Expo/EAS (heredado, no negociable en esta
  primera puesta en producción).
- Carlos no tiene experiencia técnica previa en Neon/Render/EAS — toda
  instrucción de aprovisionamiento debe ser paso a paso, sin asumir
  conocimiento previo de estas plataformas.
- El entorno donde se ejecuta este workflow no tiene salida de red real
  hacia `binaries.prisma.sh` ni hacia las consolas de Neon/Render/Expo — el
  aprovisionamiento real (FR2) y la ejecución real del despliegue (FR4) las
  ejecuta Carlos fuera de este entorno, siguiendo las instrucciones que este
  intent produce.

## Supuestos

- Se asume que Carlos ya cuenta con un correo electrónico personal o de
  TIOSA que puede usar para registrar las tres cuentas (Neon/Render/Expo).
- Se asume que el archivo/hoja de cálculo actual con el roster, presupuestos
  y tramos vigentes está disponible para que Carlos lo transcriba o exporte
  al cargar los datos iniciales (FR3).

## Fuera de alcance

- Observabilidad avanzada (dashboards, alertas más allá del correo de
  fallo), respuesta formal a incidentes, y pruebas de carga — explícitamente
  excluidos del alcance `infra` aprobado por Carlos.
- Cualquier funcionalidad nueva de la app (ya cerrado en Construction,
  `260908`) — este intent no modifica código de producto, solo lo despliega.

## Preguntas abiertas

Ninguna — las cuatro preguntas de la entrevista (Q1-Q4) quedaron resueltas
y confirmadas por Carlos.

## Review

**Verdict:** NOT-READY
**Reviewer:** aidlc-product-lead-agent
**Date:** 2026-09-09T03:33:53Z
**Iteration:** 1
**Request Challenge:** review:3e255e4ada1ef19e0fc3c7f430fe1493

**Nota post-revisión:** los tres hallazgos (R-01, R-02, R-03) se resolvieron
con ediciones directas al documento inmediatamente después de esta revisión
(NFR1 aclara el rol condicional de "desarrollador"; FR4.4 agrega la
verificación de logs; FR3.3 especifica el panel de administración como
mecanismo de carga) — ver columna Status de cada hallazgo y el resumen de
aprobación presentado al humano. Al ser un stage de una sola pasada de
revisión (advisory), estas correcciones no se someten a una segunda revisión
formal.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Critical | `requirements.md` > NFR1, vs. `team-practices.md` § Deployment › 3. Secretos en GitHub Actions | Contradicción no resuelta sobre quién tiene acceso durante el despliegue. NFR1 y la respuesta a Q4 afirman que **solo Carlos** tiene visibilidad/acceso a la infraestructura real ("nadie más se agrega por ahora"), pero `team-practices.md` § 3 sigue describiendo un rol de "el desarrollador" con acceso a los secretos de `staging` ("El desarrollador solo tiene acceso a los secretos de staging"). El documento de requisitos no aclara si ese rol de desarrollador existe en este despliegue o si la respuesta a Q4 lo anula. La regla de la fase de Inception exige no arrastrar contradicciones sin resolver. | Añadir una frase explícita en NFR1 (o en Restricciones) que resuelva la contradicción: o bien confirmar que no existe rol de desarrollador con acceso a secretos en este despliegue (y marcar como obsoleta esa línea de `team-practices.md`), o bien definir explícitamente el alcance de acceso de ese rol si sí participa. | Resolved |
| R-02 | Major | `requirements.md` > FR4.2, vs. `team-practices.md` § Deployment › 5. RBAC, tercer punto (Logs) | El smoke test de FR4.2 se define solo como "login funcional + venta de prueba que calcula la comisión correctamente". `team-practices.md` § 5 exige, además, verificar **como parte del mismo smoke test** que ningún log de aplicación (Render, EAS) exponga en texto plano montos de comisión/salario o credenciales (`JWT`, `DATABASE_URL`). Esa verificación no aparece en ningún FR/NFR de `requirements.md`, así que un implementador que siga solo este documento podría dar por exitoso el despliegue sin revisar logs. | Agregar a FR4.2 (o como FR4.4 nuevo) el criterio de verificación de logs sin datos sensibles ni credenciales en texto plano, citando `team-practices.md` § 5, para que quede como condición explícita y verificable del primer despliegue exitoso. | Resolved |
| R-03 | Minor | `requirements.md` > FR3.1/FR3.2 | No se especifica el mecanismo de carga de datos iniciales (¿script de migración, carga SQL directa, o entrada manual vía el panel de administración ya construido en `260908`?). El texto solo dice "debe cargarse", lo cual es ambiguo para quien ejecute la tarea. | Aclarar en FR3 el mecanismo esperado de carga (por ejemplo: "vía el panel de administración de `260908`" o "vía script de importación preparado por este intent"), de modo que sea verificable. | Resolved |

### Summary

El documento está bien fundamentado y trazable a `team-practices.md` y a las respuestas Q1-Q4 en la mayoría de sus puntos, pero arrastra sin resolver una contradicción real sobre quién tiene acceso a los secretos/infraestructura (Carlos únicamente vs. "el desarrollador" mencionado en las prácticas del equipo), y omite en el criterio de éxito del primer despliegue (FR4.2) la verificación de logs que las prácticas del equipo sí exigen. Al ser una revisión advisory, esto es una recomendación para que el humano decida en el gate, no un bloqueo automático.
