const fs = require("node:fs");
const assert = require("node:assert/strict");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const controller = fs.readFileSync("src/auth/auth.controller.ts", "utf8");
const decorator = fs.readFileSync("src/auth/usuario-actual.decorator.ts", "utf8");
const usuarioAutenticado = fs.readFileSync("src/auth/usuario-autenticado.ts", "utf8");
const strategy = fs.readFileSync("src/auth/jwt.strategy.ts", "utf8");

assert.equal(packageJson.scripts["check:tarea7"], "node scripts/check-tarea7.js");
assert.match(controller, /@Get\("me"\)/);
assert.match(controller, /@UseGuards\(JwtAuthGuard\)/);
assert.match(controller, /me\(@UsuarioActual\(\) usuario: UsuarioAutenticado\)/);
assert.match(controller, /return usuario/);
assert.match(decorator, /request\.user as UsuarioAutenticado/);
assert.match(usuarioAutenticado, /id:\s*string/);
assert.match(usuarioAutenticado, /email:\s*string/);
assert.match(usuarioAutenticado, /nombre:\s*string/);
assert.match(usuarioAutenticado, /monedaBase:\s*"COP" \| "USD"/);
assert.match(usuarioAutenticado, /planId:\s*string/);
assert.match(strategy, /Promise<UsuarioAutenticado>/);
assert.doesNotMatch(strategy, /passwordHash:\s*true/);

console.log("Tarea 7 OK");
