const fs = require("node:fs");
const assert = require("node:assert/strict");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const moduleFile = fs.readFileSync("src/auth/auth.module.ts", "utf8");
const strategy = fs.readFileSync("src/auth/jwt.strategy.ts", "utf8");
const guard = fs.readFileSync("src/auth/jwt-auth.guard.ts", "utf8");
const jwtConfig = fs.readFileSync("src/auth/jwt.config.ts", "utf8");

assert.equal(packageJson.scripts["check:tarea6"], "node scripts/check-tarea6.js");
assert.ok(packageJson.dependencies["@nestjs/passport"]);
assert.ok(packageJson.dependencies["passport-jwt"]);
assert.match(moduleFile, /JwtStrategy/);
assert.match(moduleFile, /JwtAuthGuard/);
assert.match(moduleFile, /exports:\s*\[AuthService,\s*JwtAuthGuard\]/);
assert.match(strategy, /ExtractJwt\.fromAuthHeaderAsBearerToken\(\)/);
assert.match(strategy, /ignoreExpiration:\s*false/);
assert.match(strategy, /secretOrKey:\s*leerJwtSecret\(configService\)/);
assert.match(strategy, /async validate\(payload: JwtPayload\)/);
assert.match(strategy, /where:\s*\{\s*id:\s*payload\.sub\s*\}/);
assert.match(strategy, /select:\s*\{[\s\S]*id:\s*true/);
assert.match(strategy, /TOKEN_INVALIDO/);
assert.match(guard, /extends AuthGuard\("jwt"\)/);
assert.match(guard, /UnauthorizedException/);
assert.match(guard, /TOKEN_INVALIDO/);
assert.match(jwtConfig, /leerJwtSecret/);

console.log("Tarea 6 OK");
