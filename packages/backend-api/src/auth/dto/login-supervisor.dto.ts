import { IsNotEmpty, IsString } from "class-validator";

export class LoginSupervisorDto {
  @IsString()
  @IsNotEmpty()
  pin!: string;
}
