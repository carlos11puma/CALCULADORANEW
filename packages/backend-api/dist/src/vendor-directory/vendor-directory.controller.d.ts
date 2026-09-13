import { VendorInputDto } from "./dto/vendor-input.dto";
import { VendorDirectoryService } from "./vendor-directory.service";
export declare class VendorDirectoryController {
    private readonly vendorDirectoryService;
    constructor(vendorDirectoryService: VendorDirectoryService);
    list(): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
        updatedAt: Date;
        route: string;
        channel: import(".prisma/client").$Enums.Channel;
        budget: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    create(dto: VendorInputDto): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
        updatedAt: Date;
        route: string;
        channel: import(".prisma/client").$Enums.Channel;
        budget: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(vendorId: string, dto: VendorInputDto): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
        updatedAt: Date;
        route: string;
        channel: import(".prisma/client").$Enums.Channel;
        budget: import("@prisma/client/runtime/library").Decimal;
    }>;
}
