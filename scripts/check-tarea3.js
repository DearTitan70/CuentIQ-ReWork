const fs = require("node:fs");
const assert = require("node:assert/strict");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const main = fs.readFileSync("src/main.ts", "utf8");
const registroDto = fs.readFileSync("src/auth/dto/registro.dto.ts", "utf8");
const loginDto = fs.readFileSync("src/auth/dto/login.dto.ts", "utf8");
const controller = fs.readFileSync("src/auth/auth.controller.ts", "utf8");

assert.ok(packageJson.dependencies["class-validator"]);
assert.ok(packageJson.dependencies["class-transformer"]);
assert.match(main, /new ValidationPipe/);
assert.match(main, /codigo:\s*"REQUEST_INVALIDO"/);
assert.match(main, /mensaje:\s*"La solicitud contiene datos invalidos\."/);
assert.match(registroDto, /class RegistroDto/);
assert.match(registroDto, /@IsEmail/);
assert.match(registroDto, /@MinLength\(8\)/);
assert.match(registroDto, /nombre!:\s*string/);
assert.match(loginDto, /class LoginDto/);
assert.match(loginDto, /@IsEmail/);
assert.match(loginDto, /password!:\s*string/);
assert.match(controller, /@Post\("registro"\)/);
assert.match(controller, /@Post\("login"\)/);
assert.match(controller, /@Body\(\) registroDto: RegistroDto/);
assert.match(controller, /@Body\(\) loginDto: LoginDto/);

console.log("Tarea 3 OK");
