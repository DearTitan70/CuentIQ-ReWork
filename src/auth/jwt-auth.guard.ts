import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = unknown>(error: unknown, user: TUser) {
    if (error || !user) {
      throw new UnauthorizedException({
        codigo: "TOKEN_INVALIDO",
        mensaje: "Token ausente, invalido o expirado.",
      });
    }

    return user;
  }
}
