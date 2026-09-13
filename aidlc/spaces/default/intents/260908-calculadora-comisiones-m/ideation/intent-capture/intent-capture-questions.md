# Intent Capture — Questions

## Sources

- [desc] Initial description: "Aplicación móvil de calculadora de comisiones para supervisores de ventas (TIOSA S.A. / Grupo Bimbo Ecuador): reemplaza la calculadora web actual de un solo archivo (roster de vendedores por ruta y canal preventa/autoventa, presupuestos, tramos de comisión variable, PIN de administrador) por una app móvil React Native con backend NestJS y base de datos PostgreSQL en Neon."
- [scope] Workflow-selected scope: `mvp`.

## Q1. ¿Qué problema de negocio estamos resolviendo?

A. La calculadora actual (HTML de un solo archivo, sin backend) no escala: no hay multiusuario ni respaldo centralizado
B. Falta de movilidad: el cálculo de comisiones no se puede hacer en campo/ruta
C. Errores manuales en el cálculo de comisión por tramos
D. Not yet defined
X. Other (please specify)

[Answer]: A. La calculadora actual (HTML de un solo archivo, sin backend) no escala: no hay multiusuario ni respaldo centralizado

## Q2. ¿Quién es el cliente (interno/externo) y qué dolor experimenta?

A. El propio supervisor de ventas (Carlos), que hoy administra la calculadora manualmente
B. Los vendedores/preventistas de sus ~26 rutas, que hoy no tienen visibilidad directa de su comisión
C. Not yet defined
X. Other (please specify)

[Answer]: A y B. El supervisor administra roster/presupuestos/tramos; los vendedores/preventistas necesitan consultar su comisión calculada.

## Q3. ¿Qué significa éxito? ¿Qué métricas importan?

A. Uso en campo: el equipo puede calcular/consultar comisión desde el celular en la ruta, sin depender de una laptop
B. Menos errores de cálculo
C. Ahorro de tiempo del supervisor en el cierre de comisiones
D. Not yet defined
X. Other (please specify)

[Answer]: A. Uso en campo (movilidad) — métrica principal de éxito.

## Q4. ¿Cuál es el disparador de esta iniciativa (presión de mercado, deuda técnica, regulación, oportunidad)?

A. Limitación técnica de la app actual (deuda técnica: sin backend, sin multiusuario, sin respaldo centralizado)
B. Necesidad de acceso móvil real del equipo en campo
C. Pedido de la gerencia / Oscar Ramos
D. Not yet defined
X. Other (please specify)

[Answer]: A. Limitación técnica de la app actual.

## Q5. ¿Quiénes son los stakeholders clave y qué le importa a cada uno?

A. Carlos Puma (supervisor de ventas) — dueño del producto, administra roster/presupuestos/tramos vía PIN de admin
B. Vendedores/preventistas de las rutas — consumidores finales, ven su comisión calculada
C. Oscar Ramos (gerente divisional) — Not yet defined como stakeholder de este proyecto específico
D. Not identified further
X. Other (please specify)

[Answer]: A y B confirmados. Oscar Ramos no fue confirmado como stakeholder de este proyecto — se registra como `Unknown (open question) [assumption]`.

## Q6. ¿Quién decide el alcance o las prioridades, y quién influye en esas decisiones?

A. Carlos decide solo
B. Oscar Ramos aprueba
C. Not yet defined
X. Other (please specify)

[Answer]: A. Carlos decide solo.

## Q7. ¿Hay requerimientos de comunicación o cadencia de reporte?

A. None
B. Reporte periódico a Oscar Ramos
C. Not yet defined
X. Other (please specify)

[Answer]: A. None — no se identificó ningún requerimiento de comunicación/cadencia para este proyecto.

## Q8. El workflow arrancó con el alcance `mvp`. ¿Ese alcance coincide con el límite de producto que tienes en mente, o defines uno distinto?

A. Confirmo `mvp`: construir el núcleo funcional (cálculo de comisiones, roster, autenticación) sin fase formal de operaciones/despliegue
B. Necesito el ciclo completo (`feature`): incluir diseño de despliegue, monitoreo y operación formal desde ya
C. Algo más ligero (`express`)
X. Other (please specify)

[Answer]: A. Confirmo `mvp`.

## Assumption Confirmation

Assumptions requiring confirmation:
1. [assumption] Oscar Ramos (gerente divisional) no es stakeholder activo de este proyecto específico — no se confirmó su rol aquí.
2. [assumption] No existe requerimiento de reporte/comunicación formal para este proyecto.
3. [assumption] Los vendedores/preventistas accederán a la app solo para **consultar** su comisión calculada (no para editar roster/presupuestos/tramos, que sigue siendo función exclusiva del supervisor vía PIN de admin) — no confirmado explícitamente por el usuario.

A. Accept assumptions
B. Convert to follow-up questions

[Answer]: A. Accept assumptions

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
