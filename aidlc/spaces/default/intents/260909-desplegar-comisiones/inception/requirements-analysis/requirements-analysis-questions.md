# Requirements Analysis — Questions (260909-desplegar-comisiones)

## Sources

- [desc] `project-description.json` (intent 260909)
- [upstream:team-practices] `inception/practices-discovery/team-practices.md`

## Preguntas planteadas a Carlos Puma

### Q1 — ¿Hay datos históricos de la calculadora actual (el archivo HTML) que deban migrarse a la base de datos nueva?

A. Sí — roster de vendedores, presupuestos y tramos actuales deben cargarse en Neon antes del primer uso real
B. No — se empieza con la base de datos vacía y cada supervisor/admin carga los datos desde el panel de administración
C. Parcial — solo el roster de vendedores por ruta, los presupuestos se cargan a mano después
X. Other (please specify)

**[Answer]: A. Sí** — roster de vendedores por ruta, presupuestos y tramos actuales deben cargarse en Neon antes del primer uso real.

### Q2 — ¿Cómo prefieres que te avise el sistema si el despliegue automático a producción falla?

A. Correo electrónico a tu cuenta de Neon/Render (el que uses para las cuentas)
B. Notificación dentro de GitHub (revisar manualmente el estado de las Actions)
C. Ambas
X. Other (please specify)

**[Answer]: A. Correo electrónico** — a la cuenta que uses para Neon/Render.

### Q3 — ¿Hay una fecha o evento objetivo para tener la app instalable en tu teléfono?

A. Sin fecha fija — se hace con calma, priorizando que quede bien hecho
B. Sí, hay una fecha objetivo (especifícala en "Other")
X. Other (please specify)

**[Answer]: A. Sin fecha fija** — se hace con calma, priorizando que quede bien hecho antes que rápido.

### Q4 — Además de ti, ¿alguien más necesita poder ver el estado del despliegue (logs de Render, panel de Neon, builds de EAS)?

A. Nadie más por ahora — solo tú
B. El desarrollador que te ayude con el aprovisionamiento técnico (acceso de solo lectura/staging, según lo ya afirmado)
X. Other (please specify)

**[Answer]: A. Nadie más por ahora** — solo Carlos tiene visibilidad, consistente con la titularidad de cuentas ya afirmada.

## Assumptions & Open Questions

- [assumption] Presupuesto: se mantiene el mandato ya afirmado de priorizar capas gratuitas (Neon/Render/EAS free tier) — no se vuelve a preguntar.
- [assumption] Los prerequisitos técnicos (cliente Prisma real, dependencias vulnerables) se resuelven como primer paso de este intent, ya afirmado en `team-practices.md`.

A. Accept assumptions
B. Convert to follow-up questions

**[Answer]: A. Accept assumptions**

## Consolidated Summary Confirmation

- Se migran a Neon el roster de vendedores por ruta, los presupuestos y los tramos actuales antes del primer uso real.
- Si el despliegue automático a producción falla, Carlos recibe un correo electrónico.
- No hay fecha límite fija; se prioriza que quede bien hecho.
- Por ahora solo Carlos tiene visibilidad del estado del despliegue (logs, panel de Neon, builds de EAS).
- Se aceptan las suposiciones: presupuesto en capas gratuitas y prerequisitos técnicos (Prisma real, dependencias) resueltos como primer paso.

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

