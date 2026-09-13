# Infrastructure Design — mobile-app — Especificación de Infraestructura

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:tech-stack-decisions] `construction/mobile-app/nfr-requirements/tech-stack-decisions.md`
- [Q1] [Q2] `infrastructure-design-questions.md`

## Deployment

| Aspecto | Valor |
|---|---|
| Modelo | Standalone — distribución vía Expo/EAS interno, sin publicación en tiendas públicas (ya fijado en `unit-of-work.md`) |
| Build | EAS Build, 3 perfiles: `development` (Expo Dev Client, dispositivo de desarrollo), `preview` (build interno para QA/Carlos), `production` (build final para distribución a los ~26 vendedores) |
| Distribución | EAS Internal Distribution — link/QR firmado, sin cuenta de desarrollador de Apple/Google |
| Actualizaciones | EAS Update (OTA) para cambios de JS/TS sin tocar código nativo; nuevo build de EAS solo cuando cambia una dependencia nativa, un permiso, o la configuración de `app.json` que afecta al binario |

## Infrastructure Services

| Servicio | Proveedor | Capa | Notas |
|---|---|---|---|
| EAS Build | Expo Application Services | Free tier | Volumen esperado (~26 rutas, builds poco frecuentes dado el flujo OTA) se mantiene dentro del límite gratuito de builds/mes — heredado del mandato de `project.md` ("priorizar capas gratuitas de infraestructura") |
| EAS Update | Expo Application Services | Free tier | Publicación de actualizaciones OTA — mismo tier gratuito |
| EAS Internal Distribution | Expo Application Services | Free tier | Sin costo adicional sobre el mismo plan de EAS |

## Shared Infrastructure

- Ninguna — `mobile-app` no comparte infraestructura de ejecución con `backend-api` (son unidades `standalone` independientes por `unit-of-work.md`); la única dependencia compartida es lógica: el contrato de API de `api-contract`, no un recurso de infraestructura.

## Assumptions & Open Questions

None.
