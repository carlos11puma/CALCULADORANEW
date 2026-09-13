import { forwardRef, Module } from "@nestjs/common";
import { CommissionTierController } from "./commission-tier.controller";
import { CommissionTierRepository } from "./commission-tier.repository";
import { CommissionTierService } from "./commission-tier.service";
import { CommissionLedgerModule } from "../commission-ledger/commission-ledger.module";

@Module({
  imports: [forwardRef(() => CommissionLedgerModule)],
  controllers: [CommissionTierController],
  providers: [CommissionTierService, CommissionTierRepository],
  exports: [CommissionTierService, CommissionTierRepository],
})
export class CommissionTierModule {}
