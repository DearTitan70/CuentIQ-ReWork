# CuentiQ - Estado del proyecto

## Analisis muy corto

El proyecto esta en definicion inicial. El alcance MVP ya fue recortado a gestion financiera personal para Colombia.

## Estado actual

- Producto: MVP para personas naturales definido.
- Arquitectura: monolito modular propuesto.
- Base de datos: migraciones Prisma de `planes`, `usuarios`, `cuentas` y estructura minima de `transacciones` creadas.
- API: modulo de cuentas cerrado con CRUD protegido, limite por plan, saldo calculado, aislamiento y cuenta principal no eliminable.
- Frontend: no iniciado.
- Backend: monolito NestJS con modulos `Auth` y `Cuentas`, y acceso mediante Prisma.
- Infraestructura: no iniciada.
- Testing: checks locales `npm run check:tarea1` a `npm run check:tarea9`; suites minimas de Auth y Cuentas con `npm test`.

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
++-- 20260617162000_crear_usuarios_y_planes/
++-- 20260617173000_crear_cuentas/
++-- 20260618120000_agregar_transacciones_y_proteger_principal/
scripts/
+-- check-tarea1.js
+-- check-tarea2.js
+-- ...
+-- check-tarea9.js
src/
+-- app.module.ts
+-- main.ts
+-- auth/
+-- cuentas/
+-- prisma/
tests/
+-- auth.test.ts
+-- cuentas-dto.test.ts
+-- cuentas-service.test.ts
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

`npm test` cubre Auth y Cuentas, incluido limite de plan, aislamiento entre usuarios, saldo calculado y proteccion de la cuenta principal.

## Proximos pasos

Continuar con el modulo de categorias.
