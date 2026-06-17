const fs = require("node:fs");
const assert = require("node:assert/strict");

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
const seed = fs.readFileSync("prisma/seed.js", "utf8");
const migration = fs.readFileSync(
  "prisma/migrations/20260617162000_crear_usuarios_y_planes/migration.sql",
  "utf8",
);

assert.match(schema, /model Usuario[\s\S]*@@map\("usuarios"\)/);
assert.match(schema, /model Plan[\s\S]*@@map\("planes"\)/);
assert.match(schema, /email\s+String\s+@unique/);
assert.match(schema, /monedaBase\s+Moneda\s+@default\(COP\)/);
assert.match(schema, /plan\s+Plan\s+@relation/);
assert.match(migration, /CREATE TABLE "usuarios"/);
assert.match(migration, /CREATE TABLE "planes"/);
assert.match(migration, /CREATE UNIQUE INDEX "usuarios_email_key"/);
assert.match(seed, /upsert/);
assert.match(seed, /codigo: "gratuito"/);
assert.match(seed, /codigo: "mensual"/);
assert.match(seed, /codigo: "anual"/);

console.log("Tarea 1 OK");
