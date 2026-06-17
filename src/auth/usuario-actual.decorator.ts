import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UsuarioAutenticado } from "./usuario-autenticado";

export const UsuarioActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as UsuarioAutenticado;
  },
);
