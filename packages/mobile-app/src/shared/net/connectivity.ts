import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

// connectivity.ts — wrapper de @react-native-community/netinfo (Q3 de functional-spec.md).
// Listener global montado en el layout raíz de la app (app/); expone tanto el estado actual
// como un suscriptor de transiciones sin-conexión → con-conexión, que dispara la
// sincronización automática de MW8.

export function isConnected(state: NetInfoState | null): boolean {
  if (!state) return false;
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export async function getCurrentConnectivity(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return isConnected(state);
}

/**
 * Suscribe a transiciones de sin-conexión a con-conexión (no a cada cambio de estado).
 * Retorna una función de desuscripción.
 */
export function onReconnect(callback: () => void): () => void {
  let wasConnected: boolean | null = null;
  const unsubscribe = NetInfo.addEventListener((state) => {
    const nowConnected = isConnected(state);
    if (wasConnected === false && nowConnected) {
      callback();
    }
    wasConnected = nowConnected;
  });
  return unsubscribe;
}
