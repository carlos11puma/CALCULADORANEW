# Infrastructure Design — mobile-app — Preguntas

## Sources

- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [upstream:tech-stack-decisions] `construction/mobile-app/nfr-requirements/tech-stack-decisions.md`
- [upstream:team-rules] `aidlc/spaces/default/memory/team.md`

## Q1 — Perfiles de EAS Build

¿Qué perfiles de EAS Build se configuran?

- A. `development`/`preview`/`production` — development para probar en dispositivo con Expo Dev Client, preview para builds internos de QA/Carlos, production para el build final.
- B. Un solo perfil (`production`) — más simple pero sin build de desarrollo separado.
- C. No estoy seguro — que Infrastructure Design proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. development/preview/production

## Q2 — Distribución interna

`unit-of-work.md` ya fija "distribución vía Expo/EAS interno para el MVP, sin publicación en tiendas públicas". ¿Cómo reciben los ~26 vendedores/Carlos el build?

- A. EAS Internal Distribution — build `.apk`/`.ipa` firmado distribuido vía link/QR de Expo, sin cuenta de desarrollador de Apple/Google ni revisión de tienda, dentro del free tier de EAS.
- B. TestFlight (iOS) + Play Internal Testing (Android) — requiere cuentas de desarrollador pagas y procesos de revisión.
- C. No estoy seguro — que Infrastructure Design proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. EAS Internal Distribution

## Q3 — Actualizaciones OTA

¿Cómo se entregan cambios de JS/TS (sin cambios nativos) a los vendedores ya instalados?

- A. EAS Update (OTA) — se publican y llegan automáticamente al abrir la app, sin reinstalar; solo se necesita un nuevo build cuando cambia código nativo.
- B. Reinstalar build completo en cada cambio — exige reinstalación manual por cada vendedor.
- C. No estoy seguro — que Infrastructure Design proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. EAS Update (OTA)

## Q4 — CI/CD

¿Qué dispara un nuevo build/update?

- A. GitHub Actions dispara EAS Build/Update — push a `main` con cambios nativos dispara `eas build` (perfil `preview`); push con solo cambios JS dispara `eas update`.
- B. Build/Update manual desde la terminal de Carlos — sin pipeline.
- C. No estoy seguro — que Infrastructure Design proponga y justifique la opción por defecto (A).
- X. Other (please specify)

[Answer]: A. GitHub Actions dispara EAS Build/Update

## Consolidated Summary Confirmation

Al confirmar, se registran las siguientes decisiones para `mobile-app`:
1. Perfiles EAS: development/preview/production.
2. Distribución interna vía EAS Internal Distribution (link/QR), sin tiendas públicas.
3. Actualizaciones JS/TS vía EAS Update (OTA); nuevo build solo si cambia código nativo.
4. GitHub Actions dispara `eas build`/`eas update` automáticamente según el tipo de cambio.

- A. Looks correct
- B. Needs changes

[Answer]: Looks correct
