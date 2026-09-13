// Archivo generado — NO editar a mano.
// Regenerar con: npm run generate-types --workspace=packages/api-contract
// Fuente: openapi/openapi.yaml

export interface paths {
    "/auth/login/vendedor": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login de vendedor (usuario/contraseña) — FR1.1 */
        post: operations["loginVendedor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login/supervisor": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login de supervisor por PIN — FR1.3 */
        post: operations["loginSupervisor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cierre de sesión explícito — FR1.4 (BR1.1) */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/vendors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar roster — FR2.1 (solo supervisor, BR1.2) */
        get: operations["listVendors"];
        put?: never;
        /** Crear vendedor con presupuesto — FR2.1, FR2.2 (BR1.2, BR2.1) */
        post: operations["createVendor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/vendors/{vendorId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Editar roster/presupuesto de un vendedor — FR2.1, FR2.2 (BR1.2, BR2.1) */
        patch: operations["updateVendor"];
        trace?: never;
    };
    "/tiers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar tramos por canal — FR2.3 */
        get: operations["listTiers"];
        /** Reemplazar el conjunto de tramos de un canal — FR2.3 (BR1.2, BR2.2, BR2.3) */
        put: operations["replaceTiers"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sales": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Registrar o corregir la venta del día — FR3.1, FR3.2, FR3.3 (BR3.1, BR3.2, BR3.3). Idempotente por (vendorId, saleDate): un reintento del mismo envío actualiza el mismo registro en vez de duplicarlo (ADR-004, AC3.3.4). */
        post: operations["recordSale"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sales/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sincronizar un lote de ventas guardadas offline, cada una identificada por su propia fecha — cada ítem se aplica de forma independiente, sin fusión entre dispositivos (ADR-004, BR3.3). */
        post: operations["syncSales"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commission/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Reporte del período vigente en tiempo real — FR4.1, FR5, FR8.1 */
        get: operations["getCurrentCommission"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commission/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Historial de períodos cerrados — FR6 */
        get: operations["getCommissionHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Notificaciones del vendedor autenticado, agrupadas por tipo en cliente — FR7, FR8.2, V5 */
        get: operations["listNotifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/manual": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Envío manual de notificación del supervisor a uno/varios/todos los vendedores — FR9.1, pantalla A5 (BR1.3, BR9.1) */
        post: operations["sendManualNotification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description Formato de error uniforme para toda la API (contract-summary.md). */
        Error: {
            /** @description Código estable, ej. VALIDATION_ERROR, UNAUTHORIZED, TIER_ORDER_WARNING */
            code: string;
            /** @description Mensaje legible, en español, para mostrar o loguear */
            message: string;
            /** @description Detalles de validación por campo, cuando aplica (ej. AC2.2.2 presupuesto negativo) */
            details?: {
                field?: string;
                reason?: string;
            }[];
        };
        LoginResponse: {
            token?: string;
            userId?: string;
            /** @enum {string} */
            role?: "vendedor" | "supervisor";
        };
        /** @description Vendedor del roster, con su ruta, canal y presupuesto vigente (entities.md). */
        Vendor: {
            id?: string;
            userId?: string;
            route?: string;
            name?: string;
            /** @enum {string} */
            channel?: "preventa" | "autoventa";
            budget?: number;
            active?: boolean;
        };
        VendorInput: {
            route: string;
            name: string;
            /** @enum {string} */
            channel: "preventa" | "autoventa";
            budget: number;
        };
        CommissionTier: {
            id?: string;
            /** @enum {string} */
            channel?: "preventa" | "autoventa";
            /** @enum {string} */
            tierType?: "por_devolucion" | "por_efectividad";
            order?: number;
            thresholdValue?: number;
            commissionRate?: number;
        };
        CommissionTierInput: {
            /** @enum {string} */
            channel: "preventa" | "autoventa";
            /** @enum {string} */
            tierType: "por_devolucion" | "por_efectividad";
            order: number;
            thresholdValue: number;
            commissionRate: number;
        };
        TierListResponse: {
            tiers?: components["schemas"]["CommissionTier"][];
            /** @description Si el conjunto vigente de tramos del canal está ordenado de mejor a peor beneficio (AC2.3.2) */
            inOrder?: boolean;
        };
        TierSaveResponse: {
            tiers?: components["schemas"]["CommissionTier"][];
            inOrder?: boolean;
            /** @description TIER_ORDER_WARNING si el conjunto guardado quedó fuera de orden (BR2.3) */
            warning?: string | null;
        };
        DailySale: {
            id?: string;
            vendorId?: string;
            /** Format: date */
            saleDate?: string;
            amount?: number;
            returns?: number;
            /** @enum {string} */
            syncStatus?: "synced" | "pending";
            closed?: boolean;
        };
        DailySaleInput: {
            /** Format: date */
            saleDate: string;
            amount: number;
            returns: number;
        };
        SyncResultItem: {
            /** Format: date */
            saleDate?: string;
            /** @enum {string} */
            status?: "applied" | "rejected";
            error?: components["schemas"]["Error"] | null;
        };
        CommissionPeriod: {
            id?: string;
            vendorId?: string;
            /** @description AAAA-MM */
            periodMonth?: string;
            accumulatedSales?: number;
            accumulatedReturns?: number;
            returnRate?: number;
            commissionEarned?: number;
            /** @description % de venta acumulada sobre presupuesto vigente */
            budgetProgress?: number;
            closed?: boolean;
            /** Format: date-time */
            closedAt?: string | null;
        };
        Notification: {
            id?: string;
            vendorId?: string;
            /** @enum {string} */
            type?: "umbral_venta" | "umbral_devolucion" | "manual";
            thresholdCrossed?: number | null;
            /** @description Solo en umbral_devolucion; omitido si los tramos del canal están fuera de orden (AC8.3.2) */
            earningOpportunity?: {
                nextTierThreshold?: number;
                potentialGain?: number;
            } | null;
            message?: string;
            /** Format: date-time */
            sentAt?: string;
            read?: boolean;
        };
        ManualNotificationInput: {
            message: string;
            recipients: "all" | string[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    loginVendedor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    username: string;
                    /** Format: password */
                    password: string;
                };
            };
        };
        responses: {
            /** @description Sesión de larga duración iniciada (FR1.4) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            /** @description Credenciales inválidas */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    loginSupervisor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    pin: string;
                };
            };
        };
        responses: {
            /** @description Sesión de supervisor iniciada */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            /** @description PIN inválido */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sesión revocada */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listVendors: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de vendedores */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Vendor"][];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rol no es supervisor (BR1.2) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createVendor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VendorInput"];
            };
        };
        responses: {
            /** @description Vendedor creado */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Vendor"];
                };
            };
            /** @description Presupuesto negativo o vacío (AC2.2.2, BR2.1) — VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rol no es supervisor (BR1.2) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateVendor: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                vendorId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VendorInput"];
            };
        };
        responses: {
            /** @description Vendedor actualizado */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Vendor"];
                };
            };
            /** @description Presupuesto inválido (BR2.1) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rol no es supervisor (BR1.2) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Vendedor no existe */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listTiers: {
        parameters: {
            query?: {
                channel?: "preventa" | "autoventa";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tramos del canal, con indicador de orden */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TierListResponse"];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    replaceTiers: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommissionTierInput"][];
            };
        };
        responses: {
            /** @description Guardado exitoso; puede incluir warning si quedó fuera de orden (BR2.3, ADR-003 de domain-design — guarda con advertencia, no bloquea) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TierSaveResponse"];
                };
            };
            /** @description Tramo inválido — campo vacío o negativo (BR2.2) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rol no es supervisor (BR1.2) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    recordSale: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DailySaleInput"];
            };
        };
        responses: {
            /** @description Venta guardada o corregida (día aún abierto) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DailySale"];
                };
            };
            /** @description Monto o devoluciones negativos/vacíos (FR3.2, BR3.1) — VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description El día ya cerró; el valor quedó fijo (FR3.3, BR3.2) — no se puede corregir */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    syncSales: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DailySaleInput"][];
            };
        };
        responses: {
            /** @description Resultado por ítem del lote (aplicado / rechazado con motivo) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SyncResultItem"][];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCurrentCommission: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Comisión, venta vs. presupuesto, indicador de devolución vigentes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommissionPeriod"];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCommissionHistory: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de períodos cerrados, más recientes primero */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommissionPeriod"][];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listNotifications: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de notificaciones (umbral de venta/presupuesto, devolución, manual) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Notification"][];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    sendManualNotification: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManualNotificationInput"];
            };
        };
        responses: {
            /** @description Notificación encolada para envío push */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Mensaje vacío o lista de destinatarios inválida (BR9.1) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Sin sesión válida (BR1.1) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Quien envía no es un supervisor autenticado (BR1.3) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}
