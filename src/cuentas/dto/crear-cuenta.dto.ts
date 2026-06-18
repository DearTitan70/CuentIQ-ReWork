import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class CrearCuentaDto {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  nombre!: string;

  @IsIn(["bancaria", "billetera"])
  tipo!: "bancaria" | "billetera";

  @IsIn(["COP", "USD"])
  moneda!: "COP" | "USD";

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-999999999999.99)
  @Max(999999999999.99)
  saldoInicial!: number;
}
