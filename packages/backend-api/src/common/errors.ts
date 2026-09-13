/**
 * Códigos de error estables del contrato (contract-summary.md § Formato de error uniforme).
 */
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  PERIOD_CLOSED: "PERIOD_CLOSED",
  TIER_ORDER_WARNING: "TIER_ORDER_WARNING",
  DAY_CLOSED: "DAY_CLOSED",
  TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS",
} as const;

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; reason?: string }>;
}
