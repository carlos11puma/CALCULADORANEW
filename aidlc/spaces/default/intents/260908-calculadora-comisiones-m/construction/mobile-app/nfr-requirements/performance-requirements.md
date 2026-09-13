# NFR Requirements — mobile-app — Rendimiento

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` (NFR1)
- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`
- [Q1] `nfr-requirements-questions.md`

- **NFR1.5** — Toda acción de UI que dispare una operación de red (login, guardar venta, guardar roster/presupuesto/tramos, enviar notificación) muestra su estado `loading` (spinner/deshabilitado) en menos de 100ms desde el toque, independientemente de la latencia real de la llamada — feedback optimista de percepción de velocidad (Q1), complementario al presupuesto de <2s de extremo a extremo que garantiza `backend-api` (su NFR1.1).
- **NFR1.6** — Las pantallas con datos remotos (V2, V4, A2, A4) muestran un estado `loading` con esqueleto (`SkeletonCard`/`SkeletonListItem`) en vez de una pantalla en blanco mientras la primera respuesta no llega, para no dar la impresión de que la app está congelada.
- **NFR1.7** — Ninguna transformación de datos en el cliente (agrupación de notificaciones en V5, cálculo de `pendingSalesCount`) puede introducir una demora perceptible (objetivo: <50ms) sobre datos del volumen esperado por vendedor (unas pocas decenas de notificaciones, unos pocos días de ventas pendientes) — no requiere optimización especial dado ese volumen, pero descarta operaciones cuadráticas innecesarias sobre esas listas.

## Assumptions & Open Questions

None.
