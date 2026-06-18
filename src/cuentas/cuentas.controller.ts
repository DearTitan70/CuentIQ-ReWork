import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsuarioActual } from "../auth/usuario-actual.decorator";
import { UsuarioAutenticado } from "../auth/usuario-autenticado";
import { CuentasService } from "./cuentas.service";
import { ActualizarCuentaDto } from "./dto/actualizar-cuenta.dto";
import { CrearCuentaDto } from "./dto/crear-cuenta.dto";

@Controller("cuentas")
@UseGuards(JwtAuthGuard)
export class CuentasController {
  constructor(private readonly cuentasService: CuentasService) {}

  /** Crea una cuenta para el usuario autenticado y retorna la cuenta calculada. */
  @Post()
  crear(@UsuarioActual() usuario: UsuarioAutenticado, @Body() dto: CrearCuentaDto) {
    return this.cuentasService.crear(usuario.id, dto);
  }

  /** Lista las cuentas propias del usuario autenticado. */
  @Get()
  listar(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.cuentasService.listar(usuario.id);
  }

  /** Obtiene por id una cuenta del usuario autenticado. */
  @Get(":id")
  obtener(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.cuentasService.obtener(usuario.id, id);
  }

  /** Actualiza por id una cuenta del usuario autenticado. */
  @Patch(":id")
  actualizar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ActualizarCuentaDto,
  ) {
    return this.cuentasService.actualizar(usuario.id, id, dto);
  }

  /** Elimina por id una cuenta normal del usuario autenticado. */
  @Delete(":id")
  eliminar(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.cuentasService.eliminar(usuario.id, id);
  }
}
