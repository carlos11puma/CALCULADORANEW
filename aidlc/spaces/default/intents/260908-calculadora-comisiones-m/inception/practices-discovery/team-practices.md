# Team Practices — Calculadora de Comisiones

## Way of Working

Trunk-based: ramas cortas por función, integradas a `main` en 1-2 días. [Q1]

## Walking Skeleton

Sí — construir primero una versión mínima que corre de punta a punta (login → ingresar venta → ver comisión calculada) antes de construir cada funcionalidad completa, dado que React Native + NestJS + Neon es un stack nuevo para el equipo y esto reduce el riesgo de integración. [Q2]

## Testing Posture

- **Methodology**: test-after
- **Ordering**: implementar cada capa aplicable (backend NestJS, frontend React Native) y luego escribir y correr las pruebas de esa capa, antes de integrar a `main`.
- Piso de cobertura: 80% de líneas, con ejecución en CI antes de merge (heredado del default de `org.md` para alcance `mvp`, afirmado sin cambios). [Q3]

## Deployment

Despliegue automático a un ambiente de pruebas en cada integración a `main`; aprobación manual del supervisor (Carlos) requerida antes de desplegar a producción. [Q4]

## Code Style

Herramientas estándar por lenguaje sin reglas propias adicionales: Prettier + ESLint para TypeScript, tanto en React Native como en NestJS. [Q5]
