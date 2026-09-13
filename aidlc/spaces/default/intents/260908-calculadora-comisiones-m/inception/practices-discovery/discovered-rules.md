# Discovered Rules

## Mandated

- ALWAYS proteger los datos de comisión/salario con control de acceso por rol (supervisor vs. vendedor) y credenciales cifradas — heredado de Feasibility (datos sensibles sin marco regulatorio formal). [upstream:feasibility-assessment]
- ALWAYS priorizar capas gratuitas de infraestructura (Neon free tier, hosting económico, Expo/EAS free tier) dado el presupuesto mínimo/gratuito confirmado en Feasibility. [upstream:constraint-register]

## Forbidden

- NEVER commitear secretos (cadena de conexión de Neon, JWT secret de NestJS) — usar variables de entorno. [contributions/aidlc-devsecops-agent]
