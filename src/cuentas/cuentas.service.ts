import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Cuenta, Prisma, TipoCuenta } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarCuentaDto } from "./dto/actualizar-cuenta.dto";
import { CrearCuentaDto } from "./dto/crear-cuenta.dto";

@Injectable()
export class CuentasService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crea una cuenta propia respetando el limite del plan y retorna su saldo real. */
  async crear(usuarioId: string, dto: CrearCuentaDto) {
    let ultimoError: unknown;
    for (let intento = 0; intento < 2; intento += 1) {
      try {
        return await this.crearEnTransaccion(usuarioId, dto);
      } catch (error) {
        ultimoError = error;
        if (!this.esErrorPrisma(error, "P2034")) throw error;
      }
    }
    throw ultimoError;
  }

  /** Lista las cuentas del usuario con saldos calculados desde sus movimientos. */
  async listar(usuarioId: string) {
    const [cuentas, movimientos] = await Promise.all([
      this.prisma.cuenta.findMany({ where: { usuarioId } }),
      this.prisma.transaccion.groupBy({
        by: ["cuentaId", "tipo"],
        where: { usuarioId },
        _sum: { monto: true },
      }),
    ]);
    return cuentas.map((cuenta) => this.conSaldoReal(cuenta, movimientos));
  }

  /** Obtiene una cuenta propia por id o retorna 404. */
  async obtener(usuarioId: string, id: number) {
    const cuenta = await this.prisma.cuenta.findUnique({
      where: { usuarioId_id: { usuarioId, id } },
    });

    if (!cuenta) throw new NotFoundException();
    return this.conSaldoReal(cuenta, await this.movimientos(usuarioId, id));
  }

  /** Actualiza campos editables de una cuenta propia y retorna el saldo recalculado. */
  async actualizar(usuarioId: string, id: number, dto: ActualizarCuentaDto) {
    try {
      const cuenta = await this.prisma.$transaction(async (tx) => {
        const actual = await tx.cuenta.findUnique({
          where: { usuarioId_id: { usuarioId, id } },
          select: { moneda: true, _count: { select: { transacciones: true } } },
        });
        if (!actual) throw new NotFoundException();
        if (dto.moneda && dto.moneda !== actual.moneda && actual._count.transacciones > 0) {
          throw new ConflictException({
            codigo: "CUENTA_CON_MOVIMIENTOS",
            mensaje: "La moneda de una cuenta con movimientos no se puede cambiar.",
          });
        }
        return tx.cuenta.update({
          where: { usuarioId_id: { usuarioId, id } },
          data: { ...dto, tipo: dto.tipo?.toUpperCase() as TipoCuenta | undefined },
        });
      });
      return this.conSaldoReal(cuenta, await this.movimientos(usuarioId, id));
    } catch (error) {
      if (this.esErrorPrisma(error, "P2025")) throw new NotFoundException();
      throw error;
    }
  }

  /** Elimina una cuenta propia normal y bloquea la principal o las que tienen movimientos. */
  async eliminar(usuarioId: string, id: number) {
    if (id === 0) {
      throw new ConflictException({
        codigo: "CUENTA_PRINCIPAL_NO_ELIMINABLE",
        mensaje: "La cuenta principal no se puede eliminar.",
      });
    }
    try {
      await this.prisma.cuenta.delete({ where: { usuarioId_id: { usuarioId, id } } });
    } catch (error) {
      if (this.esErrorPrisma(error, "P2025")) throw new NotFoundException();
      if (this.esErrorPrisma(error, "P2003")) {
        throw new ConflictException({
          codigo: "CUENTA_CON_MOVIMIENTOS",
          mensaje: "La cuenta tiene movimientos y no se puede eliminar.",
        });
      }
      throw error;
    }
    return { eliminada: true };
  }

  private async crearEnTransaccion(usuarioId: string, dto: CrearCuentaDto) {
    const cuenta = await this.prisma.$transaction(
      async (tx) => {
        const usuario = await tx.usuario.findUnique({
          where: { id: usuarioId },
          select: { plan: { select: { limiteCuentas: true } } },
        });
        if (!usuario) throw new NotFoundException();

        const cuentas = await tx.cuenta.aggregate({
          where: { usuarioId },
          _count: true,
          _max: { id: true },
        });
        if (cuentas._count >= usuario.plan.limiteCuentas) {
          throw new HttpException(
            {
              codigo: "LIMITE_CUENTAS_ALCANZADO",
              mensaje: "Alcanzaste el limite de cuentas de tu plan.",
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        return tx.cuenta.create({
          data: {
            ...dto,
            id: (cuentas._max.id ?? 0) + 1,
            usuarioId,
            tipo: dto.tipo.toUpperCase() as TipoCuenta,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return this.conSaldoReal(cuenta, []);
  }

  private movimientos(usuarioId: string, cuentaId: number) {
    return this.prisma.transaccion.groupBy({
      by: ["cuentaId", "tipo"],
      where: { usuarioId, cuentaId },
      _sum: { monto: true },
    });
  }

  private conSaldoReal(
    cuenta: Cuenta,
    movimientos: { cuentaId: number; tipo: "INGRESO" | "GASTO"; _sum: { monto: Prisma.Decimal | null } }[],
  ) {
    const saldoReal = movimientos
      .filter((movimiento) => movimiento.cuentaId === cuenta.id)
      .reduce(
      (saldo, movimiento) =>
        movimiento.tipo === "INGRESO"
          ? saldo.plus(movimiento._sum.monto ?? 0)
          : saldo.minus(movimiento._sum.monto ?? 0),
      new Prisma.Decimal(cuenta.saldoInicial),
    );
    return { ...cuenta, saldoReal };
  }

  private esErrorPrisma(error: unknown, codigo: string) {
    return typeof error === "object" && error !== null && "code" in error && error.code === codigo;
  }
}
