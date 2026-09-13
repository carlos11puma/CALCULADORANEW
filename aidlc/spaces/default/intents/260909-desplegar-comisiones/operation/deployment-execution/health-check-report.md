# Deployment Execution — Reporte de Health Check (plantilla — sin ejecutar)

## Sources

- [upstream:reliability-design] `construction/nfr-design/reliability-design.md` (health check estándar, NFR-D12)
- [contexto: archivos reales del repo] `packages/backend-api/render.yaml` (`healthCheckPath: /api/v1/health`)

**Estado: plantilla, no ejecutado.** No hay ningún servicio real corriendo todavía.

## Qué valida este reporte

El único mecanismo de disponibilidad de este primer despliegue es el health check estándar de
`@nestjs/terminus` (`GET /api/v1/health`, ya construido en `260908`) — es lo único que Render
consulta para reiniciar el proceso si deja de responder. No se agrega monitoreo externo
(`reliability-design.md` § "disponible" para este despliegue).

## Checklist

| Servicio | Verificación | Resultado |
|---|---|---|
| `backend-api-staging` | `GET https://<url-real>.onrender.com/api/v1/health` responde 200 | _(pendiente)_ |
| `backend-api-production` | `GET https://<url-real>.onrender.com/api/v1/health` responde 200 | _(pendiente)_ |
| `backend-api-staging` | El dashboard de Render muestra el servicio como "Live" (no "Deploy failed") | _(pendiente)_ |
| `backend-api-production` | El dashboard de Render muestra el servicio como "Live" (no "Deploy failed") | _(pendiente)_ |

## Cold start — comportamiento esperado, no un fallo

Ya aceptado en `reliability-design.md`: en el free tier de Render, el servicio puede "dormir" tras
inactividad y demorar en responder al primer request tras despertar. Un health check que responde
200 después de una demora de cold start no es un fallo — es el comportamiento esperado y aceptado
para este proyecto (sin keep-alive, `performance-requirements.md` NFR-D2.2).

## Cómo continuar

Carlos completa esta tabla con las URLs reales una vez que Render asigna los servicios
(`environment-inventory.md` Paso 2) y confirma cada verificación como parte de la ejecución del
despliegue real.
