# Practices Discovery — Questions

## Sources

- [org-default] `aidlc/spaces/default/memory/org.md` — defaults sugeridos (proyecto greenfield).
- [upstream:feasibility-assessment] `ideation/feasibility/feasibility-assessment.md`
- [upstream:constraint-register] `ideation/feasibility/constraint-register.md`

## Q1. Forma de trabajo con git — ¿ramas cortas que se integran seguido a `main`, o prefieres otro esquema?

A. Ramas cortas por función, integradas a `main` en 1-2 días (default sugerido)
B. Otro esquema
X. Other (please specify)

[Answer]: A. Confirmado.

## Q2. ¿Construir primero una versión mínima que funcione de punta a punta (un "esqueleto caminante": la versión más simple posible que conecta login → ingresar venta → ver comisión, sin toda la funcionalidad todavía, solo para probar que las piezas se conectan) antes de construir las funcionalidades completas?

A. Sí, construir ese esqueleto mínimo primero
B. No, construir cada funcionalidad completa en su orden normal
X. Other (please specify)

[Answer]: A. Sí — dado el stack nuevo para Carlos (RN+NestJS+Neon), probar la conexión completa primero reduce riesgo.

## Q3. Sobre las pruebas automatizadas: ¿escribimos las pruebas después de programar cada parte (como red de seguridad), o preferimos otro orden?

A. Test-after: programar cada parte y luego escribir sus pruebas, con un piso de 80% de cobertura y ejecución automática antes de integrar a `main` (default sugerido para alcance mvp)
B. Otro orden (por ejemplo, escribir la prueba antes que el código)
X. Other (please specify)

[Answer]: A. Confirmado — test-after con piso de 80% de cobertura.

## Q4. Sobre el despliegue: ¿publicamos automáticamente a un ambiente de pruebas cada vez que se integra código, y pedimos tu aprobación manual solo para producción?

A. Sí — despliegue automático a pruebas, aprobación manual para producción
B. Otro esquema
X. Other (please specify)

[Answer]: A. Confirmado.

## Q5. Sobre el estilo de código: ¿usamos las herramientas estándar de cada lenguaje (Prettier/ESLint para TypeScript en React Native y NestJS) sin reglas propias adicionales?

A. Sí, usar las herramientas estándar sin reglas propias
B. Quiero definir reglas propias
X. Other (please specify)

[Answer]: A. Confirmado.

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
