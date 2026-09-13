# NFR Requirements — mobile-app — Preguntas

## Sources

- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`
- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:contract-summary] `inception/contract-design/contract-summary.md`
- [upstream:project-mandated] `aidlc/spaces/default/memory/project.md`

## Q1 — Rendimiento percibido en cliente (NFR1)

`backend-api` ya garantiza <2s de extremo a extremo (NFR1.1-1.4 de su propio `nfr-requirements`). ¿La UI debe mostrar retroalimentación optimista inmediata (navegación/spinner en <100ms al tocar un botón) independientemente de la latencia del backend?

- A. Sí, feedback optimista <100ms — todo botón de acción muestra su estado loading/spinner de inmediato al tocarse, sin esperar la respuesta HTTP.
- B. No, esperar la respuesta real — la UI solo cambia de estado cuando llega la respuesta HTTP.
- C. No estoy seguro — que NFR Requirements proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. Sí, feedback optimista <100ms

## Q2 — Seguridad de transporte (NFR3)

¿Se usa certificate pinning para las llamadas HTTPS a `backend-api`, además de la validación TLS estándar?

- A. No, TLS estándar del sistema — suficiente para el volumen/riesgo del MVP, evita el costo de mantener pines al rotar certificados.
- B. Sí, certificate pinning — mayor protección contra MITM pero agrega complejidad operativa desproporcionada al presupuesto mínimo.
- C. No estoy seguro — que NFR Requirements proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. No, TLS estándar del sistema

## Q3 — Integridad de datos offline (NFR4)

La tabla local `pending_sales` (`expo-sqlite`) contiene montos de venta — dato de negocio protegido según `project.md` ("proteger datos de comisión/salario con credenciales cifradas"). ¿Se cifra la base de datos local en reposo?

- A. Cifrado a nivel de SO es suficiente — iOS/Android cifran el almacenamiento del dispositivo por defecto; no se agrega SQLCipher u otra capa extra. El token de sesión sí usa `expo-secure-store` (Q5 de Functional Design) por ser la credencial más sensible.
- B. Cifrar la base local con SQLCipher — capa adicional de cifrado sobre el archivo SQLite.
- C. No estoy seguro — que NFR Requirements proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. Cifrado a nivel de SO es suficiente

## Q4 — Compatibilidad (NFR5)

¿Versiones mínimas de Android/iOS a soportar?

- A. Android 8+ / iOS 13+ — cobertura amplia de dispositivos de gama media/baja, compatible con las APIs que usan `expo-sqlite`/`expo-notifications`/`expo-secure-store`.
- B. Solo versiones muy recientes (Android 12+/iOS 16+) — menor superficie de prueba pero excluye dispositivos más antiguos en campo.
- C. No estoy seguro — que NFR Requirements proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. Android 8+ / iOS 13+

## Consolidated Summary Confirmation

Al confirmar, se registran las siguientes decisiones para `mobile-app`:
1. Feedback optimista <100ms en toda acción de UI, independiente de la latencia real del backend.
2. TLS estándar del sistema, sin certificate pinning.
3. Sin cifrado adicional de la base local (`expo-sqlite`); se apoya en el cifrado de almacenamiento del SO. El token de sesión usa `expo-secure-store` (ya decidido en Functional Design).
4. Compatibilidad mínima: Android 8+ / iOS 13+.

- A. Looks correct
- B. Needs changes

[Answer]: Looks correct
