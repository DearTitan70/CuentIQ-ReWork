const fs = require("node:fs");
const assert = require("node:assert/strict");

const service = fs.readFileSync("src/auth/auth.service.ts", "utf8");
const tests = fs.readFileSync("tests/auth.test.ts", "utf8");

assert.match(service, /usuario\.create\(\{[\s\S]*cuentas:\s*\{[\s\S]*create:\s*\{/);
assert.match(service, /id:\s*0/);
assert.match(service, /nombre:\s*"Principal"/);
assert.match(service, /tipo:\s*"BILLETERA"/);
assert.match(service, /moneda:\s*"COP"/);
assert.match(service, /saldoInicial:\s*0/);
assert.match(tests, /registro depende de una escritura atomica/);
assert.match(tests, /"cuentas" in respuesta\.usuario,\s*false/);

console.log("Cuentas tarea 2 OK");
