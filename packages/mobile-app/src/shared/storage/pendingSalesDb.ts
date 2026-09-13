import * as SQLite from "expo-sqlite";

// pendingSalesDb.ts — wrapper de expo-sqlite para la tabla local `pending_sales` (Q1 de
// functional-spec.md): ventas guardadas sin conexión, pendientes de sincronizar con
// POST /api/v1/sales/sync (MW7/MW8).
//
// Esquema: `pending_sales(vendorId TEXT, saleDate TEXT, amount REAL, returns REAL,
// createdAt TEXT, syncAttempts INTEGER, rejectedReason TEXT NULL, PRIMARY KEY (vendorId, saleDate))`.
// `vendorId` forma parte de la clave primaria por el hallazgo R-01 de la revisión de
// functional-design.md: defensa en profundidad de bajo costo si un dispositivo llega a
// compartirse entre dos vendedores (patrón de uso real: un dispositivo por vendedor).

const DB_NAME = "pending_sales.db";

export interface PendingSale {
  vendorId: string;
  saleDate: string; // "AAAA-MM-DD"
  amount: number;
  returns: number;
  createdAt: string; // ISO 8601
  syncAttempts: number;
  rejectedReason: string | null;
}

export type UpsertPendingSaleInput = Omit<PendingSale, "createdAt" | "syncAttempts" | "rejectedReason"> & {
  createdAt?: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS pending_sales (
          vendorId TEXT NOT NULL,
          saleDate TEXT NOT NULL,
          amount REAL NOT NULL,
          returns REAL NOT NULL,
          createdAt TEXT NOT NULL,
          syncAttempts INTEGER NOT NULL DEFAULT 0,
          rejectedReason TEXT,
          PRIMARY KEY (vendorId, saleDate)
        );`,
      );
      return db;
    });
  }
  return dbPromise;
}

/** Solo para pruebas: fuerza una nueva conexión/tabla en memoria. */
export function __resetDbForTests(): void {
  dbPromise = null;
}

/**
 * Guarda o actualiza (upsert por vendorId+saleDate) la venta de hoy pendiente de sincronizar.
 * "Última edición gana" del lado local — mismo criterio que MW6 del lado del servidor (MW7 paso 3).
 */
export async function upsertPendingSale(input: UpsertPendingSaleInput): Promise<void> {
  if (!input.vendorId) {
    throw new Error("upsertPendingSale requiere vendorId");
  }
  if (!input.saleDate) {
    throw new Error("upsertPendingSale requiere saleDate");
  }
  if (input.amount <= 0) {
    throw new Error("upsertPendingSale requiere amount > 0");
  }
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO pending_sales (vendorId, saleDate, amount, returns, createdAt, syncAttempts, rejectedReason)
     VALUES ($vendorId, $saleDate, $amount, $returns, $createdAt, 0, NULL);`,
    {
      $vendorId: input.vendorId,
      $saleDate: input.saleDate,
      $amount: input.amount,
      $returns: input.returns ?? 0,
      $createdAt: input.createdAt ?? new Date().toISOString(),
    },
  );
}

/** Lista todas las ventas pendientes de un vendedor (para el motor de sincronización, MW8). */
export async function listPendingSales(vendorId: string): Promise<PendingSale[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PendingSale>(
    `SELECT * FROM pending_sales WHERE vendorId = $vendorId ORDER BY saleDate ASC;`,
    { $vendorId: vendorId },
  );
  return rows;
}

/** Obtiene la venta pendiente de una fecha específica, si existe (V3, estado precargado). */
export async function getPendingSale(vendorId: string, saleDate: string): Promise<PendingSale | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<PendingSale>(
    `SELECT * FROM pending_sales WHERE vendorId = $vendorId AND saleDate = $saleDate;`,
    { $vendorId: vendorId, $saleDate: saleDate },
  );
  return row ?? null;
}

/** Elimina una venta pendiente ya aplicada por el servidor (MW8, resultado `applied`). */
export async function deletePendingSale(vendorId: string, saleDate: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM pending_sales WHERE vendorId = $vendorId AND saleDate = $saleDate;`, {
    $vendorId: vendorId,
    $saleDate: saleDate,
  });
}

/** Marca una venta pendiente como rechazada por el servidor (MW8, resultado `rejected`). */
export async function markPendingSaleRejected(
  vendorId: string,
  saleDate: string,
  reason: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE pending_sales SET syncAttempts = syncAttempts + 1, rejectedReason = $rejectedReason
     WHERE vendorId = $vendorId AND saleDate = $saleDate;`,
    { $vendorId: vendorId, $saleDate: saleDate, $rejectedReason: reason },
  );
}
