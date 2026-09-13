import { IsDateString, IsNumber, Min } from "class-validator";

export class DailySaleInputDto {
  @IsDateString()
  saleDate!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsNumber()
  @Min(0)
  returns!: number;
}
