# Build and Test — Build Instructions

## Sources

- [upstream:code-generation-plan] `construction/api-contract/code-generation/code-generation-plan.md`
- [upstream:code-generation-plan] `construction/backend-api/code-generation/code-generation-plan.md`
- [upstream:code-generation-plan] `construction/mobile-app/code-generation/code-generation-plan.md`
- [upstream:code-summary] `construction/api-contract/code-generation/code-summary.md`
- [upstream:code-summary] `construction/backend-api/code-generation/code-summary.md`
- [upstream:code-summary] `construction/mobile-app/code-generation/code-summary.md`

Monorepo raíz: npm workspaces (`packages/*`), sin `package-lock.json` por paquete — uno solo en la raíz.

## Instalación de dependencias

Desde la raíz del monorepo:

```
npm install
```

Instala las 3 workspaces (`packages/api-contract`, `packages/backend-api`, `packages/mobile-app`) en un único árbol `node_modules/` compartido.

## Configuración de entorno

- **api-contract**: sin variables de entorno — es un paquete de contrato puro (OpenAPI + tipos generados), sin llamadas de red en build/test.
- **backend-api**: requiere `DATABASE_URL` (cadena de conexión de Neon Postgres) y `JWT_SECRET` en tiempo de ejecución real (`env.validation.ts` los valida al arrancar). Las pruebas unitarias mockean `PrismaClient`, por lo que **no** requieren una base de datos real ni estas variables para pasar — ver `unit-test-instructions.md` de la unidad. `prisma generate` sí requiere red saliente hacia `binaries.prisma.sh` (ver limitación documentada abajo).
- **mobile-app**: `EXPO_PUBLIC_API_BASE_URL` (u otra variable equivalente resuelta vía `app.config.ts` → `extra.apiBaseUrl`) para apuntar al backend real; las pruebas con `jest-expo` no requieren un simulador ni esta variable.

## Comandos de build

| Unidad | Comando | Resultado esperado |
|---|---|---|
| api-contract | `npm run build --workspace=packages/api-contract` | Regenera `src/types.ts` desde `openapi/openapi.yaml` y compila con `tsc -p tsconfig.json` |
| backend-api | `npm run build --workspace=packages/backend-api` | `npm run prisma:generate && nest build` — ver limitación conocida abajo |
| mobile-app | `npm run typecheck --workspace=packages/mobile-app` | `tsc --noEmit` (React Native/Expo no tiene un paso de "build" de servidor; el build real de la app ocurre vía EAS, fuera del alcance de esta etapa) |

## Verificación de build

- api-contract: verificar que `src/types.ts` se regeneró y que `tsc` termina con exit 0.
- backend-api: verificar que `dist/` se generó (via `nest build`) con exit 0.
- mobile-app: verificar que `tsc --noEmit` termina con exit 0 (sin salida = sin errores).

## Limitación conocida y verificada — build de backend-api

`npm run build --workspace=packages/backend-api` falla en el prestep `prisma generate`: el entorno de este sandbox bloquea la descarga del engine de Prisma (`binaries.prisma.sh`, 403 Forbidden — política de red del entorno, no un fallo de la aplicación). **Verificado independientemente en esta etapa** (reproducido el mismo 403). El build real de NestJS (`npx nest build`, evitando el prestep bloqueado) se verificó exitoso: exit 0, `dist/` generado correctamente. Ver `code-generation/code-summary.md` § Desviaciones y el hallazgo R-01 de `code-generation-plan.md` (Status: `Unresolved`, acción requerida antes de cualquier despliegue real: `npx prisma generate` con acceso de red real).

## Solución de problemas comunes

- **`prisma generate` falla con 403**: limitación de red del entorno sandbox, no del código — usar `npx nest build` directo para verificar la compilación, y ejecutar `prisma generate` en CI o en el entorno de despliegue real (con egress habilitado) antes de construir la imagen de producción.
- **`eslint` falla con "couldn't find eslint.config.js"**: `packages/mobile-app` no tiene un archivo de configuración de ESLint v9+ (`eslint.config.js`) — brecha preexistente ya documentada en `code-summary.md` de `mobile-app` (sin paso de lint en el monorepo). No bloquea esta etapa: el sensor `linter` está intencionalmente excluido de Build and Test (ver `build-and-test.md` § Sensors). Queda como acción pendiente antes de CI Pipeline.
