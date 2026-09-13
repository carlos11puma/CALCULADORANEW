import { Injectable } from "@nestjs/common";
import { DailySale } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SalesEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByVendorAndDate(vendorId: string, saleDate: Date): Promise<DailySale | null> {
    return this.prisma.dailySale.findUnique({
      where: { vendorId_saleDate: { vendorId, saleDate } },
    });
  }

  create(vendorId: string, saleDate: Date, amount: number, returns: number): Promise<DailySale> {
    return this.prisma.dailySale.create({
      data: { vendorId, saleDate, amount, returns, syncStatus: "synced" },
    });
  }

  update(id: string, amount: number, returns: number): Promise<DailySale> {
    return this.prisma.dailySale.update({
      where: { id },
      data: { amount, returns, syncStatus: "synced" },
    });
  }
}
