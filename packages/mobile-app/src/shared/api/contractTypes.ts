// contractTypes.ts — interfaces TypeScript que reflejan exactamente los 6 contratos de
// `inception/contract-design/contract-summary.md` (api-contract).
//
// Nota de desviación (ver informe final de Code Generation): se definen localmente en vez
// de importarse desde `@calculadora-comisiones/api-contract` porque el `package.json` de esa
// unidad declara `"main": "dist/types.js"` / `"types": "dist/types.d.ts"`, pero su
// `tsconfig.json` (`rootDir: "."`, `include: ["src", "scripts"]`) compila `src/types.ts` a
// `dist/src/types.d.ts` — un import de `@calculadora-comisiones/api-contract` no resuelve con
// el `package.json` publicado tal cual está. Estas interfaces son un reflejo campo-por-campo
// del mismo contrato (mismos nombres/tipos que `dist/src/types.d.ts` genera), así que
// mobile-app y api-contract no divergen en la forma, solo en el mecanismo de importación.

export type SessionRoleValue = "vendedor" | "supervisor";
export type Channel = "preventa" | "autoventa";
export type TierType = "por_devolucion" | "por_efectividad";
export type NotificationType = "umbral_venta" | "umbral_devolucion" | "manual";

export interface ApiError {
  code: string;
  message: string;
  details?: { field?: string; reason?: string }[];
}

export interface LoginResponse {
  token: string;
  userId: string;
  role: SessionRoleValue;
}

export interface Vendor {
  id: string;
  userId: string;
  route: string;
  name: string;
  channel: Channel;
  budget: number;
  active: boolean;
}

export interface VendorInput {
  route: string;
  name: string;
  channel: Channel;
  budget: number;
}

export interface CommissionTier {
  id: string;
  channel: Channel;
  tierType: TierType;
  order: number;
  thresholdValue: number;
  commissionRate: number;
}

export interface CommissionTierInput {
  channel: Channel;
  tierType: TierType;
  order: number;
  thresholdValue: number;
  commissionRate: number;
}

export interface TierListResponse {
  tiers: CommissionTier[];
  inOrder: boolean;
}

export interface TierSaveResponse {
  tiers: CommissionTier[];
  inOrder: boolean;
  warning?: string | null;
}

export interface DailySale {
  id: string;
  vendorId: string;
  saleDate: string;
  amount: number;
  returns: number;
  syncStatus: "synced" | "pending";
  closed: boolean;
}

export interface DailySaleInput {
  saleDate: string;
  amount: number;
  returns: number;
}

export interface SyncResultItem {
  saleDate: string;
  status: "applied" | "rejected";
  error?: ApiError | null;
}

export interface CommissionPeriod {
  id: string;
  vendorId: string;
  periodMonth: string;
  accumulatedSales: number;
  accumulatedReturns: number;
  returnRate: number;
  commissionEarned: number;
  budgetProgress: number;
  closed: boolean;
  closedAt: string | null;
}

export interface EarningOpportunity {
  nextTierThreshold: number;
  potentialGain: number;
}

export interface AppNotification {
  id: string;
  vendorId: string;
  type: NotificationType;
  thresholdCrossed: number | null;
  earningOpportunity: EarningOpportunity | null;
  message: string;
  sentAt: string;
  read: boolean;
}

export type ManualNotificationRecipients = "all" | string[];

export interface ManualNotificationInput {
  message: string;
  recipients: ManualNotificationRecipients;
}
