# RAID Log

## Risks

1. Acceso indebido a datos de comisión/salario por falta de controles de rol robustos. [Q2]
2. Costos de infraestructura superan el tier gratuito si el uso escala más allá de lo previsto. [Q4]
3. Continuidad del proyecto depende de un único desarrollador. [Q3]

## Assumptions

1. [assumption] El volumen de datos (≈26 rutas, decenas de vendedores) se mantiene dentro de los límites del tier gratuito de Neon durante el MVP.
2. [assumption] No se requiere integración con sistemas de Grupo Bimbo/TIOSA durante el MVP (confirmado en [Q1], pero podría cambiar si el proyecto escala fuera del uso personal del supervisor).

## Issues

None.

## Dependencies

1. Elección de proveedor de hosting para el backend NestJS — pendiente para la etapa de Architecture Design. [Q6]
2. Definición del modelo de permisos (consulta vs. edición para vendedores) heredada como hallazgo abierto de Intent Capture — debe resolverse en Requirements. [upstream:intent-statement]
