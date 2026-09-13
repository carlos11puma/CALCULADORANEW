# NFR Requirements — Despliegue a Producción — Scalability Requirements

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` § Fuera de alcance, NFR4
- [upstream:scalability-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/` (no releído en detalle aquí — decisión ya cerrada en Construction de `260908`)

Breve por diseño: este intent no introduce ningún cambio de escalabilidad respecto a lo ya decidido en `260908`. Las pruebas de carga formales están **explícitamente fuera de alcance** del alcance `infra` aprobado por Carlos (ver `requirements.md` § Fuera de alcance) — esta sección no las reintroduce, pero tampoco las deja silenciosamente sin mencionar: se documenta el techo conocido de la infraestructura gratuita para que quede trazable qué pasa si el uso real supera lo esperado.

## NFR-D8 — Sin pruebas de carga formales (alcance ya cerrado)

- **NFR-D8.1**: No se ejecuta ninguna prueba de carga (formal o informal) como parte de este primer despliegue — decisión de alcance aprobada por Carlos, no un vacío accidental.
- **NFR-D8.2**: El volumen real esperado (~26 vendedores, uso disperso a lo largo del día, cada uno operando su propia ruta sin overlap significativo) está muy por debajo de cualquier límite de concurrencia conocido de los planes free de Render/Neon — no hay indicio de que se necesite una prueba de carga para este volumen, lo cual es parte del razonamiento detrás de aceptar la exclusión de alcance.

## NFR-D9 — Techo conocido del free tier (documentado, no mitigado)

- **NFR-D9.1**: El plan free de Render limita CPU compartida y 512MB de RAM por servicio (ya fijado en `infrastructure-specification.md` de `260908`) — si el volumen de uso creciera sustancialmente más allá de ~26 rutas, este sería el primer límite técnico a revisar.
- **NFR-D9.2**: El plan free de Neon tiene límites de almacenamiento y de horas de cómputo activo por mes — no se espera alcanzarlos con el volumen actual de datos de comisión/salario de ~26 vendedores, pero no hay alerta automática configurada si se acercan (consistente con la ausencia de plataforma de monitoreo de pago, ver `observability-requirements.md`).
- **NFR-D9.3**: El plan free de EAS limita la cantidad de builds nativos por mes — el flujo de actualización OTA (`EAS Update`) ya diseñado en `260908` minimiza el consumo de builds nativos, manteniendo el uso dentro del límite gratuito para el volumen esperado.
- **NFR-D9.4**: Si en el futuro el volumen de rutas o de vendedores crece de forma significativa, revisar estos tres techos (Render, Neon, EAS) es la acción recomendada antes de asumir que la infraestructura gratuita sigue siendo suficiente — esto queda documentado como una nota operativa, no como una acción de este intent.

## Resumen

| ID | Requisito | Origen |
|---|---|---|
| NFR-D8.1 | Sin pruebas de carga en este despliegue | requirements.md § Fuera de alcance |
| NFR-D8.2 | Volumen esperado muy por debajo de límites conocidos | NFR4 |
| NFR-D9.1 | Techo de RAM/CPU de Render free tier documentado | NFR4, infrastructure-specification.md (260908) |
| NFR-D9.2 | Techo de almacenamiento/cómputo de Neon free tier documentado | NFR4 |
| NFR-D9.3 | Techo de builds de EAS free tier documentado | NFR4 |
| NFR-D9.4 | Revisión de techos recomendada si el volumen crece (nota operativa, sin acción en este intent) | NFR4 |
