import { IsIn, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class VendorInputDto {
  @IsString()
  @IsNotEmpty()
  route!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(["preventa", "autoventa"])
  channel!: "preventa" | "autoventa";

  @IsNumber()
  @Min(0.01)
  budget!: number;
}
