# NFR Design — mobile-app — Diseño de Rendimiento

## Sources

- [upstream:performance-requirements] `construction/mobile-app/nfr-requirements/performance-requirements.md`
- [upstream:functional-spec] `construction/mobile-app/functional-design/functional-spec.md`
- [Q1] `nfr-design-questions.md`

## Feedback optimista (NFR1.5)

Cada acción de red pasa por una mutación de TanStack Query (Q1): el hook de la mutación setea su propio estado `isPending` de forma síncrona en el mismo tick del `onPress` — React ya re-renderiza el botón en `loading` antes de que la promesa de la llamada HTTP resuelva, satisfaciendo el objetivo de <100ms sin lógica adicional escrita a mano.

```
// pseudocódigo, ≤15 líneas
const mutation = useMutation({
  mutationFn: saveSale,
  onMutate: () => { /* opcional: actualizar UI local de inmediato */ },
  onSuccess: () => queryClient.invalidateQueries(['commission', 'current']),
})
<PrimaryButton loading={mutation.isPending} onPress={() => mutation.mutate(input)} />
```

## Invalidación de la consulta de comisión (AC5.3.1, MW4 paso 4)

`GET /api/v1/commission/current` se registra como una query de TanStack Query bajo la clave `['commission', 'current']`. Tanto la mutación de MW6 (guardar venta con conexión) como la de MW8 (sincronización) invalidan esa clave en su `onSuccess` — Home vuelve a pedir el dato automáticamente en cuanto cualquiera de las dos mutaciones se completa, sin que el vendedor tenga que refrescar manualmente ni que exista un estado global escrito a mano para ese propósito.

## Estados de carga (NFR1.6)

Cada pantalla con datos remotos (V2, V4, A2, A4) usa el propio `isLoading`/`isPending`/`isError` que TanStack Query expone para su query — no se implementa una máquina de estados de carga paralela; `SkeletonCard`/`SkeletonListItem` se muestran mientras `isLoading` es verdadero.

## Transformaciones en cliente (NFR1.7)

La agrupación de notificaciones por tipo (V5) y el conteo de `pending_sales` (V2) se calculan con `useMemo` sobre el resultado ya cacheado por TanStack Query — evita recomputar en cada render sin necesidad de una capa de estado adicional.

## Assumptions & Open Questions

None.
