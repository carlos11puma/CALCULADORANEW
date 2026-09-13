import { plainToInstance } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validateSync } from "class-validator";

/**
 * Esquema de variables de entorno requeridas — @nestjs/config valida esto al
 * arrancar el proceso (fail-fast, NFR3.12) en vez de fallar en el primer
 * request que las necesite.
 */
export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsOptional()
  @IsIn(["development", "production", "test"])
  NODE_ENV?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(", "))
      .join("; ");
    throw new Error(`Configuración de entorno inválida — el proceso no arranca: ${details}`);
  }

  return validatedConfig;
}
