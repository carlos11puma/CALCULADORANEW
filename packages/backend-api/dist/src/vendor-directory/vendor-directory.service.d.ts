import { Vendor } from "@prisma/client";
import { CommissionLedgerService } from "../commission-ledger/commission-ledger.service";
import { VendorDirectoryRepository } from "./vendor-directory.repository";
import { VendorInputDto } from "./dto/vendor-input.dto";
/**
 * VendorDirectoryComponent — W4 (gestión de roster y presupuesto).
 * Ninguna credencial de login viene en el contrato de VendorInput (contract-summary.md
 * Contrato 2) — al crear un Vendor se genera un username único a partir del
 * nombre y una contraseña temporal aleatoria (hasheada, bcrypt costo 10);
 * no hay flujo de recuperación en este MVP (Q4 de functional-design-questions.md),
 * así que el supervisor comunica esa contraseña inicial fuera de banda.
 * Documentado como desviación explícita en el reporte de Code Generation.
 */
export declare class VendorDirectoryService {
    private readonly repository;
    private readonly commissionLedgerService;
    constructor(repository: VendorDirectoryRepository, commissionLedgerService: CommissionLedgerService);
    listAll(): Promise<Vendor[]>;
    create(input: VendorInputDto): Promise<Vendor>;
    update(vendorId: string, input: VendorInputDto): Promise<Vendor>;
    private assertValidBudget;
    private generateUniqueUsername;
    private generateTemporaryPassword;
}
