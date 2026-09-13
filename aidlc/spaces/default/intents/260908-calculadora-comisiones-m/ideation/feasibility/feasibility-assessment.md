# Feasibility Assessment

## Technical Viability

- **Frontend (React Native)**: viable. El equipo (Carlos + asistencia de IA) parte de una lógica de negocio ya validada y funcionando en la calculadora web actual (React), lo que reduce el riesgo de traducir las reglas de cálculo de comisión al nuevo cliente. [Q3][upstream:intent-statement]
- **Backend (NestJS)**: viable. NestJS provee una estructura modular (módulos, DTOs, guards) apta para separar responsabilidades: autenticación por rol, cálculo de comisiones, gestión de roster/presupuestos. [Q3]
- **Base de datos (Neon/PostgreSQL serverless)**: viable para el perfil de uso esperado (bajo volumen: un supervisor, ~26 rutas, decenas de vendedores). El tier gratuito de Neon cubre almacenamiento y cómputo suficientes para un MVP de este tamaño. [Q3][Q4]
- **Riesgo principal**: el equipo de un solo desarrollador con apoyo de IA implica que la velocidad de entrega depende de mantener el alcance MVP disciplinado; no hay redundancia de conocimiento humano. [Q3]

## Risk Analysis

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Filtración o acceso indebido a datos de comisión/salario (sensibles pero sin marco regulatorio formal) | Media | Alto | Autenticación por rol (supervisor vs. vendedor), hashing de credenciales, HTTPS obligatorio, principio de mínimo privilegio en la API NestJS | [Q2]
| Costos de infraestructura crecen más allá del tier gratuito si el uso escala | Baja (a corto plazo) | Medio | Monitorear consumo de Neon/hosting; diseñar para escalar horizontalmente sin re-arquitectura | [Q4]
| Único desarrollador (Carlos) sin equipo de respaldo | Media | Medio | Documentación exhaustiva vía AI-DLC (esta misma traza) para que cualquier continuador retome el contexto | [Q3]

## Assumptions & Open Questions

None.
