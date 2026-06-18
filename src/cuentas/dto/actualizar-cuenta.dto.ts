import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class ActualizarCuentaDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsIn(["bancaria", "billetera"])
  tipo?: "bancaria" | "billetera";

  @IsOptional()
  @IsIn(["COP", "USD"])
  moneda?: "COP" | "USD";

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-999999999999.99)
  @Max(999999999999.99)
  saldoInicial?: number;
}
