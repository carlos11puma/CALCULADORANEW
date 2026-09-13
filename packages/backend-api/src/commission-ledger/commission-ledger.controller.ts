import { Controller, Get, Query } from "@nestjs/common";
import { AuthenticatedUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { CommissionLedgerService } from "./commission-ledger.service";

@Controller("commission")
export class CommissionLedgerController {
  constructor(private readonly commissionLedgerService: CommissionLedgerService) {}

  @Get("current")
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.commissionLedgerService.getCurrentPeriod(user.vendorId ?? "");
  }

  @Get("history")
  getHistory(@CurrentUser() user: AuthenticatedUser, @Query("limit") limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.commissionLedgerService.getHistory(user.vendorId ?? "", parsedLimit);
  }
}
