import { AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { DailySaleInputDto } from "./dto/daily-sale-input.dto";
import { SalesEntryService } from "./sales-entry.service";
export declare class SalesEntryController {
    private readonly salesEntryService;
    constructor(salesEntryService: SalesEntryService);
    recordSale(user: AuthenticatedUser, dto: DailySaleInputDto): Promise<{
        returns: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        closed: boolean;
        amount: import("@prisma/client/runtime/library").Decimal;
        saleDate: Date;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
    }>;
    syncSales(user: AuthenticatedUser, items: unknown[]): Promise<import("./sales-entry.service").SyncResultItem[]>;
}
