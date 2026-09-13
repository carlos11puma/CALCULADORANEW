import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Vendor } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { CommissionLedgerService } from "../commission-ledger/commission-ledger.service";
import { VendorDirectoryRepository } from "./vendor-directory.repository";
import { VendorInputDto } from "./dto/vendor-input.dto";

/**
 * VendorDirectoryComponent — W4 (gestión de roster y presupuesto).
 * Ninguna credencial de login viene en el contrato de VendorInput (contract-summary.md
 * Contrato 2) — al crear un Vendor se genera un username único a partir del
 * nombre y una contraseña temporal aleatoria (hasheada, bcrypt costo 10);
 * no hay flujo de recuperación en este MVP (Q4 de functional-design-questions.md),
 * así que el supervisor comunica esa contraseña inicial fuera de banda.
 * Documentado como desviación explícita en el reporte de Code Generation.
 */
@Injectable()
export class VendorDirectoryService {
  constructor(
    private readonly repository: VendorDirectoryRepository,
    private readonly commissionLedgerService: CommissionLedgerService,
  ) {}

  listAll(): Promise<Vendor[]> {
    return this.repository.findAll();
  }

  async create(input: VendorInputDto): Promise<Vendor> {
    this.assertValidBudget(input.budget);
    const username = await this.generateUniqueUsername(input.name);
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await AuthService.hash(temporaryPassword);

    return this.repository.createVendorWithUser({
      username,
      passwordHash,
      route: input.route,
      name: input.name,
      channel: input.channel,
      budget: input.budget,
    });
  }

  async update(vendorId: string, input: VendorInputDto): Promise<Vendor> {
    this.assertValidBudget(input.budget);
    const existing = await this.repository.findById(vendorId);
    if (!existing) {
      throw new NotFoundException({ code: "NOT_FOUND", message: "Vendedor no existe" });
    }

    const budgetChanged = Number(existing.budget) !== input.budget;
    const channelChanged = existing.channel !== input.channel;

    const updated = await this.repository.update(vendorId, input);

    // W4 paso 3 (ampliado por R-01 del reviewer): budget O channel cambiado dispara BR4.4.
    if (budgetChanged || channelChanged) {
      await this.commissionLedgerService.recalculateForVendor(vendorId);
    }

    return updated;
  }

  private assertValidBudget(budget: number): void {
    if (budget === undefined || budget === null || budget <= 0) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "El presupuesto debe ser mayor a cero",
        details: [{ field: "budget", reason: "budget debe ser >= 0.01" }],
      });
    }
  }

  private async generateUniqueUsername(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "");
    const count = await this.repository.countUsernameLike(base);
    return count === 0 ? base : `${base}.${count + 1}`;
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-10);
  }
}
