import { Body, Controller, Post } from "@nestjs/common";
import { AuthenticatedUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { DailySaleInputDto } from "./dto/daily-sale-input.dto";
import { SalesEntryService } from "./sales-entry.service";

@Controller("sales")
export class SalesEntryController {
  constructor(private readonly salesEntryService: SalesEntryService) {}

  @Post()
  recordSale(@CurrentUser() user: AuthenticatedUser, @Body() dto: DailySaleInputDto) {
    return this.salesEntryService.recordSale(user.vendorId ?? "", dto);
  }

  // Body intencionalmente sin decorar con class-validator: W7 exige que un
  // ítem inválido del lote se marque `status=rejected` y el resto del lote
  // continúe procesándose (BR3.1 por ítem) — el ValidationPipe global
  // rechazaría toda la petición ante el primer ítem inválido, lo cual
  // violaría ese contrato. La validación por ítem ocurre en el servicio.
  @Post("sync")
  syncSales(@CurrentUser() user: AuthenticatedUser, @Body() items: unknown[]) {
    return this.salesEntryService.syncBatch(user.vendorId ?? "", items);
  }
}
