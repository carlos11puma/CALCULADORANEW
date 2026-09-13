import { listPendingSales, deletePendingSale, markPendingSaleRejected } from "../../shared/storage/pendingSalesDb";
import { postSalesSync } from "./api";

// syncEngine.ts — motor de sincronización de MW8 (functional-spec.md). Se dispara en
// reconexión (net/connectivity.ts, onReconnect) y también al arrancar la app si ya hay
// conexión disponible (cierra R-03 de la revisión de functional-design.md).

export interface SyncOutcome {
  appliedCount: number;
  rejectedCount: number;
  skipped: boolean; // true si no había filas pendientes, o si ya había una sincronización en vuelo
}

// Guarda contra sincronización duplicada en vuelo (cierra R-02 de la revisión de
// functional-design.md): descarta un segundo disparo mientras el primero no haya resuelto.
// Una entrada por vendorId, para no bloquear la sincronización de un vendedor por la de otro
// en el caso (poco probable) de que el proceso maneje más de una sesión.
const inFlight = new Set<string>();

export async function runSync(vendorId: string): Promise<SyncOutcome> {
  // La bandera se fija de forma síncrona, antes de cualquier `await`, para que un segundo
  // disparo llamado inmediatamente después del primero (sin esperarlo) sea descartado de
  // verdad — si el `add` ocurriera después de un `await`, ambos disparos pasarían la
  // verificación `has` antes de que ninguno alcance a marcar la bandera (cierra R-02 de la
  // revisión de functional-design.md).
  if (inFlight.has(vendorId)) {
    return { appliedCount: 0, rejectedCount: 0, skipped: true };
  }
  inFlight.add(vendorId);
  try {
    const pending = await listPendingSales(vendorId);
    if (pending.length === 0) {
      return { appliedCount: 0, rejectedCount: 0, skipped: true };
    }

    const results = await postSalesSync(
      pending.map((row) => ({ saleDate: row.saleDate, amount: row.amount, returns: row.returns })),
    );

    let appliedCount = 0;
    let rejectedCount = 0;
    for (const result of results) {
      if (result.status === "applied") {
        await deletePendingSale(vendorId, result.saleDate);
        appliedCount += 1;
      } else {
        await markPendingSaleRejected(vendorId, result.saleDate, result.error?.code ?? "REJECTED");
        rejectedCount += 1;
      }
    }
    return { appliedCount, rejectedCount, skipped: false };
  } finally {
    // Si la sincronización en sí falla por red (no llegó a completarse), pending_sales no
    // cambia y se reintenta en el próximo evento de reconexión o al reabrir la app — sin
    // acción del vendedor (MW8 paso 4). La bandera siempre se libera para permitir ese
    // reintento futuro.
    inFlight.delete(vendorId);
  }
}

/** Solo para pruebas: limpia el estado de sincronización en vuelo entre casos. */
export function __resetSyncStateForTests(): void {
  inFlight.clear();
}
