**Collaborator:** aidlc-quality-agent

## Contribution

Revisión de `reliability-requirements.md` y `performance-requirements.md` de `260909` contra `test-results.md` de `260908`, con foco en verificabilidad del smoke test y en el estado pendiente de T-10.

### 1. Verificabilidad del smoke test (NFR-D10.1)

NFR-D10.1 exige "login funciona" y "venta de prueba calcula la comisión correctamente", pero ninguna condición está operacionalizada como criterio pasa/falla ejecutable:

- No se define un **dataset de prueba fijo** (vendedor de prueba, ruta, monto de venta) ni el **valor de comisión esperado** contra el cual comparar el resultado real. Sin esos dos datos, "correctamente" no es verificable de forma repetible por dos personas distintas ni automatizable en CI.
- "Login funciona" tampoco especifica el criterio observable mínimo (¿HTTP 200 + token JWT válido? ¿solo ausencia de error visible?).

**Recomendación**: añadir a NFR-D10.1 un caso de prueba concreto — credenciales/ruta/monto fijos y la comisión numérica esperada — para que el smoke test sea ejecutable como script o checklist reproducible, no solo como intención.

### 2. NFR-D10.3 — verificación de logs sin método definido

Se exige verificar "logs sin datos sensibles ni credenciales" como parte obligatoria del mismo smoke test, pero no se define el método (¿revisión manual de qué líneas, en qué panel de Render/EAS, con qué patrón de búsqueda de `JWT`/`DATABASE_URL`/montos?). Sin un procedimiento concreto, esta verificación no es reproducible ni auditable — dos ejecuciones del smoke test podrían dar veredictos distintos según quién la revise.

### 3. NFR-D1.2 — timeout del smoke test sin valor

NFR-D1.2 exige que el smoke test complete "dentro de un tiempo total acotado" pero el propio documento lo marca `[Q1]`, sin número. Un target no cuantificado no es un target verificable — no se puede evaluar pasa/falla del timeout hasta que se fije un valor (p. ej. 5 minutos totales para login + venta de prueba).

### 4. T-10 (vulnerabilidades de dependencias) — falta gate de re-verificación explícito en NFR

`test-results.md` de `260908` deja T-10 formalmente **Not Met**, aceptado como riesgo conocido con la decisión explícita de Carlos de resolverlo "antes de cualquier despliegue de producción real". `project.md` de este intent ya lo mandata como primer paso (`ALWAYS resolver... actualizar las dependencias... antes de cualquier aprovisionamiento o despliegue real`), pero **ninguno de los dos documentos NFR de este intent (reliability/performance) referencia T-10 ni exige su re-verificación como precondición formal del smoke test de NFR-D10**. Esto deja un hueco: nada en los criterios de éxito del despliegue obliga explícitamente a (a) re-ejecutar `npm audit` / la suite de 336 pruebas tras el fix de dependencias, y (b) confirmar T-10 como Met, antes de que el smoke test de NFR-D10.1 pueda siquiera considerarse un despliegue válido a evaluar.

**Recomendación**: añadir a `reliability-requirements.md` (o como precondición de NFR-D10) un gate explícito: el smoke test de NFR-D10.1 solo es válido si T-10 fue re-verificado como Met (dependencias actualizadas + suite completa en verde) inmediatamente antes del despliegue a producción — no basta con la decisión de aceptación registrada en `260908`, que fue tomada antes del fix, no después.

## Positions

AGREE: NFR-D2 (cold start del free tier de Render documentado como comportamiento esperado, no defecto) — realista y bien acotado para el volumen de ~26 vendedores.
AGREE: NFR-D3 (sin SLA numérico de disponibilidad) — consistente con la ausencia de SLI/SLO formales heredada de `260908` y con la infraestructura free-tier.
AGREE: NFR-D11 (rollback manual + notificación obligatoria a Carlos) — criterio claro y ejecutable tal como está escrito.
OBJECT: NFR-D10.1 no es verificable como está redactado — falta un caso de prueba concreto (dataset fijo y comisión esperada) para que "calcula la comisión correctamente" tenga un veredicto pasa/falla reproducible.
OBJECT: NFR-D10.3 (verificación de logs) carece de un método/procedimiento concreto — no es auditable ni repetible sin definir qué se revisa y cómo.
OBJECT: NFR-D1.2 no es verificable mientras el timeout total del smoke test siga marcado `[Q1]` sin valor numérico asignado.
OBJECT: falta un gate explícito en los NFR de este intent que condicione la validez del smoke test de NFR-D10 a la re-verificación de T-10 (dependencias) como Met tras el fix — la decisión de aceptación de riesgo en `260908` no debe leerse como sustituto de esa re-verificación posterior.
