# Intent Backlog (Proto-Units, MoSCoW)

| # | Proto-Unit | Prioridad (MoSCoW) | Depende de | Source |
|---|---|---|---|---|
| 1 | Administración de roster/vendedores/rutas/canal | Must | — | [Q2][Q3] |
| 2 | Administración de presupuestos por vendedor | Must | #1 | [Q2][Q3] |
| 3 | Administración de tramos de comisión variable | Must | #1 | [Q2][Q3] |
| 4 | Autenticación/PIN de administrador | Must | — | [Q2] |
| 5 | Autenticación de vendedor (login individual) | Must | #1 | [upstream:intent-statement] |
| 6 | Ingreso de venta diaria por vendedor | Must | #5 | [Q2][Q3] |
| 7 | Motor de cálculo de comisión por tramos | Must | #3, #6 | [Q2][Q3] |
| 8 | Reporte individual en tiempo real (venta vs. presupuesto + comisión ganada) | Must | #7 | [Q2][Q3] |
| 9 | Historial de períodos anteriores | Must | #8 | [Q2][Q3] |
| 10 | Notificaciones push (proximidad a meta) | Must | #7 | [Q2][Q3] |

## Value Stream Map

```
[Admin: roster + presupuestos + tramos + PIN]  (Unit 1-4)
        │
        ▼
[Vendedor: login]  (Unit 5)
        │
        ▼
[Vendedor: ingresa venta diaria] → [Motor de cálculo] (Unit 6-7)
        │
        ▼
[Reporte individual en tiempo real] (Unit 8)
        │
        ├──▶ [Historial de períodos] (Unit 9)
        └──▶ [Notificaciones push] (Unit 10)
```

## Assumptions & Open Questions

None.
