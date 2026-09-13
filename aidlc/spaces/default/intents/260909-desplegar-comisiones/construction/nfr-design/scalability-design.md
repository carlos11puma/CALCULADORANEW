# NFR Design — Despliegue a Producción — Scalability Design

## Sources

- [upstream:scalability-requirements] `construction/nfr-requirements/scalability-requirements.md`
- [upstream:scalability-design-260908] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/scalability-design.md` (decisión de escalado ya cerrada — no se rediseña aquí)

Sin cambio de diseño respecto a `260908`: el servicio se despliega como una única instancia de `backend-api-production` en Render (el diseño stateless ya afirmado en `260908` significa que escalar horizontalmente después, si el volumen creciera, no requeriría rediseño — solo cambiar la configuración de Render). Este documento existe para dejar trazable, en el contexto del despliegue real, los techos conocidos del free tier.

## Diseño: instancia única, sin balanceador (deriva de NFR-D8)

`backend-api-production` se aprovisiona como un único Web Service de Render (plan free), sin configuración de múltiples instancias ni balanceador de carga — consistente con el volumen esperado (~26 vendedores, sin concurrencia significativa) y con la exclusión de pruebas de carga ya aprobada por Carlos.

## Diseño: techos del free tier a vigilar (deriva de NFR-D9)

| Recurso | Techo del free tier | Qué revisar si el volumen crece |
|---|---|---|
| Render (`backend-api-production`) | CPU compartida, 512MB RAM | Métricas de uso en el dashboard de Render (memoria/CPU) |
| Neon (`main`) | Límite de almacenamiento y horas de cómputo activo/mes | Panel de uso de Neon (Usage) |
| EAS | Builds nativos por mes | El flujo de `EAS Update` (OTA) ya diseñado en `260908` minimiza el consumo de builds nativos |

No se configura ninguna alerta automática sobre estos techos (consistente con la ausencia de plataforma de monitoreo de pago) — la revisión, si el volumen de rutas creciera de forma significativa, es una acción operativa manual de Carlos, no parte de este despliegue.

## Resumen

| ID | Diseño |
|---|---|
| NFR-D8.1 / NFR-D8.2 | Instancia única de Render, sin balanceador, sin prueba de carga |
| NFR-D9.1-D9.4 | Techos documentados por proveedor; revisión manual si el volumen crece, sin alerta automática |
