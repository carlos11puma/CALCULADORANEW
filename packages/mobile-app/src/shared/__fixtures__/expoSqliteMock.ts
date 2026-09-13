// Mock en memoria de expo-sqlite para pruebas (unit-test-instructions.md § Mocking/stubbing:
// "expo-sqlite se mockea con una implementación en memoria ... nunca escribe al sistema de
// archivos real durante pruebas"). Implementa el subconjunto mínimo de la API async de
// expo-sqlite (SDK 51) que `pendingSalesDb.ts` usa: openDatabaseAsync, execAsync, runAsync,
// getAllAsync, getFirstAsync — suficiente para la única tabla real de esta unidad
// (`pending_sales`), no un motor SQL genérico.
export interface PendingSaleRow {
  vendorId: string;
  saleDate: string;
  amount: number;
  returns: number;
  createdAt: string;
  syncAttempts: number;
  rejectedReason: string | null;
}

function createInMemoryDb() {
  let rows: PendingSaleRow[] = [];

  function reset() {
    rows = [];
  }

  const db = {
    async execAsync(_sql: string) {
      // CREATE TABLE IF NOT EXISTS — no-op estructural, la tabla en memoria ya existe.
      return undefined;
    },
    async runAsync(sql: string, params: Record<string, unknown> = {}) {
      const normalized = sql.trim().toUpperCase();
      if (normalized.startsWith("INSERT OR REPLACE INTO PENDING_SALES") || normalized.startsWith("INSERT INTO PENDING_SALES")) {
        const row: PendingSaleRow = {
          vendorId: String(params.$vendorId),
          saleDate: String(params.$saleDate),
          amount: Number(params.$amount),
          returns: Number(params.$returns),
          createdAt: String(params.$createdAt),
          syncAttempts: Number(params.$syncAttempts ?? 0),
          rejectedReason: (params.$rejectedReason as string | null) ?? null,
        };
        rows = rows.filter((r) => !(r.vendorId === row.vendorId && r.saleDate === row.saleDate));
        rows.push(row);
        return { lastInsertRowId: rows.length, changes: 1 };
      }
      if (normalized.startsWith("DELETE FROM PENDING_SALES")) {
        const before = rows.length;
        rows = rows.filter((r) => !(r.vendorId === params.$vendorId && r.saleDate === params.$saleDate));
        return { lastInsertRowId: 0, changes: before - rows.length };
      }
      if (normalized.startsWith("UPDATE PENDING_SALES")) {
        const target = rows.find((r) => r.vendorId === params.$vendorId && r.saleDate === params.$saleDate);
        if (target) {
          target.syncAttempts = target.syncAttempts + 1;
          target.rejectedReason = (params.$rejectedReason as string | null) ?? target.rejectedReason;
          return { lastInsertRowId: 0, changes: 1 };
        }
        return { lastInsertRowId: 0, changes: 0 };
      }
      return { lastInsertRowId: 0, changes: 0 };
    },
    async getAllAsync(sql: string, params: Record<string, unknown> = {}): Promise<PendingSaleRow[]> {
      const normalized = sql.trim().toUpperCase();
      if (normalized.includes("WHERE VENDORID = $VENDORID")) {
        return rows.filter((r) => r.vendorId === params.$vendorId);
      }
      return [...rows];
    },
    async getFirstAsync(sql: string, params: Record<string, unknown> = {}): Promise<PendingSaleRow | null> {
      const found = rows.find(
        (r) => r.vendorId === params.$vendorId && r.saleDate === params.$saleDate,
      );
      return found ?? null;
    },
    async closeAsync() {
      return undefined;
    },
    __reset: reset,
    __rows: () => rows,
  };
  return db;
}

let sharedDb = createInMemoryDb();

export const expoSqliteMock = {
  openDatabaseAsync: jest.fn(async (_name: string) => sharedDb),
  __resetAll: () => {
    sharedDb = createInMemoryDb();
  },
};
