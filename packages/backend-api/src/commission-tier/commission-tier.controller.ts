import { Body, Controller, forwardRef, Get, Inject, Put, Query, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CommissionTierService } from "./commission-tier.service";
import { ReplaceTiersDto } from "./dto/commission-tier-input.dto";
import { CommissionLedgerService } from "../commission-ledger/commission-ledger.service";

@Controller("tiers")
export class CommissionTierController {
  constructor(
    private readonly tierService: CommissionTierService,
    @Inject(forwardRef(() => CommissionLedgerService))
    private readonly ledgerService: CommissionLedgerService,
  ) {}

  @Get()
  async list(@Query("channel") channel?: "preventa" | "autoventa") {
    const resolved = channel ?? "preventa";
    return this.tierService.getTiers(resolved);
  }

  @UseGuards(RolesGuard)
  @Roles("supervisor")
  @Put()
  async replace(@Body() dto: ReplaceTiersDto) {
    const channel = dto.tiers[0]?.channel;
    if (!channel) {
      return { tiers: [], inOrder: true, warning: null };
    }
    const result = await this.tierService.replaceTiers(channel, dto.tiers);
    // W5 paso 4: cambio de tramos dispara BR4.4 (recálculo completo) para cada Vendor del canal.
    await this.ledgerService.recalculateAllForChannel(channel);
    return result;
  }
}
