import assert from "node:assert/strict";
import test from "node:test";
import { ConflictException, HttpException, NotFoundException } from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { JwtAuthGuard } from "../src/auth/jwt-auth.guard";
import { CuentasController } from "../src/cuentas/cuentas.controller";
import { CuentasService } from "../src/cuentas/cuentas.service";

test("todos los endpoints de cuentas requieren JWT", () => {
  assert.deepEqual(Reflect.getMetadata(GUARDS_METADATA, CuentasController), [
    JwtAuthGuard,
  ]);
});

test("las operaciones puntuales filtran por cuenta y usuario", async () => {
  const consultas: unknown[] = [];
  const prisma = {
    transaccion: { groupBy: async () => [] },
    cuenta: {
      findUnique: async (consulta: unknown) => {
        consultas.push(consulta);
        return null;
      },
    },
  };
  const service = new CuentasService(prisma as never);

  await assert.rejects(service.obtener("usuario-b", 7), NotFoundException);
  assert.equal((consultas[0] as { where: unknown }).where !== undefined, true);
});

test("crea la siguiente cuenta con saldo real y respeta el limite del plan", async () => {
  let cantidad = 1;
  const prisma = {
    $transaction: async (operacion: (tx: unknown) => unknown) => operacion(prisma),
    usuario: {
      findUnique: async () => ({ plan: { limiteCuentas: 2 } }),
    },
    cuenta: {
      aggregate: async () => ({ _count: cantidad, _max: { id: cantidad - 1 } }),
      create: async ({ data }: { data: object }) => ({ ...data, saldoInicial: 500 }),
    },
  };
  const service = new CuentasService(prisma as never);
  const dto = {
    nombre: "Ahorros",
    tipo: "bancaria" as const,
    moneda: "COP" as const,
    saldoInicial: 500,
  };

  const cuenta = await service.crear("usuario-a", dto);
  assert.equal(cuenta.id, 1);
  assert.equal(cuenta.saldoInicial, 500);
  assert.equal(Number(cuenta.saldoReal), 500);

  cantidad = 2;
  await assert.rejects(service.crear("usuario-a", dto), (error: HttpException) => {
    assert.equal(error.getStatus(), 429);
    assert.deepEqual(error.getResponse(), {
      codigo: "LIMITE_CUENTAS_ALCANZADO",
      mensaje: "Alcanzaste el limite de cuentas de tu plan.",
    });
    return true;
  });
});

test("lista y obtiene solo cuentas propias con saldo real calculado", async () => {
  const consultas: unknown[] = [];
  const propia = { id: 1, usuarioId: "usuario-a", saldoInicial: 750 };
  const prisma = {
    transaccion: { groupBy: async () => [] },
    cuenta: {
      findMany: async (consulta: unknown) => {
        consultas.push(consulta);
        return [propia];
      },
      findUnique: async (consulta: unknown) => {
        consultas.push(consulta);
        const llave = (consulta as {
          where: { usuarioId_id: { usuarioId: string; id: number } };
        }).where.usuarioId_id;
        return llave.usuarioId === "usuario-a" && llave.id === 1 ? propia : null;
      },
    },
  };
  const service = new CuentasService(prisma as never);

  const listado = await service.listar("usuario-a");
  const detalle = await service.obtener("usuario-a", 1);
  await assert.rejects(service.obtener("usuario-b", 1), NotFoundException);

  assert.equal(Number(listado[0].saldoReal), 750);
  assert.equal(Number(detalle.saldoReal), 750);
  assert.equal(consultas.length, 3);
});

