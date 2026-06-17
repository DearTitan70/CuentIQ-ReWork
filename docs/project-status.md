# CuentiQ - Estado del proyecto

## Analisis muy corto

El proyecto esta en definicion inicial. El alcance MVP ya fue recortado a gestion financiera personal para Colombia.

## Estado actual

- Producto: MVP para personas naturales definido.
- Arquitectura: monolito modular propuesto.
- Base de datos: primera migracion Prisma de `planes` y `usuarios` creada.
- API: registro, login, guard JWT, `GET /auth/me` y contrato de aislamiento por `userId` implementados.
- Frontend: no iniciado.
- Backend: base NestJS minima con `AuthModule`, `AuthController`, `AuthService` y `PrismaService`.
- Infraestructura: no iniciada.
- Testing: checks locales `npm run check:tarea1` a `npm run check:tarea9`; suite minima Auth con `npm test`.

## Estructura actual

```txt
docs/
+-- api.md
+-- architecture.md
+-- coding-rules.md
+-- database.md
+-- decisions.md
+-- product.md
+-- project-status.md
+-- roadmap.md
+-- security.md
+-- tasks.md
prisma/
+-- schema.prisma
+-- seed.js
+-- migrations/
scripts/
+-- check-tarea1.js
+-- check-tarea2.js
+-- ...
+-- check-tarea9.js
src/
+-- app.module.ts
+-- main.ts
+-- auth/
+-- prisma/
tests/
+-- auth.test.ts
```

## Decisiones cerradas

- MVP para personas naturales.
- Sin organizaciones multiusuario.
- Sin roles en primera version.
- Gestion financiera, no contabilidad formal.
- Colombia como mercado inicial.
- COP y USD permitidos.
- COP y USD se muestran separados, sin conversion.
- Transacciones borrables.
- Modelo comercial por usuario.
- Planes gratuito, mensual y anual definidos.
- IA para recomendar y proyectar.
- Disclaimer IA definido.
- Exportacion solo PDF.

## Pendientes criticos

No hay pendientes criticos de alcance MVP.

## Riesgos

- Borrado fisico reduce trazabilidad, aceptado para MVP personal.

## Testing

La suite minima de Auth corre con `npm test` y cubre registro, login, validacion, guard JWT y ausencia de `passwordHash` en respuestas.

## Proximos pasos

Continuar con perfil financiero del usuario o primer recurso financiero.
