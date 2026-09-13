import { CommissionTierService } from "./commission-tier.service";
import { ReplaceTiersDto } from "./dto/commission-tier-input.dto";
import { CommissionLedgerService } from "../commission-ledger/commission-ledger.service";
export declare class CommissionTierController {
    private readonly tierService;
    private readonly ledgerService;
    constructor(tierService: CommissionTierService, ledgerService: CommissionLedgerService);
    list(channel?: "preventa" | "autoventa"): Promise<import("./commission-tier.service").TierResolutionResult>;
    replace(dto: ReplaceTiersDto): Promise<{
        warning: string | null;
    } & import("./commission-tier.service").TierResolutionResult>;
}
