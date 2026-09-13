**Collaborator:** aidlc-devsecops-agent

## Contribution

Sin pipeline ni escaneo de dependencias configurado todavía (greenfield). Dado que la app maneja datos sensibles (comisión/salario, registrado en Feasibility) y presupuesto mínimo/gratuito, recomiendo lint/format en cada commit (ESLint/Prettier), escaneo de dependencias gratuito (`npm audit` o Dependabot, sin costo), y nunca commitear secretos (usar variables de entorno para la cadena de conexión de Neon y cualquier JWT secret de NestJS) — esto último ya está cubierto por la guardarraíl de `phases/construction.md` (`## Security`), así que no requiere una regla nueva.

## Positions

AGREE: Lint/format en cada commit + escaneo de dependencias gratuito (npm audit/Dependabot) como práctica de deployment/CI, sin necesidad de reglas Mandated/Forbidden adicionales más allá de las ya vigentes en `phases/construction.md`.
