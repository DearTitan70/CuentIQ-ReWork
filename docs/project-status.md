# CuentiQ - Estado del proyecto

## Analisis muy corto

El proyecto esta en definicion inicial. El alcance MVP ya fue recortado a gestion financiera personal para Colombia.

## Estado actual

- Producto: MVP para personas naturales definido.
- Arquitectura: monolito modular propuesto.
- Base de datos: modelo por usuario propuesto, sin schema definitivo.
- API: endpoints por usuario propuestos, sin DTOs finales.
- Frontend: no iniciado.
- Backend: no iniciado.
- Infraestructura: no iniciada.
- Testing: estrategia inicial definida.

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

Todavia no hay codigo ejecutable. La primera prueba sera una verificacion minima del entorno cuando se cree el proyecto tecnico.

## Proximos pasos

Crear el proyecto NestJS/React con Prisma.
