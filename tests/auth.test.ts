import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException, INestApplication, Module, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { NestFactory } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { AddressInfo } from "node:net";
import { AuthController } from "../src/auth/auth.controller";
import { AuthService } from "../src/auth/auth.service";
import { JwtAuthGuard } from "../src/auth/jwt-auth.guard";
import { JwtStrategy } from "../src/auth/jwt.strategy";
import { crearJwtConfig } from "../src/auth/jwt.config";
import { hashearPassword } from "../src/auth/password";
import { RegistroDto } from "../src/auth/dto/registro.dto";
import { PrismaService } from "../src/prisma/prisma.service";

const usuarioBase = {
  id: "user-1",
  email: "camilo@example.com",
  nombre: "Camilo",
  monedaBase: "COP",
  planId: "plan-gratis",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function crearJwtService() {
  return {
    sign(payload: { sub: string }) {
      return `token:${payload.sub}`;
    },
  };
}

const jwtSecretTest = "test-secret-con-32-caracteres-minimo";

function crearPrismaMock() {
  const estado = {
    plan: { id: "plan-gratis" },
    usuario: null as null | (typeof usuarioBase & { passwordHash: string }),
  };

  return {
    estado,
    prisma: {
      plan: {
        findUnique: async () => estado.plan,
      },
      usuario: {
        create: async ({ data, select }: any) => {
          if (estado.usuario?.email === data.email) {
            throw { code: "P2002" };
          }

          estado.usuario = {
            ...usuarioBase,
            email: data.email,
            nombre: data.nombre,
            planId: data.planId,
            passwordHash: data.passwordHash,
          };

          return aplicarSelect(estado.usuario, select);
        },
        findUnique: async ({ where, select }: any) => {
          const coincideEmail = "email" in where && estado.usuario?.email === where.email;
          const coincideId = "id" in where && estado.usuario?.id === where.id;

          if (!estado.usuario || (!coincideEmail && !coincideId)) {
            return null;
          }

          return aplicarSelect(estado.usuario, select);
        },
      },
    },
  };
}

function aplicarSelect<T extends Record<string, unknown>>(objeto: T, select: Record<string, boolean>) {
  return Object.fromEntries(
    Object.entries(select)
      .filter(([, incluido]) => incluido)
      .map(([campo]) => [campo, objeto[campo]]),
  );
}

function crearServicio() {
  const { estado, prisma } = crearPrismaMock();
  return {
    estado,
    service: new AuthService(crearJwtService() as any, prisma as any),
  };
}

async function crearAppAuth(prisma: any) {
  @Module({
    imports: [JwtModule.register(crearJwtConfig(jwtSecretTest)), PassportModule],
    controllers: [AuthController],
    providers: [
      AuthService,
      JwtAuthGuard,
      JwtStrategy,
      { provide: PrismaService, useValue: prisma },
      { provide: ConfigService, useValue: { get: () => jwtSecretTest } },
    ],
  })
  class TestAuthModule {}

  const app = await NestFactory.create(TestAuthModule, {
    abortOnError: false,
    logger: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: () =>
        new BadRequestException({
          codigo: "REQUEST_INVALIDO",
          mensaje: "La solicitud contiene datos invalidos.",
        }),
    }),
  );
  await app.listen(0);

  return app;
}

function url(app: INestApplication, path: string) {
  const address = app.getHttpServer().address() as AddressInfo;
  return `http://127.0.0.1:${address.port}${path}`;
}

