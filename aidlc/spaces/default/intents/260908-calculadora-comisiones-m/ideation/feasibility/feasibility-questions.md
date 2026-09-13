# Feasibility & Constraints — Questions

## Sources

- [desc] Initial description: "Aplicación móvil de calculadora de comisiones para supervisores de ventas (TIOSA S.A. / Grupo Bimbo Ecuador): reemplaza la calculadora web actual de un solo archivo (roster de vendedores por ruta y canal preventa/autoventa, presupuestos, tramos de comisión variable, PIN de administrador) por una app móvil React Native con backend NestJS y base de datos PostgreSQL en Neon."
- [upstream:intent-statement] `ideation/intent-capture/intent-statement.md` — Problem Statement, Target Customer, Success Metrics, Initiative Trigger, Initial Scope Signal.

## Q1. ¿Con qué sistemas existentes debe integrarse esta app?

A. Ninguno por ahora — sistema autónomo nuevo
B. Sistemas internos de Grupo Bimbo/TIOSA (ERP, ventas)
C. Not yet defined
X. Other (please specify)

[Answer]: A. Ninguno por ahora.

## Q2. ¿Hay requisitos regulatorios o de cumplimiento?

A. Ninguno formal, pero maneja datos sensibles (comisión/salario de vendedores) que deben protegerse
B. Ninguno
C. Normativa específica (Ecuador / política interna Bimbo)
X. Other (please specify)

[Answer]: A. Ninguno formal, pero datos sensibles — requiere control de acceso por rol/PIN y cifrado de credenciales.

## Q3. ¿Cuál es el stack tecnológico y el perfil del equipo?

A. Frontend: React Native. Backend: NestJS. Base de datos: PostgreSQL en Neon (serverless). Equipo: el propio Carlos, con asistencia de IA (Claude) para construir y mantener.
X. Other (please specify)

[Answer]: A. Confirmado.

## Q4. ¿Cuáles son las restricciones de presupuesto y tiempo?

A. Presupuesto personal mínimo/gratuito — priorizar capas gratuitas (Neon free tier, hosting económico/gratuito para NestJS, Expo/EAS free tier)
B. Hay algo de presupuesto disponible
C. Sin restricción relevante
X. Other (please specify)

[Answer]: A. Presupuesto personal mínimo/gratuito.

## Q5. ¿Hay bloqueadores organizacionales (congelamiento de cambios, prioridades en competencia)?

A. None
B. Sí (especificar)
X. Other (please specify)

[Answer]: A. None — proyecto personal/independiente del ciclo de aprobaciones de TIOSA/Bimbo.

## Q6. ¿Qué servicios de nube están en uso actualmente (AWS u otros)?

A. Ninguno todavía — greenfield; se elegirá según el stack (Neon ya cubre la base de datos; el hosting del backend NestJS y la app móvil quedan por decidir en Architecture Design)
X. Other (please specify)

[Answer]: A. Ninguno todavía.

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
