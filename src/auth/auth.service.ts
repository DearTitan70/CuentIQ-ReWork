import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegistroDto } from "./dto/registro.dto";
import { hashearPassword, verificarPassword } from "./password";

const usuarioBasicoSelect = {
  id: true,
  email: true,
  nombre: true,
  monedaBase: true,
  planId: true,
  createdAt: true,
  updatedAt: true,
};

const ventanaRateLimitMs = 15 * 60 * 1000;
const maxIntentosAuth = 5;
const intentosAuth = new Map<string, { cantidad: number; reiniciaEn: number }>();

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  firmarToken(usuarioId: string) {
    return this.jwtService.sign({ sub: usuarioId });
  }

  async registrar(registroDto: RegistroDto) {
    const email = registroDto.email.trim().toLowerCase();
    verificarRateLimitAuth(email);
    const planGratuito = await this.prisma.plan.findUnique({
      where: { codigo: "gratuito" },
      select: { id: true },
    });

    if (!planGratuito) {
      throw new NotFoundException({
        codigo: "PLAN_GRATUITO_NO_CONFIGURADO",
        mensaje: "El plan gratuito no esta configurado.",
      });
    }

    try {
      const usuario = await this.prisma.usuario.create({
        data: {
          email,
          passwordHash: await hashearPassword(registroDto.password),
          nombre: registroDto.nombre.trim(),
          planId: planGratuito.id,
        },
        select: usuarioBasicoSelect,
      });

      return {
        token: this.firmarToken(usuario.id),
        usuario,
      };
    } catch (error) {
      if (esErrorPrisma(error, "P2002")) {
        throw new ConflictException({
          codigo: "EMAIL_YA_REGISTRADO",
          mensaje: "El email ya esta registrado.",
        });
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();
    verificarRateLimitAuth(email);
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: {
        ...usuarioBasicoSelect,
        passwordHash: true,
      },
    });

    if (!usuario || !(await verificarPassword(loginDto.password, usuario.passwordHash))) {
      throw new UnauthorizedException({
        codigo: "CREDENCIALES_INVALIDAS",
        mensaje: "Email o password invalidos.",
      });
    }

    const { passwordHash, ...usuarioBasico } = usuario;
    intentosAuth.delete(email);

    return {
      token: this.firmarToken(usuario.id),
      usuario: usuarioBasico,
    };
  }
}

function esErrorPrisma(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function verificarRateLimitAuth(email: string) {
  const ahora = Date.now();
  const intento = intentosAuth.get(email);

  if (!intento || intento.reiniciaEn <= ahora) {
    intentosAuth.set(email, {
      cantidad: 1,
      reiniciaEn: ahora + ventanaRateLimitMs,
    });
    return;
  }

  if (intento.cantidad >= maxIntentosAuth) {
    throw new HttpException(
      {
        codigo: "DEMASIADOS_INTENTOS_AUTH",
        mensaje: "Demasiados intentos. Intenta de nuevo mas tarde.",
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  intento.cantidad += 1;
}
