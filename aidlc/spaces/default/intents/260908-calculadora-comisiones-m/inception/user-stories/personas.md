# User Stories — Personas

## P1. Vendedor

- **Rol**: preventista o autoventa, asignado a una ruta dentro de una de las ~26 rutas del centro de ventas.
- **Contexto de uso**: trabaja en campo, con conectividad intermitente, usando su teléfono durante y después de su recorrido diario.
- **Metas**:
  - Saber en todo momento cuánto está ganando en comisión y qué le falta para el siguiente umbral de venta o de devolución.
  - Registrar su venta del día de forma rápida, incluso sin señal.
  - Enterarse de inmediato (vía notificación) cuando cruza un umbral favorable, o cuando el supervisor anuncia un incentivo.
- **Frustraciones actuales**: la calculadora anterior vive en un solo dispositivo (el del supervisor); el vendedor no tiene visibilidad propia de su comisión hasta que alguien le informa.
- **Nivel técnico**: uso básico-intermedio de apps móviles; no técnico.

## P2. Supervisor (Carlos)

- **Rol**: supervisor de ventas, administra el roster de vendedores, presupuestos y tramos de comisión de su centro de ventas.
- **Contexto de uso**: revisa el desempeño del equipo desde su teléfono o tablet, ajusta configuración cuando cambian metas o tramos, y quiere comunicar incentivos puntuales sin depender de canales informales (WhatsApp, llamadas).
- **Metas**:
  - Mantener actualizados roster, presupuestos y tramos sin depender de un archivo local.
  - Ver de un vistazo qué rutas están registrando venta diaria y cuáles no (adopción, NFR2).
  - Comunicar incentivos del mes directamente a uno, varios o todos los vendedores.
- **Frustraciones actuales**: la calculadora anterior no es compartible ni auditable; toda la configuración depende de un solo archivo y un solo dispositivo.
- **Nivel técnico**: uso intermedio de apps móviles y hojas de cálculo; no técnico (no programa, no administra bases de datos).

## Priority Ranking

1. **P1. Vendedor** — persona primaria; el 100% de las rutas (~26) interactúan a diario. La adopción de esta persona es la métrica de éxito del proyecto (NFR2).
2. **P2. Supervisor** — persona secundaria pero crítica: sin su configuración correcta (roster, presupuestos, tramos) la experiencia del Vendedor no funciona.

## Relationship

El Supervisor configura los datos maestros (roster, presupuestos, tramos) que consume el Vendedor; el Vendedor genera el dato transaccional (venta diaria) que el Supervisor supervisa de forma agregada (adopción) y sobre el cual actúa con notificaciones manuales. No hay una tercera persona en el MVP (out of scope: RRHH, Finanzas).