async function postJson(app: INestApplication, path: string, body: unknown) {
  const respuesta = await fetch(url(app, path), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  return { status: respuesta.status, body: await respuesta.json() };
}

test("registro exitoso hashea password, normaliza email y no expone passwordHash", async () => {
  const { estado, service } = crearServicio();
  const respuesta = await service.registrar({
    email: " Camilo@Example.COM ",
    password: "password123",
    nombre: " Camilo ",
  });

  assert.equal(respuesta.token, "token:user-1");
  assert.equal(respuesta.usuario.email, "camilo@example.com");
  assert.equal(respuesta.usuario.nombre, "Camilo");
  assert.equal(respuesta.usuario.planId, "plan-gratis");
  assert.ok(estado.usuario?.passwordHash.startsWith("scrypt:"));
  assert.notEqual(estado.usuario?.passwordHash, "password123");
  assert.equal("passwordHash" in respuesta.usuario, false);
});

test("POST /auth/registro duplicado responde 409", async () => {
  const { prisma } = crearPrismaMock();
  const app = await crearAppAuth(prisma);
  const dto = { email: "camilo@example.com", password: "password123", nombre: "Camilo" };

  try {
    await postJson(app, "/auth/registro", dto);
    const respuesta = await postJson(app, "/auth/registro", dto);

    assert.equal(respuesta.status, 409);
    assert.equal(respuesta.body.codigo, "EMAIL_YA_REGISTRADO");
  } finally {
    await app.close();
  }
});

test("POST /auth/login exitoso devuelve token y usuario sin passwordHash", async () => {
  const { prisma } = crearPrismaMock();
  const app = await crearAppAuth(prisma);

  try {
    await postJson(app, "/auth/registro", {
      email: "camilo@example.com",
      password: "password123",
      nombre: "Camilo",
    });

    const respuesta = await postJson(app, "/auth/login", {
      email: " CAMILO@example.com ",
      password: "password123",
    });

    assert.equal(respuesta.status, 201);
    assert.equal(typeof respuesta.body.token, "string");
    assert.equal(respuesta.body.usuario.email, "camilo@example.com");
    assert.equal("passwordHash" in respuesta.body.usuario, false);
  } finally {
    await app.close();
  }
});

test("POST /auth/login invalido responde 401", async () => {
  const { prisma } = crearPrismaMock();
  const app = await crearAppAuth(prisma);

  try {
    await postJson(app, "/auth/registro", {
      email: "camilo@example.com",
      password: "password123",
      nombre: "Camilo",
    });

    const respuesta = await postJson(app, "/auth/login", {
      email: "camilo@example.com",
      password: "mal-password",
    });

    assert.equal(respuesta.status, 401);
    assert.equal(respuesta.body.codigo, "CREDENCIALES_INVALIDAS");
  } finally {
    await app.close();
  }
});

test("GET /auth/me sin token responde 401", async () => {
  const { prisma } = crearPrismaMock();
  const app = await crearAppAuth(prisma);

  try {
    const respuesta = await fetch(url(app, "/auth/me"));
    const body = await respuesta.json();

    assert.equal(respuesta.status, 401);
    assert.equal(body.codigo, "TOKEN_INVALIDO");
  } finally {
    await app.close();
  }
});

test("GET /auth/me con token valido devuelve usuario basico", async () => {
  const { prisma } = crearPrismaMock();
  const app = await crearAppAuth(prisma);

  try {
    await postJson(app, "/auth/registro", {
      email: "camilo@example.com",
      password: "password123",
      nombre: "Camilo",
    });
    const login = await postJson(app, "/auth/login", {
      email: "camilo@example.com",
      password: "password123",
    });

    const respuesta = await fetch(url(app, "/auth/me"), {
      headers: { authorization: `Bearer ${login.body.token}` },
    });
    const body = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.deepEqual(Object.keys(body).sort(), [
      "createdAt",
      "email",
      "id",
      "monedaBase",
      "nombre",
      "planId",
      "updatedAt",
    ]);
    assert.equal(body.id, "user-1");
    assert.equal(body.email, "camilo@example.com");
  } finally {
    await app.close();
  }
});

test("DTO invalido responde 400 con formato { codigo, mensaje }", async () => {
  const pipe = new ValidationPipe({
    exceptionFactory: () =>
      new BadRequestException({
        codigo: "REQUEST_INVALIDO",
        mensaje: "La solicitud contiene datos invalidos.",
      }),
  });

  await assert.rejects(
    () =>
      pipe.transform(
        { email: "no-es-email", password: "123", nombre: "" },
        { type: "body", metatype: RegistroDto },
      ),
    (error: any) => {
      assert.equal(error.getStatus(), 400);
      assert.equal(error.getResponse().codigo, "REQUEST_INVALIDO");
      return true;
    },
  );
});

test("nombre con solo espacios responde 400", async () => {
  const pipe = new ValidationPipe({
    transform: true,
    exceptionFactory: () =>
      new BadRequestException({
        codigo: "REQUEST_INVALIDO",
        mensaje: "La solicitud contiene datos invalidos.",
      }),
  });

  await assert.rejects(
    () =>
      pipe.transform(
        { email: "camilo@example.com", password: "password123", nombre: "   " },
        { type: "body", metatype: RegistroDto },
      ),
    (error: any) => {
      assert.equal(error.getStatus(), 400);
      assert.equal(error.getResponse().codigo, "REQUEST_INVALIDO");
      return true;
    },
  );
});

test("JWT expira en 7 dias", () => {
  assert.equal(crearJwtConfig(jwtSecretTest).signOptions.expiresIn, "7d");
});

test("JWT_SECRET debil falla al iniciar", () => {
  assert.throws(() => crearJwtConfig("secret"), /32 caracteres/);
});

test("password no se guarda en texto plano", async () => {
  const passwordHash = await hashearPassword("password123");

  assert.notEqual(passwordHash, "password123");
  assert.ok(passwordHash.startsWith("scrypt:"));
});

test("login limita intentos repetidos", async () => {
  const { prisma } = crearPrismaMock();
  const app = await crearAppAuth(prisma);

  try {
    await postJson(app, "/auth/registro", {
      email: "rate-limit@example.com",
      password: "password123",
      nombre: "Camilo",
    });

    for (let i = 0; i < 4; i += 1) {
      const respuesta = await postJson(app, "/auth/login", {
        email: "rate-limit@example.com",
        password: "mal-password",
      });
      assert.equal(respuesta.status, 401);
    }

    const respuesta = await postJson(app, "/auth/login", {
      email: "rate-limit@example.com",
      password: "mal-password",
    });

    assert.equal(respuesta.status, 429);
    assert.equal(respuesta.body.codigo, "DEMASIADOS_INTENTOS_AUTH");
  } finally {
    await app.close();
  }
});
