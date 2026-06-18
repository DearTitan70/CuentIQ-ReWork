import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { ActualizarCuentaDto } from "../src/cuentas/dto/actualizar-cuenta.dto";
import { CrearCuentaDto } from "../src/cuentas/dto/crear-cuenta.dto";

const pipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: () =>
    new BadRequestException({
      codigo: "REQUEST_INVALIDO",
      mensaje: "La solicitud contiene datos invalidos.",
    }),
});

const metadata = (metatype: new () => object) => ({
  type: "body" as const,
  metatype,
  data: undefined,
});

test("valida la creacion de cuentas y elimina campos internos", async () => {
  const dto = await pipe.transform(
    {
      nombre: "  Ahorros  ",
      tipo: "bancaria",
      moneda: "COP",
      saldoInicial: 1000,
      usuarioId: "ajeno",
      saldoReal: 999999,
    },
    metadata(CrearCuentaDto),
  );

  assert.deepEqual({ ...dto }, {
    nombre: "Ahorros",
    tipo: "bancaria",
    moneda: "COP",
    saldoInicial: 1000,
  });
});

test("rechaza datos invalidos con el error normalizado", async () => {
  await assert.rejects(
    pipe.transform(
      { nombre: " ", tipo: "efectivo", moneda: "EUR", saldoInicial: "1000" },
      metadata(CrearCuentaDto),
    ),
    (error: BadRequestException) => {
      assert.deepEqual(error.getResponse(), {
        codigo: "REQUEST_INVALIDO",
        mensaje: "La solicitud contiene datos invalidos.",
      });
      return true;
    },
  );
});

test("el DTO de actualizacion acepta solo campos editables", async () => {
  const dto = await pipe.transform(
    { nombre: "Viajes", usuarioId: "ajeno", saldoReal: 42 },
    metadata(ActualizarCuentaDto),
  );

  assert.equal(dto.nombre, "Viajes");
  assert.equal("usuarioId" in dto, false);
  assert.equal("saldoReal" in dto, false);
});

test("rechaza saldos fuera de precision o rango", async () => {
  for (const saldoInicial of [1.001, 1_000_000_000_000]) {
    await assert.rejects(
      pipe.transform(
        { nombre: "Ahorros", tipo: "bancaria", moneda: "COP", saldoInicial },
        metadata(CrearCuentaDto),
      ),
      BadRequestException,
    );
  }
});
