import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, Min, ValidateNested } from "class-validator";

export class CommissionTierInputDto {
  @IsIn(["preventa", "autoventa"])
  channel!: "preventa" | "autoventa";

  @IsIn(["por_devolucion", "por_efectividad"])
  tierType!: "por_devolucion" | "por_efectividad";

  @IsInt()
  order!: number;

  @IsNumber()
  @Min(0)
  thresholdValue!: number;

  @IsNumber()
  @Min(0)
  commissionRate!: number;
}

export class ReplaceTiersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CommissionTierInputDto)
  tiers!: CommissionTierInputDto[];
}