test("actualiza solo cuentas propias y recalcula el saldo real", async () => {
  const propia = { id: 1, usuarioId: "usuario-a", saldoInicial: 750 };
  const prisma = {
    $transaction: async (operacion: (tx: unknown) => unknown) => operacion(prisma),
    transaccion: { groupBy: async () => [] },
    cuenta: {
      findUnique: async ({ where }: { where: { usuarioId_id: { usuarioId: string } } }) =>
        where.usuarioId_id.usuarioId === "usuario-a"
          ? { moneda: "COP", _count: { transacciones: 0 } }
          : null,
      update: async ({ where, data }: { where: { usuarioId_id: { usuarioId: string } }; data: object }) => {
        if (where.usuarioId_id.usuarioId !== "usuario-a") throw { code: "P2025" };
        return { ...propia, ...data };
      },
    },
  };
  const service = new CuentasService(prisma as never);

  const actualizada = await service.actualizar("usuario-a", 1, {
    nombre: "Viajes",
    saldoInicial: 1200,
  });

  assert.equal(actualizada.nombre, "Viajes");
  assert.equal(actualizada.saldoInicial, 1200);
  assert.equal(Number(actualizada.saldoReal), 1200);
  await assert.rejects(
    service.actualizar("usuario-b", 1, { nombre: "Ajena" }),
    NotFoundException,
  );
});

test("elimina cuentas propias, pero no la principal ni cuentas ajenas", async () => {
  const eliminadas: unknown[] = [];
  const prisma = {
    cuenta: {
      findUnique: async ({ where }: { where: { usuarioId_id: { usuarioId: string } } }) =>
        where.usuarioId_id.usuarioId === "usuario-a" ? { saldoInicial: 0 } : null,
      delete: async (consulta: { where: { usuarioId_id: { usuarioId: string } } }) => {
        if (consulta.where.usuarioId_id.usuarioId !== "usuario-a") throw { code: "P2025" };
        eliminadas.push(consulta);
      },
    },
  };
  const service = new CuentasService(prisma as never);

  assert.deepEqual(await service.eliminar("usuario-a", 1), { eliminada: true });
  assert.deepEqual(eliminadas, [
    { where: { usuarioId_id: { usuarioId: "usuario-a", id: 1 } } },
  ]);
  await assert.rejects(service.eliminar("usuario-a", 0), (error: ConflictException) => {
    assert.equal(error.getStatus(), 409);
    assert.deepEqual(error.getResponse(), {
      codigo: "CUENTA_PRINCIPAL_NO_ELIMINABLE",
      mensaje: "La cuenta principal no se puede eliminar.",
    });
    return true;
  });
  await assert.rejects(service.eliminar("usuario-b", 1), NotFoundException);
});

test("calcula saldo real sumando ingresos y restando gastos", async () => {
  const prisma = {
    transaccion: {
      groupBy: async () => [
        { cuentaId: 1, tipo: "INGRESO", _sum: { monto: 50 } },
        { cuentaId: 1, tipo: "GASTO", _sum: { monto: 30 } },
      ],
    },
    cuenta: {
      findUnique: async () => ({
        id: 1,
        usuarioId: "usuario-a",
        saldoInicial: 100,
      }),
    },
  };

  const cuenta = await new CuentasService(prisma as never).obtener("usuario-a", 1);
  assert.equal(Number(cuenta.saldoReal), 120);
});

test("no permite cambiar moneda si la cuenta tiene movimientos", async () => {
  const prisma = {
    $transaction: async (operacion: (tx: unknown) => unknown) => operacion(prisma),
    cuenta: {
      findUnique: async () => ({ moneda: "COP", _count: { transacciones: 1 } }),
      update: async () => assert.fail("no debe actualizar"),
    },
  };

  await assert.rejects(
    new CuentasService(prisma as never).actualizar("usuario-a", 1, { moneda: "USD" }),
    (error: ConflictException) => {
      assert.equal(error.getStatus(), 409);
      assert.deepEqual(error.getResponse(), {
        codigo: "CUENTA_CON_MOVIMIENTOS",
        mensaje: "La moneda de una cuenta con movimientos no se puede cambiar.",
      });
      return true;
    },
  );
});
