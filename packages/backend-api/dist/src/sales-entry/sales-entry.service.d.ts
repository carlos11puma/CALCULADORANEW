import { DailySale } from "@prisma/client";
import { CommissionLedgerService } from "../commission-ledger/commission-ledger.service";
import { SalesEntryRepository } from "./sales-entry.repository";
import { DailySaleInputDto } from "./dto/daily-sale-input.dto";
export interface SyncResultItem {
    saleDate: string;
    status: "applied" | "rejected";
    error?: {
        code: string;
        message: string;
    };
}
/**
 * SalesEntryComponent — W6 (registrar/corregir venta del día, con conexión)
 * y W7 (sincronizar lote offline). BR3.4 (período cerrado), BR3.5 (última
 * escritura gana, sin detección de conflicto — también cubre el cruce W6
 * vs. W7 sobre la misma fecha, R-02 de functional-spec.md).
 */
export declare class SalesEntryService {
    private readonly repository;
    private readonly commissionLedgerService;
    constructor(repository: SalesEntryRepository, commissionLedgerService: CommissionLedgerService);
    /** W6 — registrar o corregir la venta del día, con conexión. */
    recordSale(vendorId: string, dto: DailySaleInputDto): Promise<DailySale>;
    /** W7 — sincronizar un lote de ventas guardadas offline, cada una de un día distinto. */
    syncBatch(vendorId: string, rawItems: unknown[]): Promise<SyncResultItem[]>;
}
