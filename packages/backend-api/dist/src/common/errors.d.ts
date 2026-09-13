/**
 * Códigos de error estables del contrato (contract-summary.md § Formato de error uniforme).
 */
export declare const ErrorCode: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly PERIOD_CLOSED: "PERIOD_CLOSED";
    readonly TIER_ORDER_WARNING: "TIER_ORDER_WARNING";
    readonly DAY_CLOSED: "DAY_CLOSED";
    readonly TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS";
};
export interface ApiError {
    code: string;
    message: string;
    details?: Array<{
        field?: string;
        reason?: string;
    }>;
}
