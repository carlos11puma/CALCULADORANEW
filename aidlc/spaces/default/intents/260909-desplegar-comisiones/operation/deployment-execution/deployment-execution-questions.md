# Deployment Execution — Preguntas de Clarificación

## Sources

- [upstream:cd-config] `operation/deployment-pipeline/cd-config.md`
- [upstream:deployment-strategy] `operation/deployment-pipeline/deployment-strategy.md`
- [upstream:environment-inventory] `operation/environment-provisioning/environment-inventory.md`
- [upstream:validation-report] `operation/environment-provisioning/validation-report.md`
- [upstream:reliability-design] `construction/nfr-design/reliability-design.md` (secuencia de 6 pasos, caso de prueba fijo)

## Q1 — Los chequeos previos al despliegue todavía no pasan (no es un despliegue simulado)

El propio stage template exige confirmar "¿pasan todos los chequeos previos al despliegue?" antes de
ejecutar. La respuesta real hoy es **no**: `operation/environment-provisioning/validation-report.md`
tiene sus 12 puntos en "Pendiente" — ninguna cuenta de Neon/Render/EAS existe todavía, y el Paso 0
(cliente Prisma real + dependencias vulnerables) tampoco se ejecutó. No hay ningún servicio real al
cual desplegar ni contra el cual correr un smoke test.

**¿Cómo procede esta etapa dado que no hay infraestructura real todavía?**

A. Esta etapa prepara ahora el "paquete listo para ejecutar" (plantillas de `deployment-log.md`,
   `smoke-test-results.md`, `health-check-report.md` con la secuencia exacta y los criterios de
   éxito ya definidos, marcadas explícitamente como no ejecutadas) para que Carlos las complete con
   resultados reales apenas termine `environment-inventory.md` — sin inventar ningún resultado de
   despliegue ni de smoke test.
B. Esperar a que Carlos complete el aprovisionamiento antes de escribir nada de esta etapa.
C. Otra resolución (especificar).

[Answer]: A. Esta etapa prepara ahora el "paquete listo para ejecutar" (plantillas de `deployment-log.md`, `smoke-test-results.md`, `health-check-report.md` con la secuencia exacta y los criterios de éxito ya definidos, marcadas explícitamente como no ejecutadas) para que Carlos las complete con resultados reales apenas termine `environment-inventory.md` — sin inventar ningún resultado de despliegue ni de smoke test.

## Q2 — El caso de prueba fijo del smoke test todavía no está definido

`reliability-design.md` exige que, antes de desplegar a producción, Carlos documente por escrito un
caso de prueba concreto: un vendedor real ya cargado en el roster (FR3), su ruta/canal, un monto de
venta específico, y el monto de comisión esperado calculado a mano de antemano. Esta sesión no tiene
acceso al roster real de los ~26 vendedores ni a las reglas de comisión aplicadas a un caso real — no
se puede fabricar este dato sin inventar una cifra que podría no coincidir con lo que el sistema
realmente calcule, lo cual invalidaría el propósito del smoke test.

**¿Quién completa el caso de prueba fijo antes de ejecutar el smoke test real?**

A. Carlos lo completa directamente en `smoke-test-results.md` (esta etapa deja la plantilla con los
   campos exactos a llenar: vendedor, ruta/canal, monto de venta, comisión esperada calculada a
   mano) cuando esté listo para ejecutar el despliegue real.
B. Traer el caso de prueba a esta sesión ahora mismo, aunque el despliegue real todavía no exista.
C. Otra resolución (especificar).

[Answer]: A. Carlos lo completa directamente en `smoke-test-results.md` (esta etapa deja la plantilla con los campos exactos a llenar: vendedor, ruta/canal, monto de venta, comisión esperada calculada a mano) cuando esté listo para ejecutar el despliegue real.

## Assumptions & Open Questions

- Esta sesión no ejecuta ningún despliegue real ni corre ningún smoke test real — no tiene cuentas
  de Neon/Render/EAS, ni acceso a la computadora de Carlos con shell, ni al roster real de
  vendedores. Todo lo que esta etapa produce es el paquete de ejecución listo, no la ejecución en sí.
- La secuencia de 6 pasos y los criterios de rollback ya están completamente diseñados en
  `reliability-design.md` y `operation/deployment-pipeline/rollback-runbook.md` — esta etapa no los
  rediseña, solo los convierte en una plantilla de bitácora que Carlos llena paso a paso mientras
  ejecuta.

**Confirmación de asunciones:**

A. Accept assumptions
B. Convert to follow-up questions

[Answer]: A. Accept assumptions

## Consolidated Summary Confirmation

- Esta etapa no ejecuta ningún despliegue real — no hay infraestructura real todavía
  (`environment-provisioning/validation-report.md` sigue en 12/12 pendiente).
- Se produce un paquete de ejecución completo y listo (`deployment-log.md`, `smoke-test-results.md`,
  `health-check-report.md`) siguiendo exactamente la secuencia de 6 pasos y el criterio de éxito ya
  diseñados en `reliability-design.md`, con todos los resultados marcados como pendientes de
  ejecución real por Carlos.
- El caso de prueba fijo del smoke test (vendedor real, monto, comisión esperada) queda como campo
  en blanco para que Carlos lo complete cuando esté listo para ejecutar — no se inventa un dato que
  podría no corresponder a una regla de comisión real.

**¿Es correcto este resumen?**

[Answer]: Looks correct
