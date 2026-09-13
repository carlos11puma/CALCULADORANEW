import { AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { CommissionLedgerService } from "./commission-ledger.service";
export declare class CommissionLedgerController {
    private readonly commissionLedgerService;
    constructor(commissionLedgerService: CommissionLedgerService);
    getCurrent(user: AuthenticatedUser): Promise<import("./commission-ledger.service").CommissionPeriodView>;
    getHistory(user: AuthenticatedUser, limit?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        periodMonth: string;
        accumulatedSales: import("@prisma/client/runtime/library").Decimal;
        accumulatedReturns: import("@prisma/client/runtime/library").Decimal;
        returnRate: import("@prisma/client/runtime/library").Decimal;
        commissionEarned: import("@prisma/client/runtime/library").Decimal;
        closed: boolean;
        closedAt: Date | null;
    }[]>;
}
