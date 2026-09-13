import { Injectable } from "@nestjs/common";
import { CommissionTier } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CommissionTierInputDto } from "./dto/commission-tier-input.dto";

@Injectable()
export class CommissionTierRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByChannel(channel: "preventa" | "autoventa"): Promise<CommissionTier[]> {
    return this.prisma.commissionTier.findMany({
      where: { channel },
      orderBy: { order: "asc" },
    });
  }

  async replaceChannel(channel: "preventa" | "autoventa", tiers: CommissionTierInputDto[]): Promise<CommissionTier[]> {
    return this.prisma.$transaction(async (tx) => {
      await tx.commissionTier.deleteMany({ where: { channel } });
      await tx.commissionTier.createMany({ data: tiers });
      return tx.commissionTier.findMany({ where: { channel }, orderBy: { order: "asc" } });
    });
  }
}
