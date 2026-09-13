// Fixtures compartidos entre pruebas de lógica de negocio y de integración
// (unit-test-instructions.md § Gestión de datos de prueba) — consistentes
// con los ejemplos de functional-spec.md.
import { CommissionPeriod, CommissionTier, DailySale, User, Vendor } from "@prisma/client";

export const vendorUser: User = {
  id: "usr_vendor_1",
  role: "vendedor",
  username: "juan.perez",
  passwordHash: "$2b$10$hashedpasswordvalueforjuan",
  pin: null,
  active: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const supervisorUser: User = {
  id: "usr_supervisor_1",
  role: "supervisor",
  username: null,
  passwordHash: null,
  pin: "$2b$10$hashedpinvalueforcarlos",
  active: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const preventaVendor: Vendor = {
  id: "vnd_preventa_1",
  userId: vendorUser.id,
  route: "Ruta 12",
  name: "Juan Pérez",
  channel: "preventa",
  budget: 100000,
  active: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const autoventaVendor: Vendor = {
  id: "vnd_autoventa_1",
  userId: "usr_vendor_2",
  route: "Ruta 7",
  name: "María López",
  channel: "autoventa",
  budget: 50000,
  active: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

/** Tramos de devolución (preventa) en orden — order 1 mejor tasa, umbral más bajo mejor. */
export const preventaTiersInOrder: CommissionTier[] = [
  {
    id: "tier_p1",
    channel: "preventa",
    tierType: "por_devolucion",
    order: 1,
    thresholdValue: 5,
    commissionRate: 0.05,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tier_p2",
    channel: "preventa",
    tierType: "por_devolucion",
    order: 2,
    thresholdValue: 8,
    commissionRate: 0.03,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tier_p3",
    channel: "preventa",
    tierType: "por_devolucion",
    order: 3,
    thresholdValue: 100,
    commissionRate: 0.01,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/** Mismo canal, pero fuera de orden (tramo 2 tiene mejor tasa que el tramo 1). */
export const preventaTiersOutOfOrder: CommissionTier[] = [
  { ...preventaTiersInOrder[0], commissionRate: 0.02 },
  { ...preventaTiersInOrder[1], commissionRate: 0.05 },
  preventaTiersInOrder[2],
];

export const autoventaTiersInOrder: CommissionTier[] = [
  {
    id: "tier_a1",
    channel: "autoventa",
    tierType: "por_efectividad",
    order: 1,
    thresholdValue: 110,
    commissionRate: 0.06,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tier_a2",
    channel: "autoventa",
    tierType: "por_efectividad",
    order: 2,
    thresholdValue: 95,
    commissionRate: 0.04,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tier_a3",
    channel: "autoventa",
    tierType: "por_efectividad",
    order: 3,
    thresholdValue: 0,
    commissionRate: 0.02,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const dailySaleFixture: DailySale = {
  id: "sale_1",
  vendorId: preventaVendor.id,
  saleDate: new Date("2026-09-05T00:00:00.000Z"),
  amount: 1000,
  returns: 50,
  syncStatus: "synced",
  closed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const currentPeriodFixture: CommissionPeriod = {
  id: "period_1",
  vendorId: preventaVendor.id,
  periodMonth: "2026-09",
  accumulatedSales: 10000,
  accumulatedReturns: 500,
  returnRate: 0.05,
  commissionEarned: 500,
  closed: false,
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const closedPeriodFixture: CommissionPeriod = {
  ...currentPeriodFixture,
  id: "period_0",
  periodMonth: "2026-08",
  closed: true,
  closedAt: new Date("2026-09-01T01:00:00.000Z"),
};
