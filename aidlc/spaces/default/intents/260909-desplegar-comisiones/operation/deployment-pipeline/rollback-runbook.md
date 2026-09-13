# Deployment Pipeline — Rollback Runbook

## Sources

- [upstream:reliability-design] `construction/nfr-design/reliability-design.md` (diseño original de rollback, NFR-D11)
- [upstream:deployment-strategy] `deployment-strategy.md` (esta etapa)

## Cuándo se ejecuta este runbook

Después de cualquiera de los dos smoke tests de la secuencia de despliegue (contra staging o contra
producción, `deployment-strategy.md` § Matriz de promoción) falla — es decir, el login no funciona o
el monto de comisión calculado para el caso de prueba fijo no coincide exactamente con el valor
esperado documentado de antemano (`reliability-design.md` § caso de prueba fijo).

**`project.md` § Forbidden ya registra**: nunca se ejecuta un rollback automático sin notificar a
Carlos — este runbook es manual de principio a fin, ejecutado por Carlos.

## Paso a paso — rollback de `backend-api`

1. Confirmar que el fallo es real (repetir el smoke test una vez más para descartar un error
   transitorio de red, no del backend).
2. Entrar al dashboard de Render → servicio afectado (`backend-api-staging` o
   `backend-api-production`) → pestaña **Deploys**.
3. Ubicar el último deploy marcado como exitoso *antes* del que falló.
4. Presionar **Redeploy** sobre ese deploy anterior (no requiere cambio de código; Render
   reconstruye y sirve exactamente ese build previo).
5. Esperar a que el health check (`GET /api/v1/health`) reporte el servicio arriba.
6. Repetir el smoke test contra el servicio ya revertido — debe pasar antes de considerar el
   rollback completo.
7. Registrar en el canal de comunicación habitual con el equipo (o como nota interna, dado que
   Carlos es el único titular) qué deploy falló y a cuál se revirtió.

## Paso a paso — rollback de `mobile-app`

Aplica únicamente si el fallo está en la app móvil y no en el backend (por ejemplo: la app no llama
correctamente a la API tras un cambio de cliente, aunque el backend responda bien por su cuenta).

1. Confirmar que el backend correspondiente (staging o producción) está sano — si el fallo es del
   backend, seguir el runbook de arriba en su lugar, no este.
2. Ejecutar `eas update:republish` apuntando al update anterior del canal afectado (`preview` o
   `production`).
3. Esto revierte la actualización OTA sin generar un build nativo nuevo — los dispositivos reciben
   la versión anterior en su siguiente arranque.
4. Repetir el smoke test relevante para confirmar que la reversión resolvió el problema.

## Por qué nunca hay riesgo de incompatibilidad de esquema

Las migraciones de Prisma de este primer despliegue son exclusivamente aditivas (nueva
columna/tabla, nunca `DROP` ni rename destructivo — ya decidido en `reliability-design.md`). Esto
garantiza que un rollback de código de `backend-api` nunca deja el servicio corriendo contra un
esquema de base de datos con el que ya no es compatible: el esquema más nuevo sigue siendo válido
para el código anterior, porque no se removió ni renombró nada.

## Puntos de contacto

Titular único de las cuentas y ejecutor único de este runbook: **Carlos Puma**. No hay escalamiento
a un segundo responsable — el equipo de este proyecto es de una sola persona con acceso a la
infraestructura real (`team.md` §5, RBAC a nivel de infraestructura). Si Carlos no puede resolver el
rollback por sí mismo (por ejemplo, un incidente en la plataforma de Render o Neon, no en el propio
despliegue), el canal de soporte es el de cada proveedor (Render support, Neon support), no un
proceso interno de escalamiento — no aplica un ADR de incident-response con múltiples niveles dado
el tamaño de este proyecto.

## Resumen

| Componente | Mecanismo | Automático o manual | Precondición ya garantizada |
|---|---|---|---|
| `backend-api` (staging o producción) | Redeploy del build anterior en Render | Manual | Sin cambios destructivos de esquema entre versiones |
| `mobile-app` (preview o production) | `eas update:republish` al update anterior | Manual | N/A (revierte solo JS/TS, no requiere build nativo) |
