**Collaborator:** aidlc-devsecops-agent

# Revisión — Infrastructure Design (260909-desplegar-comisiones)

## Secretos y separación por ambiente

Confirmado: `infrastructure-specification.md` mantiene `sync: false` para `DATABASE_URL` y el JWT secret en ambos servicios de Render, y `cicd-pipeline.md` cierra el hallazgo de `publish-preview` sin `environment: staging` — sin ese cambio, un secreto de staging habría tenido que vivir como repository secret, violando directamente `project.md` § Forbidden ("NEVER guardar secretos de producción... como repository secret"; el mismo principio aplica a staging por `team.md` §3, "ningún secreto... se comparte"). Con la resolución propuesta, ambos Environments quedan simétricos en mecanismo (aunque asimétricos en required reviewer), lo cual es el diseño correcto.

## Gate de dependencias vulnerables

La resolución de `dependency-audit.yml` (mantener `continue-on-error: true` en el paso pero promover el job a required status check) es la combinación correcta: preserva la visibilidad no-alarmista que el equipo ya decidió en Practices Discovery, mientras cierra NFR-D17 sin reescribir el workflow. Verifiqué que el cambio propuesto es puramente de configuración de branch protection (Settings → Branch protection rules), no un cambio de código — consistente con que esta etapa es de diseño, no de ejecución.

## Auto-deploy asimétrico de Render

El diseño de auto-deploy activado solo para `backend-api-staging` y manual para `backend-api-production` (`cicd-pipeline.md` § Resolución 1) es un control de seguridad operacional válido — evita que un push a `main` despliegue directamente a producción sin que Carlos confirme el smoke test de staging primero. Es el equivalente funcional del required reviewer que ya protege `mobile-app`'s `publish-production`, adaptado a que Render (a diferencia de GitHub Environments) no tiene ese concepto nativo.

## Vulnerabilidades ya conocidas — no se resuelven en esta etapa

Confirmo que esta etapa no intenta resolver las vulnerabilidades críticas/altas ya conocidas de `260908` (1 crítica + 5 altas en `backend-api`, 1 crítica + 11 altas en `mobile-app`) — eso es correctamente el primer paso operativo de todo el intent (`team.md` §1, `project.md` § Mandated), anterior a cualquier aprovisionamiento real, no una decisión de diseño de infraestructura. No hay contradicción entre ambos documentos.

## Hallazgos

Ninguno bloqueante. No encontré secretos hardcodeados, ni bypass de autenticación/autorización, ni una superficie de ataque nueva introducida por los tres cambios propuestos.
