const fs = require("node:fs");
const assert = require("node:assert/strict");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const security = fs.readFileSync("docs/security.md", "utf8");
const api = fs.readFileSync("docs/api.md", "utf8");
const architecture = fs.readFileSync("docs/architecture.md", "utf8");
const database = fs.readFileSync("docs/database.md", "utf8");

assert.equal(packageJson.scripts["check:tarea8"], "node scripts/check-tarea8.js");
assert.match(security, /request\.user\.id/);
assert.match(security, /@UsuarioActual\(\)/);
assert.match(security, /nunca debe enviar `userId`/);
assert.match(security, /filtrar por `id` y `userId`/);
assert.match(security, /prueba de acceso cruzado/);
assert.match(api, /Ningun endpoint financiero acepta `userId`/);
assert.match(architecture, /recibir `userId` desde `request\.user\.id`/);
assert.match(database, /filtrar por `id` y `userId`/);

for (const endpoint of [
  "POST /cuentas",
  "GET /cuentas",
  "PATCH /cuentas/:id",
  "DELETE /cuentas/:id",
  "POST /categorias",
  "GET /categorias",
  "POST /transacciones",
  "GET /transacciones",
  "PATCH /transacciones/:id",
  "DELETE /transacciones/:id",
  "POST /creditos",
  "GET /creditos",
  "GET /creditos/:id",
]) {
  const line = api.split("\n").find((row) => row.includes(`\`${endpoint}\``));
  assert.ok(line, `${endpoint} documentado`);
  assert.doesNotMatch(line, /userId/);
}

console.log("Tarea 8 OK");
