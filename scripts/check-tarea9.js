const fs = require("node:fs");
const assert = require("node:assert/strict");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const testFile = fs.readFileSync("tests/auth.test.ts", "utf8");

assert.equal(packageJson.scripts.test, "node --import tsx --test tests/**/*.test.ts");
assert.equal(packageJson.scripts["check:tarea9"], "node scripts/check-tarea9.js");
assert.ok(packageJson.devDependencies.tsx);
assert.match(testFile, /registro exitoso/);
assert.match(testFile, /registro duplicado responde 409/);
assert.match(testFile, /login exitoso/);
assert.match(testFile, /login invalido responde 401/);
assert.match(testFile, /GET \/auth\/me sin token/);
assert.match(testFile, /GET \/auth\/me con token valido/);
assert.match(testFile, /passwordHash/);
assert.match(testFile, /REQUEST_INVALIDO/);
assert.match(testFile, /CREDENCIALES_INVALIDAS/);
assert.match(testFile, /EMAIL_YA_REGISTRADO/);
assert.match(testFile, /expiresIn, "7d"/);

console.log("Tarea 9 OK");
