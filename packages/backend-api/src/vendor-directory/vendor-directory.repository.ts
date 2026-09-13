import { Injectable } from "@nestjs/common";
import { Prisma, Vendor } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class VendorDirectoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({ orderBy: { name: "asc" } });
  }

  findById(id: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({ where: { id } });
  }

  countUsernameLike(prefix: string): Promise<number> {
    return this.prisma.user.count({ where: { username: { startsWith: prefix } } });
  }

  async createVendorWithUser(input: {
    username: string;
    passwordHash: string;
    route: string;
    name: string;
    channel: "preventa" | "autoventa";
    budget: Prisma.Decimal | number;
  }): Promise<Vendor> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          role: "vendedor",
          username: input.username,
          passwordHash: input.passwordHash,
          active: true,
        },
      });
      return tx.vendor.create({
        data: {
          userId: user.id,
          route: input.route,
          name: input.name,
          channel: input.channel,
          budget: input.budget,
          active: true,
        },
      });
    });
  }

  update(
    id: string,
    input: { route: string; name: string; channel: "preventa" | "autoventa"; budget: Prisma.Decimal | number },
  ): Promise<Vendor> {
    return this.prisma.vendor.update({ where: { id }, data: input });
  }
}
