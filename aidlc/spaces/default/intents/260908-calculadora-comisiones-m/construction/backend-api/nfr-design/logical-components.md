# NFR Design — backend-api — Logical Components

## Sources

- [upstream:components] `inception/domain-design/components.md`
- [upstream:functional-spec] `construction/backend-api/functional-design/functional-spec.md`
- [upstream:nfr-design-questions] `construction/backend-api/nfr-design/nfr-design-questions.md`

## Diseño: un módulo NestJS por componente de dominio (Q4)

`backend-api` se despliega como un único proceso NestJS (un solo deployable — sin microservicios separados, injustificados al volumen y tamaño de equipo de este proyecto), organizado internamente en un módulo por componente de dominio de `components.md`, cada uno con su propio `Controller`/`Service`/DTOs, importándose entre sí solo a través de servicios exportados explícitamente:

```
AppModule
├── AuthModule            (User, Session — login, logout, guards)
├── VendorDirectoryModule (Vendor — roster, presupuesto)
├── CommissionTierModule  (CommissionTier — tramos)
├── SalesEntryModule      (DailySale — registrar/corregir/sincronizar venta)
├── CommissionLedgerModule(CommissionPeriod — recálculo, historial, cierre mensual)
└── NotificationModule    (Notification — umbrales, envío manual)
```

## Límites de falla (failure domains)

| Componente | Si falla... | Radio de impacto |
|---|---|---|
| `AuthModule` | Ningún request protegido se autentica (todo endpoint depende de `AuthGuard`) | Total — es una dependencia transversal, no aislada |
| `VendorDirectoryModule` | Administración de roster/presupuesto no disponible | Acotado — venta y comisión ya registradas siguen leyéndose |
| `CommissionTierModule` | Administración de tramos no disponible | Acotado — no afecta lectura de comisión ya calculada |
| `SalesEntryModule` | Registro/sincronización de venta no disponible | Alto para el flujo del vendedor, pero `mobile-app` ya persiste localmente (US3.3) — degradación, no pérdida de datos |
| `CommissionLedgerModule` | Recálculo/lectura de comisión e historial no disponible | Alto — es el dato más visible para el vendedor (US5.1) |
| `NotificationModule` | Envío de notificación falla | Bajo — no bloquea ningún flujo transaccional (venta, comisión); se pierde solo el aviso |

Al ser un único proceso, un fallo catastrófico (ej. la conexión a Neon cae por completo) afecta a todos los módulos simultáneamente — no hay aislamiento de proceso entre componentes en el MVP. Esto es una decisión consciente de simplicidad operativa (Q4), no un descuido: el volumen y tamaño de equipo no justifican el costo de desplegar y operar 6 servicios independientes.

## Recursos compartidos

- **Conexión a base de datos**: un único `PrismaClient` (pool pooled de Neon) compartido por todos los módulos vía `PrismaModule` global — es el recurso compartido más significativo; su agotamiento (NFR6.1) afectaría a todos los módulos por igual.
- **`AuthGuard`/`RolesGuard`**: aplicados globalmente desde `AuthModule`, consumidos (no reimplementados) por el resto de módulos.
- **`LoggingInterceptor`/`ExceptionFilter`**: aplicados globalmente desde `AppModule`, no por módulo — comportamiento de observabilidad consistente en todos los componentes.

## Puente hacia Infrastructure Design

Este inventario lógico de componentes es la unidad de trabajo que Infrastructure Design mapea a recursos físicos concretos (proceso desplegado, base de datos Neon, variables de entorno del hosting) — todos los módulos comparten el mismo proceso/deployable, así que Infrastructure Design no necesita definir múltiples unidades de despliegue para esta unidad de trabajo.
