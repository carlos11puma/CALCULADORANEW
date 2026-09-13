import AsyncStorage from "@react-native-async-storage/async-storage";

// returnRateTrend.ts — cálculo del indicador de tendencia de devolución de V2 Home
// (frontend-components.md § V2: `returnRateTrend: 'up'|'down'|'flat'`).
//
// Cierra R-04 de la revisión de functional-spec.md: la especificación original solo compara
// contra el valor visto en la misma sesión en memoria, por lo que el badge no podría mostrarse
// en la primera apertura de una nueva sesión de la app aunque el indicador hubiera mejorado
// desde la última vez que el vendedor lo vio. Se resuelve persistiendo el último `returnRate`
// visto en `AsyncStorage` (ya dependencia del workspace), por vendedor — así el badge funciona
// también en la primera carga tras reabrir/reinstalar la app.

export type ReturnRateTrend = "up" | "down" | "flat";

const STORAGE_KEY_PREFIX = "last_return_rate_seen:";

/**
 * Compara `currentReturnRate` contra el último valor persistido para `vendorId` y persiste el
 * valor actual para la próxima comparación. "down" significa mejora (menor tasa de devolución,
 * el badge ▼ de mockups.md); "up" significa que empeoró; "flat" cuando no cambió o no hay un
 * valor previo con qué comparar (primera apertura).
 */
export async function computeReturnRateTrend(
  vendorId: string,
  currentReturnRate: number,
): Promise<ReturnRateTrend> {
  const key = `${STORAGE_KEY_PREFIX}${vendorId}`;
  const previousRaw = await AsyncStorage.getItem(key);
  await AsyncStorage.setItem(key, String(currentReturnRate));

  if (previousRaw === null) {
    return "flat";
  }
  const previous = Number(previousRaw);
  if (Number.isNaN(previous) || previous === currentReturnRate) {
    return "flat";
  }
  return currentReturnRate < previous ? "down" : "up";
}

/** Solo para pruebas: limpia el valor persistido de un vendedor. */
export async function __clearReturnRateTrendForTests(vendorId: string): Promise<void> {
  await AsyncStorage.removeItem(`${STORAGE_KEY_PREFIX}${vendorId}`);
}
