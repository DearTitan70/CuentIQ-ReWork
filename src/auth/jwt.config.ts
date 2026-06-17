import { ConfigService } from "@nestjs/config";

export function leerJwtSecret(configService: ConfigService) {
  return crearJwtConfig(configService.get<string>("JWT_SECRET")).secret;
}

export function crearJwtConfig(secret?: string) {
  if (!secret) {
    throw new Error("JWT_SECRET es requerido para iniciar AuthModule");
  }

  if (secret.length < 32) {
    throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
  }

  return {
    secret,
    signOptions: { expiresIn: "7d" as const },
  };
}
