import { forwardRef, Module } from "@nestjs/common";
import { CommissionTierModule } from "../commission-tier/commission-tier.module";
import { NotificationModule } from "../notification/notification.module";
import { CommissionLedgerController } from "./commission-ledger.controller";
import { CommissionLedgerRepository } from "./commission-ledger.repository";
import { CommissionLedgerService } from "./commission-ledger.service";

@Module({
  imports: [forwardRef(() => CommissionTierModule), forwardRef(() => NotificationModule)],
  controllers: [CommissionLedgerController],
  providers: [CommissionLedgerService, CommissionLedgerRepository],
  exports: [CommissionLedgerService],
})
export class CommissionLedgerModule {}
