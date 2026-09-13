import { ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class ManualNotificationDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  // "all" es el único valor de string aceptado — cualquier otro valor que no
  // sea un arreglo (incluyendo otro string, un número, etc.) cae en la rama
  // de abajo y falla IsArray (BR9.1: recipients inválido -> VALIDATION_ERROR).
  @ValidateIf((o) => o.recipients !== "all")
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  recipients!: "all" | string[];
}
