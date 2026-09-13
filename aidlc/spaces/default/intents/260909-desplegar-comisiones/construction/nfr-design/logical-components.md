# NFR Design — Despliegue a Producción — Logical Components

## Sources

- [upstream:logical-components-260908-backend] `260908-calculadora-comisiones-m/construction/backend-api/nfr-design/logical-components.md`
- [upstream:infrastructure-specification-260908] `260908-calculadora-comisiones-m/construction/backend-api/infrastructure-design/infrastructure-specification.md`
- [upstream:team-practices] `inception/practices-discovery/team-practices.md` (tabla de mapeo de nombres de ambiente)

No se agrega ningún componente lógico de aplicación nuevo — `backend-api` sigue siendo el único proceso NestJS ya diseñado en `260908` (ver su `logical-components.md` para los módulos internos por dominio). Este documento mapea ese inventario de aplicación a los recursos físicos de despliegue, sirviendo de puente directo hacia Infrastructure Design.

## Inventario de componentes físicos de despliegue

| Componente físico | Ambiente `staging` | Ambiente `production` | Origen |
|---|---|---|---|
| Servicio backend (Render Web Service) | `backend-api-staging` | `backend-api-production` | FR2.2 |
| Base de datos (rama Neon) | `staging` | `main` | FR2.1 |
| Distribución móvil (canal/perfil EAS) | `preview` | `production` | FR2.3 |
| Secretos (GitHub Environment) | `staging` | `production` | FR2.4 |

## Límites de falla a nivel de infraestructura

| Componente físico | Si falla... | Radio de impacto |
|---|---|---|
| `backend-api-production` (Render) | Ningún endpoint responde | Total — no hay redundancia de instancia en el MVP (`scalability-design.md`) |
| Neon `main` | El backend no puede leer/escribir ningún dato | Total — es la única base de datos, sin réplica propia gestionada por este intent |
| Canal `production` de EAS | Las actualizaciones OTA no llegan a los dispositivos | Acotado — la app ya instalada sigue funcionando con el último build/update recibido, solo se detienen las actualizaciones futuras |
| GitHub Environment `production` (secretos) | Un despliegue nuevo no puede leer sus secretos y falla el workflow | Acotado al momento del despliegue — no afecta el servicio ya corriendo |

Este mapeo es consistente con `logical-components.md` de `260908`: un fallo catastrófico de `backend-api-production` o de Neon `main` afecta a todos los módulos de aplicación por igual, porque comparten el mismo proceso y la misma conexión — no hay aislamiento de proceso ni de base de datos entre componentes de dominio en este despliegue, igual que ya se documentó en Construction.

## Recursos compartidos entre ambientes

- **Ninguno** — `staging` y `production` no comparten base de datos, secretos, ni servicio de Render; esto es intencional (NFR-D4) para que un problema en `staging` nunca afecte a `production` ni viceversa.
- El único recurso compartido dentro de cada ambiente es el mismo que ya documentó `260908`: un `PrismaClient` singleton por proceso, un `AuthGuard`/`RolesGuard` globales, y un `LoggingInterceptor` global — todos a nivel de aplicación, sin cambio en este intent.

## Puente hacia Infrastructure Design

Este inventario es la entrada directa de la siguiente etapa (Infrastructure Design): cuatro pares de recursos físicos (Render × 2, Neon × 2 ramas, EAS × 2 perfiles, GitHub Environments × 2) que Infrastructure Design convierte en instrucciones de aprovisionamiento paso a paso para Carlos, sin introducir ningún recurso físico adicional a los ya listados aquí.
