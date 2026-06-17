const fs = require("node:fs");
const assert = require("node:assert/strict");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const authModule = fs.readFileSync("src/auth/auth.module.ts", "utf8");
const authController = fs.readFileSync("src/auth/auth.controller.ts", "utf8");
const authService = fs.readFileSync("src/auth/auth.service.ts", "utf8");
const jwtConfig = fs.readFileSync("src/auth/jwt.config.ts", "utf8");
const prismaService = fs.readFileSync("src/prisma/prisma.service.ts", "utf8");

assert.equal(packageJson.scripts.build, "tsc -p tsconfig.json");
assert.ok(packageJson.dependencies["@nestjs/jwt"]);
assert.ok(packageJson.dependencies["@nestjs/config"]);
assert.match(authModule, /class AuthModule/);
assert.match(authModule, /JwtModule\.registerAsync/);
assert.match(authModule, /crearJwtConfig/);
assert.match(authController, /@Controller\("auth"\)/);
assert.match(authService, /class AuthService/);
assert.match(authService, /JwtService/);
assert.match(authService, /PrismaService/);
assert.match(jwtConfig, /JWT_SECRET es requerido/);
assert.match(jwtConfig, /expiresIn:\s*"7d"/);
assert.match(prismaService, /extends PrismaClient/);

console.log("Tarea 2 OK");
