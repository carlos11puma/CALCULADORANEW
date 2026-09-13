import { Prisma, Vendor } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class VendorDirectoryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Vendor[]>;
    findById(id: string): Promise<Vendor | null>;
    countUsernameLike(prefix: string): Promise<number>;
    createVendorWithUser(input: {
        username: string;
        passwordHash: string;
        route: string;
        name: string;
        channel: "preventa" | "autoventa";
        budget: Prisma.Decimal | number;
    }): Promise<Vendor>;
    update(id: string, input: {
        route: string;
        name: string;
        channel: "preventa" | "autoventa";
        budget: Prisma.Decimal | number;
    }): Promise<Vendor>;
}
