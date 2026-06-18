import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CuentasModule } from "./cuentas/cuentas.module";

@Module({
  imports: [AuthModule, CuentasModule],
})
export class AppModule {}
