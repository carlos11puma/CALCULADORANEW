# NFR Design — mobile-app — Diseño de Seguridad

## Sources

- [upstream:security-requirements] `construction/mobile-app/nfr-requirements/security-requirements.md`
- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`
- [Q2] [Q4] `nfr-design-questions.md`

## Cliente HTTP e interceptores (NFR3.16, MW9)

Cliente Axios único (`apiClient`), instanciado con `baseURL` desde configuración de entorno de Expo.

```
// pseudocódigo, ≤15 líneas
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('session_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      await SecureStore.deleteItemAsync('session_token')
      navigateToLogin({ reason: 'session_expired' }) // MW9
    }
    return Promise.reject(error)
  }
)
```

El interceptor de response es el único punto donde se implementa MW9 (logout silencioso) — ninguna pantalla individual maneja el 401 por su cuenta, evitando que la lógica de sesión quede duplicada o inconsistente entre pantallas.

## Enforcement de HTTPS (cierra R-01 de NFR Requirements)

- **Android**: `app.json`/`app.config.ts` de Expo declara `android.usesCleartextTraffic: false` — el sistema operativo rechaza cualquier intento de conexión HTTP plano a nivel de red, sin depender de que el código de la app nunca construya una URL `http://` por error.
- **iOS**: no se agrega ninguna excepción `NSAppTransportSecurity`/`NSAllowsArbitraryLoads` a la configuración de Expo — App Transport Security bloquea HTTP plano por defecto en iOS 13+ (rango de compatibilidad ya fijado en `tech-stack-decisions.md`, NFR5).

## Almacenamiento de sesión (NFR3.16)

`expo-secure-store` (Keychain en iOS, Keystore respaldado por hardware cuando el dispositivo lo soporta en Android) guarda únicamente `session_token`, `userId` y `role` — nunca `username`/`password`/`pin` una vez completado el login.

## Sin certificate pinning (NFR3.15)

El cliente Axios no configura ningún mecanismo de pinning; confía en la cadena de certificados validada por el sistema operativo — decisión ya justificada en `security-requirements.md`, sin diseño adicional necesario más allá de no agregar la dependencia.

## Assumptions & Open Questions

None.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-08T21:25:36Z
**Iteration:** 2
**Request Challenge:** review:b56dcf3841a4b3e2c07bd8f27ba231d3

### Nota de esta iteración (2)

Reapertura administrativa del gate: el único cambio de contenido desde la iteración 1 fue mecánico — completar la columna Status (antes vacía) de la tabla de Findings con el valor de enum válido `New`, requerido por el validador de `aidlc-review-brief.ts`. No hay cambio de sustancia en ningún hallazgo, en el veredicto, ni en el resto del documento. El veredicto READY y los hallazgos de la iteración 1 se confirman sin cambios — ver la tabla debajo.

### Historial — iteración 1

Date: 2026-09-08T17:06:22Z (revisión original, contenido sin cambios de sustancia)

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | § Cliente HTTP e interceptores, pseudocódigo | La exclusión del interceptor de response (`!error.config.url.includes('/auth/login')`) no cubre `POST /api/v1/auth/logout` — si ese endpoint devuelve 401 (token ya inválido al momento de cerrar sesión voluntariamente, MW3), el interceptor dispararía una navegación redundante a login justo después de que MW3 ya navegó allí por su cuenta | No bloquea: Code Generation debe excluir también `/auth/logout` de la condición del interceptor, ya que MW3 maneja su propia navegación sin necesidad de que el interceptor intervenga | New |
| R-02 | Minor | § Enforcement de HTTPS | `usesCleartextTraffic=false` se documenta como una entrada de `app.json`, pero su efectividad real bajo el *managed workflow* de Expo depende de la versión de Expo SDK fijada (algunas versiones requieren un config plugin explícito para que la propiedad se traduzca correctamente al manifiesto nativo generado por EAS Build) | No bloquea: Code Generation debe verificar contra la versión exacta de Expo SDK que se fije en el `package.json` de la unidad que la propiedad realmente se aplique al build nativo, agregando un config plugin si esa versión lo requiere | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `bun .claude/tools/aidlc-sensor-traceability.ts --output-path .../nfr-design/traceability.json --stage-slug nfr-design` | PASS: `{"pass":true,"gaps":[],"orphans":[],"missing_from_upstream_ids":[],"invalid_entries":[],"invalid_targets":[],"findings_count":0}` | Las 9 NFRx.y de `performance-requirements.md`/`security-requirements.md` están cubiertas (`OK` salvo `NFR4.3`, ya resuelta sin diseño técnico propio en `nfr-requirements`); `NFR1.1` (mención de prosa a un id de `backend-api`) queda explicada como `N/A` |
| Verificación cruzada `security-design.md` vs. `security-requirements.md` | PASS (manual) | Cada requisito (NFR3.14-3.17, NFR4.4) tiene un diseño técnico concreto correspondiente, ninguno queda sin abordar |

### Summary

El diseño de seguridad de `mobile-app` cierra R-01 de `nfr-requirements` (enforcement de HTTPS por configuración nativa) con un mecanismo concreto y centraliza el manejo de sesión/401 en un único interceptor, evitando lógica de sesión duplicada entre pantallas. Los dos hallazgos son refinamientos de detalle de implementación (exclusión de un endpoint adicional en el interceptor, verificación de compatibilidad de una propiedad de configuración con la versión exacta de Expo) — ninguno bloquea, verdict READY.
