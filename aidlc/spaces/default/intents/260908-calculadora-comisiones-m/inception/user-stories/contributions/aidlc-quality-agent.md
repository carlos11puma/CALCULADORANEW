**Collaborator:** aidlc-quality-agent

## Contribution

Revisé `stories.md` desde la óptica de testabilidad de los criterios de aceptación.

- La mayoría de los criterios son testables tal como están escritos (Given/When/Then con condiciones concretas). Buen uso de IDs estables (AC{group}.{seq}.{criterion}).
- AC7.1.1 y AC8.2.1 usan la frase "por primera vez en el período vigente" — esto es correcto y necesario para ser testable (evita ambigüedad sobre reenvíos), pero implica que el caso de prueba necesita fijar un período de referencia; sugiero que quede explícito en Domain Design qué estado guarda "qué umbrales ya se notificaron" para que QA pueda verificarlo sin inspeccionar notificaciones push directamente (ej. un campo consultable en el reporte del vendedor o en un log interno).
- AC3.1.1 fija un umbral de rendimiento (menos de 2 segundos) — testable, pero depende de condiciones de red que deben quedar fijadas en el caso de prueba (con conexión disponible, como ya aclara NFR1).
- AC2.3.2 y AC8.3.2 dependen de una regla de validación de orden de tramos que Domain Design aún no ha definido — no son testables todavía tal como están redactadas (dicen "según la regla que defina Domain Design"), lo cual es aceptable en esta etapa porque están marcadas explícitamente como pendientes, pero QA no puede escribir casos de prueba reales para ellas hasta esa definición.
- No hay un criterio de aceptación para el caso "el vendedor pierde conexión a mitad de la operación de guardar" (distinto de "ya sabía que no tenía conexión al abrir la pantalla") — un caso de borde común en campo.

## Positions

AGREE: US1, US2 (excepto AC2.3.2), US4, US5, US6, US9 — criterios testables y completos para este nivel de detalle.
AGREE: que AC2.3.2 y AC8.3.2 queden como pendientes explícitos de Domain Design en vez de inventar una regla ahora.
OBJECT: falta un criterio de aceptación para pérdida de conexión a mitad de la operación de guardar venta (distinto del caso ya cubierto de "sin conexión desde el inicio"); recomiendo agregarlo a US3.3 antes de cerrar esta etapa, ya que es un caso de borde de campo realista y de bajo costo de especificar ahora.
