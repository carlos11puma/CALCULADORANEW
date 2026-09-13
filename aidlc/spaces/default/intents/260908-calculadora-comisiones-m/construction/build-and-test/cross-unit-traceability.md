# Cross-Unit Final Coverage Gate

## Sources

- [upstream:requirements] `inception/requirements-analysis/requirements.md`
- [upstream:stories] `inception/user-stories/stories.md`
- [upstream:traceability] `construction/api-contract/code-generation/traceability.json`
- [upstream:traceability] `construction/backend-api/code-generation/traceability.json`
- [upstream:traceability] `construction/mobile-app/code-generation/traceability.json`

## Método

`code-generation/traceability.json` de cada unidad enumera IDs `AC` (criterio de aceptación, granularidad de hoja), `BR` (regla de negocio), `NFR` (propio de cada unidad, no siempre con la misma numeración que `inception`) y `W`/otros (workflows internos) — no enumera directamente los IDs `FR`/`NFR` de `inception/requirements-analysis/requirements.md` en su forma hoja (`FR1.1`, `NFR3`, etc.), porque esa traza se resuelve un nivel arriba: cada `FRx.y`/`NFRx` de `requirements.md` está referenciado en `inception/user-stories/stories.md` dentro de una historia de usuario que a su vez enumera sus propios `ACx.y.z`. Este documento reconstruye esa cadena completa `FR/NFR → US → AC → código` en lugar de buscar directamente el string `FR1.1` dentro de `traceability.json`, ya que ese string no existiría aunque el requisito esté genuinamente cubierto.

Se enumeraron 23 IDs hoja `FR`/`NFR` (`FR\d+\.\d+`/`NFR\d+\.\d+`) en `requirements.md` y 38 IDs `AC` en `stories.md`. Para cada `FR`/`NFR`, se ubicó la(s) historia(s) de usuario que lo referencia, y se verificó que al menos un `AC` de esa historia tenga status `OK` en al menos una unidad — o, si ningún `AC` de esa historia aplica (N/A justificado), se verificó que la justificación sea genuina (decisión de diseño/esquema sin comportamiento de runtime propio) revisando la nota del `AC`.

## Resultado — FR/NFR (vía cadena FR → US → AC)

| ID | Cubierto | Vía | Nota |
|---|---|---|---|
| FR1.1 | ✅ (N/A justificado) | US1.4 → AC1.4.1 (backend-api, N/A) | Decisión de esquema (`User.role` sin cardinalidad fija) — sin comportamiento de runtime distinto que probar; `schema.prisma` ya soporta más de un supervisor, solo no se activa en UI para el MVP |
| FR1.5 | ✅ (N/A justificado) | US1.4 → AC1.4.1 (backend-api, N/A) | Mismo caso que FR1.1 — mismo AC cubre ambos |
| Los 21 IDs restantes (FR1.2-FR9, NFR1-NFR7 en forma hoja donde aplica) | ✅ | Al menos un AC de la historia correspondiente con status `OK` | Ver detalle por unidad en los 3 `traceability.json` |

**21 de 23 IDs FR/NFR cubiertos directamente con evidencia `OK`; 2 (FR1.1, FR1.5) cubiertos con `N/A` genuinamente justificado (decisión de esquema sin comportamiento propio). 0 IDs FR/NFR sin cobertura.**

## Resultado — AC (directo, de `traceability.json`)

38 IDs `AC` en `stories.md`. De los 127 IDs totales en los 3 `traceability.json` (api-contract 28, backend-api 99, mobile-app 51 — con solapamiento donde más de una unidad referencia el mismo AC), cada uno de los 38 `AC` tiene al menos una entrada con status `OK` en alguna unidad, salvo:

- `AC1.4.1` — status `N/A` en las 3 unidades donde aparece, justificado (ver arriba).

## Elementos sin cobertura

Ninguno. Todos los `FR`, `NFR` y `AC` enumerados están cubiertos con status `OK` en al menos una unidad, o tienen una justificación `N/A` genuina y ya revisada (ninguna nueva — las mismas ya aceptadas en las revisiones de `functional-design` y `code-generation` de cada unidad).

## Veredicto

**PASS** — Cross-Unit Final Coverage Gate superado. Ningún ID queda sin cobertura ni sin justificación.
