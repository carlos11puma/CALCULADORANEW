**Collaborator:** aidlc-devsecops-agent

## Contribution

Revisé `security-requirements.md` (NFR-D4 a NFR-D7), `performance-requirements.md`, `reliability-requirements.md` y `observability-requirements.md` contra `team-practices.md` § Deployment (puntos 1-5) y `project.md` § Forbidden/Mandated. El borrador opera fielmente lo ya decidido por Carlos: separación de secretos por Environment, titularidad exclusiva de Carlos sobre infraestructura de producción, RBAC en Neon (rol mínimo, nunca superusuario), y scrubbing de logs como condición de éxito del smoke test. No encontré contradicciones con Forbidden/Mandated.

Detecto tres vacíos que deben cerrarse antes de la aprobación de este documento:

1. **Ningún NFR cubre HTTPS/TLS en tránsito.** Render y Neon lo imponen por defecto, pero eso no está declarado como requisito verificable — debe añadirse un NFR-D8 explícito ("toda comunicación cliente↔`backend-api-production`↔Neon `main` viaja cifrada en tránsito; el smoke test confirma que la URL pública de Render es `https://` y que el `DATABASE_URL` de Neon usa `sslmode=require`").
2. **No hay gate de seguridad en CI que bloquee el despliegue si persisten las vulnerabilidades críticas/altas** cerradas en `team-practices.md` §1 (`tar`, `lodash`, etc.). El Mandated de `project.md` exige resolverlas "antes de cualquier... despliegue real", pero `security-requirements.md` no lo traduce en un requisito de pipeline verificable (p. ej. `dependency-audit.yml` en rojo bloquea el merge/deploy a `production`). Recomiendo NFR-D9.
3. **Falta protección básica contra fuerza bruta en `/api/v1/auth/login`** ahora que hay datos reales de ~26 vendedores expuestos en internet — no visto en NFR-D4-D7 ni en `requirements.md` según lo citado. Si ya fue descartado explícitamente por alcance, lo acepto, pero debe quedar documentado como "fuera de alcance" (igual que se hizo con dashboards/alertas en `observability-requirements.md`), no omitido en silencio.

## Positions

AGREE: NFR-D4 (separación de secretos por Environment, `sync:false` en Render) — operacionaliza correctamente NFR-D3 de `team-practices.md` y el Forbidden de no compartir secretos entre ambientes.
AGREE: NFR-D5 (titularidad única de Carlos sobre secretos de producción y required reviewer) — consistente con Mandated de `project.md`.
AGREE: NFR-D6 (RBAC de infraestructura en Neon/Render, rol Postgres mínimo, nunca superusuario) — cumple el Forbidden de usar el rol owner de Neon en runtime.
AGREE: NFR-D7 (verificación manual de logs sin datos sensibles/credenciales, integrada al smoke test, per NFR-D10.3) — cierra correctamente FR4.4 como parte obligatoria del despliegue, no opcional.
OBJECT: Falta un NFR-D8 de cifrado en tránsito (HTTPS/`sslmode=require`) explícito y verificable en el smoke test.
OBJECT: Falta un NFR-D9 que convierta el Mandated de dependencias vulnerables en un gate de pipeline bloqueante, no solo en una tarea previa narrada en `team-practices.md`.
OBJECT: Falta declarar explícitamente el alcance (dentro/fuera) de protección contra fuerza bruta en el login de producción.
