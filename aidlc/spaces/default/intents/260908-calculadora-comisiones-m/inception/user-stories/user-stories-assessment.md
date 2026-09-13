# User Stories — Assessment

## Decision

Execute.

## Rationale

Este proyecto es fuertemente user-facing, con dos personas claramente diferenciadas (vendedor y supervisor administrador) que interactúan con la app de formas muy distintas, y con lógica de negocio compleja (cálculo de comisión por tramos, indicador de devolución, notificaciones en múltiples umbrales) que se beneficia de escenarios concretos escritos como historias con criterios de aceptación verificables.

## Factors Considered

- **Tipo de proyecto**: app móvil nueva (greenfield) que reemplaza una calculadora de un solo archivo — no es refactor ni bugfix.
- **Alcance user-facing**: sí, todo el sistema (ingreso de venta, reporte, notificaciones, panel admin) es interacción directa de usuario final.
- **Personas múltiples**: vendedor (rol operativo, ingreso diario) y supervisor (rol administrativo, configuración de roster/presupuestos/tramos).
- **Complejidad de negocio**: cálculo de comisión por tramos variable, indicador de devolución con oportunidad de ganancia, y dos series independientes de umbrales de notificación (venta/presupuesto y devolución) — se benefician de criterios de aceptación explícitos por escenario.
- **Coordinación cruzada**: el mismo dato (venta diaria) alimenta reporte del vendedor, cálculo de comisión y notificaciones — las historias ayudan a mapear esas dependencias.

## Áreas donde las historias aportan más valor

- Ingreso de venta diaria (online y offline) con validación y corrección.
- Cálculo y visualización de comisión en tiempo real.
- Notificaciones automáticas de venta/presupuesto (FR7) y de devolución con oportunidad de ganancia (FR8).
- Notificaciones push manuales del supervisor (FR9).
- Administración de roster, presupuestos y tramos (FR2).
- Autenticación y manejo de sesión por rol (FR1).
