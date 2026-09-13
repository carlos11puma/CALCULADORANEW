import { Module } from "@nestjs/common";
import { CommissionLedgerModule } from "../commission-ledger/commission-ledger.module";
import { SalesEntryController } from "./sales-entry.controller";
import { SalesEntryRepository } from "./sales-entry.repository";
import { SalesEntryService } from "./sales-entry.service";

@Module({
  imports: [CommissionLedgerModule],
  controllers: [SalesEntryController],
  providers: [SalesEntryService, SalesEntryRepository],
})
export class SalesEntryModule {}
