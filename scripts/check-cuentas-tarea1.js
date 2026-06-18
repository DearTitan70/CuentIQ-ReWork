const fs = require("node:fs");
const assert = require("node:assert/strict");

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
const migration = fs.readFileSync(
  "prisma/migrations/20260617173000_crear_cuentas/migration.sql",
  "utf8",
);

assert.match(schema, /enum TipoCuenta[\s\S]*BANCARIA\s+@map\("bancaria"\)[\s\S]*BILLETERA\s+@map\("billetera"\)/);
assert.match(schema, /model Usuario[\s\S]*cuentas\s+Cuenta\[\]/);
assert.match(schema, /model Cuenta[\s\S]*usuarioId\s+String\s+@map\("usuario_id"\)\s+@db\.Uuid/);
assert.match(schema, /model Cuenta[\s\S]*id\s+Int/);
assert.match(schema, /model Cuenta[\s\S]*moneda\s+Moneda/);
assert.match(schema, /model Cuenta[\s\S]*saldoInicial\s+Decimal\s+@map\("saldo_inicial"\)\s+@db\.Decimal\(14,\s*2\)/);
assert.match(schema, /model Cuenta[\s\S]*@@id\(\[usuarioId,\s*id\]\)/);
assert.match(schema, /model Cuenta[\s\S]*@@index\(\[usuarioId\]\)/);
assert.match(schema, /model Cuenta[\s\S]*@@map\("cuentas"\)/);
assert.match(migration, /CREATE TYPE "TipoCuenta" AS ENUM \('bancaria', 'billetera'\)/);
assert.match(migration, /CREATE TABLE "cuentas"/);
assert.match(migration, /CONSTRAINT "cuentas_pkey" PRIMARY KEY \("usuario_id", "id"\)/);
assert.match(migration, /CREATE INDEX "cuentas_usuario_id_idx" ON "cuentas"\("usuario_id"\)/);
assert.match(migration, /FOREIGN KEY \("usuario_id"\) REFERENCES "usuarios"\("id"\)/);

console.log("Cuentas tarea 1 OK");
