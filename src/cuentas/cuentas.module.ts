import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma/prisma.service";
import { CuentasController } from "./cuentas.controller";
import { CuentasService } from "./cuentas.service";

@Module({
  imports: [AuthModule],
  controllers: [CuentasController],
  providers: [CuentasService, PrismaService],
})
export class CuentasModule {}
