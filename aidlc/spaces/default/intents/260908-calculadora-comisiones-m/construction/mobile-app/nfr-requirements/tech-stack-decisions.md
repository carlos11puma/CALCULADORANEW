# NFR Requirements — mobile-app — Decisiones de Stack Técnico

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md` (NFR5, NFR6, NFR7)
- [upstream:unit-of-work] `inception/units-generation/unit-of-work.md`
- [Q1] [Q3] [Q4] `nfr-requirements-questions.md`
- [Q1]-[Q5] `construction/mobile-app/functional-design/functional-design-questions.md`

| Decisión | Elección | Justificación | Alternativas consideradas |
|---|---|---|---|
| Compatibilidad de plataforma (NFR5) | Android 8+ / iOS 13+ | Cobertura amplia de dispositivos de gama media/baja realista para vendedores de ruta, compatible con las APIs nativas que usan `expo-sqlite`/`expo-notifications`/`expo-secure-store` (Q4) | Solo versiones muy recientes (Android 12+/iOS 16+) — descartado por excluir dispositivos de campo más antiguos sin beneficio claro para este MVP |
| Framework de UI | React Native + Expo (managed workflow) | Ya fijado en `unit-of-work.md`; Expo/EAS permite distribución interna sin publicación en tiendas (decisión de Units Generation) dentro de la capa gratuita (NFR6) | React Native CLI puro (bare) — descartado, mayor complejidad de build nativo sin necesidad de código nativo custom en el MVP |
| Sistema de diseño | React Native Paper (Material Design 3) | Ya fijado en `design-system-mapping.md` de Refined Mockups | Componentes propios — descartado por costo, dado el presupuesto mínimo/gratuito (NFR6) |
| Almacenamiento local de ventas pendientes | `expo-sqlite` | Ya fijado en Functional Design (Q1) — consultas estructuradas sobre múltiples días pendientes | `AsyncStorage` con JSON — descartado, menos apto para un conjunto que puede crecer a varios días |
| Detección de conectividad | `@react-native-community/netinfo` | Ya fijado en Functional Design (Q3) | Detección reactiva solo por fallo HTTP — descartado, no detecta reconexión proactivamente |
| Notificaciones push | `expo-notifications` | Ya fijado en Functional Design (Q4); integra con el servicio de push de `backend-api` (Expo Push, per `unit-of-work.md` § U2) sin requerir configuración nativa de FCM/APNs separada en el MVP | Integración directa con FCM/APNs — descartado, mayor complejidad de configuración nativa sin beneficio adicional dado que `backend-api` ya decidió Expo Push como su servicio de envío |
| Almacenamiento de sesión | `expo-secure-store` | Ya fijado en Functional Design (Q5) — cifrado nativo apropiado para un token de larga duración (NFR3.16) | `AsyncStorage` sin cifrar — descartado por riesgo de seguridad |
| Seguridad de transporte | HTTPS con validación TLS estándar del SO, sin certificate pinning | Q2 de esta etapa — suficiente para el riesgo/volumen del MVP | Certificate pinning — descartado, complejidad operativa desproporcionada |
| Cifrado de almacenamiento local | Cifrado de archivo del SO (sin capa adicional tipo SQLCipher) | Q3 de esta etapa | SQLCipher — descartado, dependencia nativa adicional para un dato de bajo volumen y sensibilidad relativa menor que el token |
| Costo de infraestructura del cliente (NFR6) | Expo/EAS free tier para build/distribución interna | Hereda el mandato de `project.md` ("priorizar capas gratuitas de infraestructura") — el volumen de distribución interna (~26 rutas) se mantiene dentro de los límites gratuitos de EAS Build/Update para el MVP | EAS plan de pago — innecesario al volumen actual, revisar si el equipo de vendedores crece significativamente |

`NFR7` (escalabilidad del modelo de datos para múltiples supervisores) es responsabilidad exclusiva de `backend-api` — no tiene una decisión de stack propia en `mobile-app` (ver `traceability.json`).

## Assumptions & Open Questions

None.
