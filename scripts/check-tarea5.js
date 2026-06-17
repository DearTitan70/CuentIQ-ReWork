const fs = require("node:fs");
const assert = require("node:assert/strict");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const service = fs.readFileSync("src/auth/auth.service.ts", "utf8");
const password = fs.readFileSync("src/auth/password.ts", "utf8");
const jwtConfig = fs.readFileSync("src/auth/jwt.config.ts", "utf8");

assert.equal(packageJson.scripts["check:tarea5"], "node scripts/check-tarea5.js");
assert.match(service, /async login\(loginDto: LoginDto\)/);
assert.match(service, /loginDto\.email\.trim\(\)\.toLowerCase\(\)/);
assert.match(service, /this\.prisma\.usuario\.findUnique/);
assert.match(service, /passwordHash:\s*true/);
assert.match(service, /verificarPassword\(loginDto\.password,\s*usuario\.passwordHash\)/);
assert.match(service, /UnauthorizedException/);
assert.match(service, /CREDENCIALES_INVALIDAS/);
assert.match(service, /const \{ passwordHash, \.\.\.usuarioBasico \} = usuario/);
assert.match(service, /token:\s*this\.firmarToken\(usuario\.id\)/);
assert.match(password, /timingSafeEqual/);
assert.match(jwtConfig, /expiresIn:\s*"7d" as const/);

console.log("Tarea 5 OK");
