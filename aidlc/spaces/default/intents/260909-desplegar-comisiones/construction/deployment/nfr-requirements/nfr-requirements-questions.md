# NFR Requirements — Questions (260909-desplegar-comisiones)

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:team-practices] `inception/practices-discovery/team-practices.md`
- [upstream:infra-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/`

## Preguntas planteadas a Carlos Puma

La mayoría de las decisiones de este batch ya vienen resueltas por `requirements.md` y por el diseño de infraestructura afirmado en `260908` — estas son las pocas cosas genuinamente sin fijar todavía.

### Q1 — ¿Cuánto tiempo máximo debe esperar el smoke test post-deploy (login + venta de prueba) antes de considerarse fallido y disparar rollback + notificación?

A. 1 minuto — si no responde rápido, algo está mal
B. 2 minutos — da margen razonable al cold start del free tier de Render sin alargar demasiado el pipeline
C. 5 minutos — margen amplio para no generar falsos rollbacks por lentitud temporal
D. Sin timeout fijo — Carlos lo ejecuta manualmente y decide cuándo darlo por fallido, sin límite automático
X. Other (please specify)

**[Answer]: B. 2 minutos** — margen razonable para el cold start del free tier de Render sin alargar demasiado el pipeline.

### Q2 — Para la notificación de falla del pipeline (FR5.1), ¿basta con las notificaciones nativas de Render (deploy fallido) y de GitHub Actions (build/test fallido) por separado, o prefieres un único correo consolidado?

A. Notificaciones nativas separadas de cada plataforma (Render para deploy, GitHub Actions para build/test) — sin configuración adicional, ya incluidas gratis
B. Un único correo consolidado que junte cualquier tipo de falla — requeriría un paso adicional en el workflow para enviarlo (p. ej. una acción de GitHub que envíe el correo)
X. Other (please specify)

**[Answer]: A. Notificaciones nativas separadas** — de Render (deploy) y GitHub Actions (build/test), sin configuración adicional.

### Q3 — ¿Es aceptable que la primera venta de prueba del día tarde más de 2 segundos por el cold start del free tier de Render (servicio "dormido" tras inactividad), o esto debería tratarse como un problema a resolver?

A. Aceptable — es una característica conocida y esperada del free tier, no requiere mitigación
B. No aceptable — evaluar una mitigación (p. ej. un ping periódico para mantener el servicio despierto), aunque implique un ligero desvío del uso estrictamente gratuito
X. Other (please specify)

**[Answer]: A. Aceptable** — característica conocida del free tier, no requiere mitigación.

### Q4 — ¿Debe la app limitar los intentos fallidos de login (protección contra fuerza bruta) desde este primer despliegue, o puede quedar para después?

A. Sí, desde ahora — bloquear temporalmente después de varios intentos fallidos, dado que maneja datos de comisión/salario
B. Puede esperar — se agrega en una siguiente ronda, no es urgente para el primer despliegue con datos reales
X. Other (please specify)

**[Answer]: A. Sí, desde ahora** — bloqueo temporal tras varios intentos fallidos, dado que maneja datos de comisión/salario.

## Assumptions & Open Questions

- [assumption] No se define un SLA de disponibilidad numérico para este primer despliegue (consistente con NFR5, sin fecha límite fija, y con la ausencia de SLI/SLO formales ya afirmada en `monitoring-design.md` de `260908`).
- [assumption] No se ejecutan pruebas de carga en este intent — exclusión de alcance ya aprobada por Carlos en `requirements.md` § Fuera de alcance.
- [assumption] Las migraciones de Prisma para este primer despliegue deben ser aditivas/retrocompatibles, para que un rollback de código nunca deje el servicio corriendo contra un esquema incompatible (hereda el hallazgo R-02, ya documentado y no bloqueante, de `cicd-pipeline.md` de `260908`).

A. Accept assumptions
B. Convert to follow-up questions

**[Answer]: A. Accept assumptions**

## Consolidated Summary Confirmation

- Timeout del smoke test post-deploy: 2 minutos.
- Notificaciones de falla: avisos nativos separados de Render y GitHub Actions.
- Cold start del free tier de Render en la primera venta del día: aceptable, sin mitigación.
- Protección contra fuerza bruta en login: sí, desde este primer despliegue.
- Se aceptan las suposiciones (sin SLA numérico, sin pruebas de carga, migraciones aditivas).

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

