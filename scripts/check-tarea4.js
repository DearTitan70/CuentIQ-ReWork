const fs = require("node:fs");
const assert = require("node:assert/strict");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const service = fs.readFileSync("src/auth/auth.service.ts", "utf8");
const password = fs.readFileSync("src/auth/password.ts", "utf8");

assert.equal(packageJson.scripts["check:tarea4"], "node scripts/check-tarea4.js");
assert.match(password, /scrypt/);
assert.match(password, /randomBytes/);
assert.match(password, /timingSafeEqual/);
assert.match(service, /email\s*=\s*registroDto\.email\.trim\(\)\.toLowerCase\(\)/);
assert.match(service, /codigo:\s*"gratuito"/);
assert.match(service, /passwordHash:\s*await hashearPassword/);
assert.match(service, /planId:\s*planGratuito\.id/);
assert.match(service, /token:\s*this\.firmarToken\(usuario\.id\)/);
assert.match(service, /P2002/);
assert.match(service, /EMAIL_YA_REGISTRADO/);
assert.match(service, /select:\s*usuarioBasicoSelect/);

console.log("Tarea 4 OK");
