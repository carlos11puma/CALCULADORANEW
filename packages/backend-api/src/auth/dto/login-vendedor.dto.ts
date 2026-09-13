import { IsNotEmpty, IsString } from "class-validator";

export class LoginVendedorDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
