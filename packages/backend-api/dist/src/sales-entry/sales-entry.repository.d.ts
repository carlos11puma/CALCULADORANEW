import { DailySale } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class SalesEntryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByVendorAndDate(vendorId: string, saleDate: Date): Promise<DailySale | null>;
    create(vendorId: string, saleDate: Date, amount: number, returns: number): Promise<DailySale>;
    update(id: string, amount: number, returns: number): Promise<DailySale>;
}
