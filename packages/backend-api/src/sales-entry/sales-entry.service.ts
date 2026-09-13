import { ConflictException, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { DailySale } from "@prisma/client";
import { CommissionLedgerService } from "../commission-ledger/commission-ledger.service";
import { SalesEntryRepository } from "./sales-entry.repository";
import { DailySaleInputDto } from "./dto/daily-sale-input.dto";

export interface SyncResultItem {
  saleDate: string;
  status: "applied" | "rejected";
  error?: { code: string; message: string };
}

/**
 * SalesEntryComponent — W6 (registrar/corregir venta del día, con conexión)
 * y W7 (sincronizar lote offline). BR3.4 (período cerrado), BR3.5 (última
 * escritura gana, sin detección de conflicto — también cubre el cruce W6
 * vs. W7 sobre la misma fecha, R-02 de functional-spec.md).
 */
@Injectable()
export class SalesEntryService {
  constructor(
    private readonly repository: SalesEntryRepository,
    private readonly commissionLedgerService: CommissionLedgerService,
  ) {}

  /** W6 — registrar o corregir la venta del día, con conexión. */
  async recordSale(vendorId: string, dto: DailySaleInputDto): Promise<DailySale> {
    const saleDate = new Date(`${dto.saleDate}T00:00:00.000Z`);

    if (await this.commissionLedgerService.isDateInClosedPeriod(vendorId, saleDate)) {
      throw new ConflictException({ code: "PERIOD_CLOSED", message: "El período de esa fecha ya cerró" });
    }

    const existing = await this.repository.findByVendorAndDate(vendorId, saleDate);

    if (existing?.closed) {
      throw new ConflictException({ code: "DAY_CLOSED", message: "El día ya cerró; el valor quedó fijo" });
    }

    const saved = existing
      ? await this.repository.update(existing.id, dto.amount, dto.returns)
      : await this.repository.create(vendorId, saleDate, dto.amount, dto.returns);

    // W6 paso 6/7 — recálculo completo (BR4.4) + evaluación de umbrales (BR7.1/BR7.2, BR8.2/BR8.3).
    await this.commissionLedgerService.recalculateForVendor(vendorId);

    return saved;
  }

  /** W7 — sincronizar un lote de ventas guardadas offline, cada una de un día distinto. */
  async syncBatch(vendorId: string, rawItems: unknown[]): Promise<SyncResultItem[]> {
    const results: SyncResultItem[] = [];
    let anyApplied = false;

    for (const raw of rawItems) {
      // W7 paso 2a — validación de forma por ítem (BR3.1); un ítem inválido se
      // marca rejected sin bloquear el resto del lote.
      const item = plainToInstance(DailySaleInputDto, raw);
      const errors = await validate(item);
      if (errors.length > 0) {
        const saleDateRaw = typeof (raw as { saleDate?: unknown })?.saleDate === "string" ? (raw as { saleDate: string }).saleDate : "";
        results.push({
          saleDate: saleDateRaw,
          status: "rejected",
          error: { code: "VALIDATION_ERROR", message: "monto o devoluciones inválidos" },
        });
        continue;
      }

      const saleDate = new Date(`${item.saleDate}T00:00:00.000Z`);

      if (await this.commissionLedgerService.isDateInClosedPeriod(vendorId, saleDate)) {
        results.push({ saleDate: item.saleDate, status: "rejected", error: { code: "PERIOD_CLOSED", message: "El período de esa fecha ya cerró" } });
        continue;
      }

      const existing = await this.repository.findByVendorAndDate(vendorId, saleDate);
      if (existing?.closed) {
        results.push({ saleDate: item.saleDate, status: "rejected", error: { code: "DAY_CLOSED", message: "El día ya cerró" } });
        continue;
      }

      // BR3.5 — la sincronización más reciente sobrescribe, sin detección de conflicto.
      if (existing) {
        await this.repository.update(existing.id, item.amount, item.returns);
      } else {
        await this.repository.create(vendorId, saleDate, item.amount, item.returns);
      }
      results.push({ saleDate: item.saleDate, status: "applied" });
      anyApplied = true;
    }

    // W7 paso 3 — un solo recálculo por vendedor, no uno por ítem.
    if (anyApplied) {
      await this.commissionLedgerService.recalculateForVendor(vendorId);
    }

    return results;
  }
}
