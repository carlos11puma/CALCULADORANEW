import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CommissionLedgerModule } from "../commission-ledger/commission-ledger.module";
import { VendorDirectoryController } from "./vendor-directory.controller";
import { VendorDirectoryRepository } from "./vendor-directory.repository";
import { VendorDirectoryService } from "./vendor-directory.service";

@Module({
  imports: [AuthModule, CommissionLedgerModule],
  controllers: [VendorDirectoryController],
  providers: [VendorDirectoryService, VendorDirectoryRepository],
  exports: [VendorDirectoryRepository],
})
export class VendorDirectoryModule {}
