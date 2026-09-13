**Collaborator:** aidlc-compliance-agent

## Contribution

Revisé `security-requirements.md` y `reliability-requirements.md` contra el mandato de `project.md` § Mandated ("proteger los datos de comisión/salario con control de acceso por rol y credenciales cifradas") y contra `260908/ideation/feasibility/feasibility-assessment.md`, que clasifica estos datos como **sensibles pero sin marco regulatorio formal** (no aplica PCI-DSS/HIPAA/GDPR — no hay tarjetas de pago, salud, ni residentes UE).

**Cobertura adecuada**: NFR-D4 a NFR-D7 operacionalizan correctamente el mandato — separación de secretos por Environment, titularidad única de Carlos, RBAC de infraestructura (rol Postgres no-superusuario en Neon `main`, consola limitada a Carlos) y scrubbing de logs como condición de éxito del despliegue (NFR-D7.2/NFR-D10.3). El nivel de control es proporcional al perfil de riesgo (~26 vendedores, un solo administrador, sin obligación regulatoria externa) — no se sobre-ingenieriza con controles de un marco que no aplica.

**Vacío identificado**: el registro de riesgos de `feasibility-assessment.md` (fila "Filtración o acceso indebido...") cita explícitamente "HTTPS obligatorio" como mitigación, pero ningún NFR-D del draft exige TLS/HTTPS en tránsito para `backend-api-production` ni para las llamadas de `mobile-app` a la API — es un vacío de operacionalización, no una omisión del mandato original. Tampoco hay un NFR de cifrado en reposo para Neon (aunque el tier de Neon lo provee por defecto, no queda declarado como requisito verificable). Ninguno de los dos exige marco regulatorio formal para justificarse — ya están cubiertos por el mandato de "credenciales cifradas" y el sentido común de datos sensibles.

Recomiendo agregar un NFR-D8 (TLS obligatorio en tránsito, verificable en el smoke test) antes de aprobar el draft.

## Positions

OBJECT: security-requirements.md — falta un requisito explícito de HTTPS/TLS obligatorio en tránsito para `backend-api-production`, pese a estar citado como mitigación mandatoria en el risk register de feasibility (260908).
AGREE: security-requirements.md NFR-D4 a NFR-D7 — RBAC de infraestructura, separación de secretos y scrubbing de logs operacionalizan correctamente el mandato de protección de datos de comisión/salario, proporcional a un contexto sin marco regulatorio formal.
AGREE: reliability-requirements.md NFR-D10 a NFR-D12 — el smoke test funcional y la definición de "disponible" para este volumen (~26 vendedores) son razonables y no requieren un SLA formal dado que no hay marco regulatorio que lo exija.
