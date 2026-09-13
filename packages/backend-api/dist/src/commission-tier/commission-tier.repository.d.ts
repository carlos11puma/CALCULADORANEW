import { CommissionTier } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CommissionTierInputDto } from "./dto/commission-tier-input.dto";
export declare class CommissionTierRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByChannel(channel: "preventa" | "autoventa"): Promise<CommissionTier[]>;
    replaceChannel(channel: "preventa" | "autoventa", tiers: CommissionTierInputDto[]): Promise<CommissionTier[]>;
}
