import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegistroDto } from "./dto/registro.dto";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { UsuarioActual } from "./usuario-actual.decorator";
import { UsuarioAutenticado } from "./usuario-autenticado";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("registro")
  registrar(@Body() registroDto: RegistroDto) {
    return this.authService.registrar(registroDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@UsuarioActual() usuario: UsuarioAutenticado) {
    return usuario;
  }
}
