import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "./jwt.payload";
import { leerJwtSecret } from "./jwt.config";
import { UsuarioAutenticado } from "./usuario-autenticado";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService)
    configService: ConfigService,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: leerJwtSecret(configService),
    });
  }

  async validate(payload: JwtPayload): Promise<UsuarioAutenticado> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nombre: true,
        monedaBase: true,
        planId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException({
        codigo: "TOKEN_INVALIDO",
        mensaje: "Token ausente, invalido o expirado.",
      });
    }

    return usuario;
  }
}
