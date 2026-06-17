# CuentiQ - Arquitectura inicial

## Analisis muy corto

Para un MVP de personas naturales con 1.000 usuarios, un monolito modular en NestJS es suficiente. No se justifica multi-tenancy por organizacion ni roles en la primera version.

## Arbol de carpetas propuesto

```txt
src/
+-- auth/
+-- usuarios/
+-- cuentas/
+-- categorias/
+-- transacciones/
+-- creditos/
+-- proyecciones/
+-- reportes/
+-- ia/
+-- planes/
+-- compartido/
```

## Responsabilidad de cada modulo

- `auth`: registro, login, JWT y recuperacion de acceso.
- `usuarios`: perfil, moneda base y configuracion financiera.
- `cuentas`: cuentas personales en COP o USD.
- `categorias`: clasificacion de ingresos, gastos y creditos.
- `transacciones`: ingresos, gastos y transferencias.
- `creditos`: deudas, cuotas, vencimientos y saldo pendiente.
- `proyecciones`: escenarios deterministicos de flujo y capacidad de pago.
- `reportes`: resumenes financieros, graficas, KPIs y exportacion PDF.
- `ia`: recomendaciones y proyecciones asistidas por OpenAI.
- `planes`: suscripcion y limites de cuentas, transacciones, creditos e IA.
- `compartido`: validaciones, errores, utilidades y DTOs comunes.

## Flujo de datos

1. React consume la API REST.
2. NestJS valida JWT.
3. Los controladores reciben DTOs validados.
4. Los servicios aplican reglas de negocio.
5. Prisma persiste en PostgreSQL.
6. Reportes y proyecciones calculan sobre datos del usuario separando COP y USD.
7. IA recibe solo el resumen financiero necesario.
8. La API responde DTOs, no entidades internas.

## Arquitectura

### Frontend

- React con Vite.
- Cliente HTTP centralizado.
- Rutas protegidas por sesion.
- Formularios con estados de carga, error y vacio.

### Backend

- NestJS como monolito modular.
- Modulos por dominio.
- Servicios con reglas de negocio.
- Prisma para acceso a datos.
- DTOs para requests y responses.
- `AuthModule` registra JWT con `JWT_SECRET` desde variables de entorno y expiracion `7d`.
- La app debe fallar al iniciar si falta `JWT_SECRET`.
- `JwtStrategy` valida tokens Bearer, respeta expiracion y carga el usuario minimo en `request.user`.
- Los servicios financieros deben recibir `userId` desde `request.user.id`; nunca desde body o query.

### Base de datos

- PostgreSQL como fuente de verdad.
- Datos financieros asociados directamente al usuario.
- Indices por usuario, fecha, moneda y estado.
- No hay conversion automatica entre COP y USD en MVP.

### IA

- OpenAI recomienda y ayuda a proyectar.
- Los calculos base deben ser deterministicos y testeables.
- La IA no reemplaza formulas financieras ni validaciones.
- Toda respuesta IA debe incluir el disclaimer definido por producto.

### Infraestructura

- Docker para entorno local y despliegue reproducible.
- Frontend, backend y PostgreSQL como servicios separados.

## Entidades iniciales

### Usuario

Persona autenticada y duena de sus datos financieros.

Relaciones:

- Usuario 1:N cuentas.
- Usuario 1:N categorias.
- Usuario 1:N transacciones.
- Usuario 1:N creditos.

### Cuenta

Cuenta financiera personal en COP o USD.

Cardinalidad:

- Usuario 1:N cuentas.
- Cuenta 1:N transacciones.

### Categoria

Clasifica ingresos, gastos y obligaciones.

Cardinalidad:

- Usuario 1:N categorias.
- Categoria 1:N transacciones.

### Transaccion

Movimiento financiero de ingreso, gasto o transferencia.

Cardinalidad:

- Usuario 1:N transacciones.
- Cuenta 1:N transacciones.
- Categoria 1:N transacciones.

### Credito

Obligacion financiera con saldo, tasa, cuotas y vencimientos.

Cardinalidad:

- Usuario 1:N creditos.
- Credito 1:N cuotas.

### Cuota de credito

Pago esperado o realizado de un credito.

Cardinalidad:

- Credito 1:N cuotas.

### Plan

Define limites comerciales por usuario.

Planes iniciales:

| Plan | Cuentas | Transacciones mensuales | Creditos | Consultas IA |
| --- | ---: | ---: | ---: | ---: |
| Gratuito | 2 | 50 | 2 | 3 |
| Mensual | 5 | 100 | 5 | 10 |
| Anual | 20 | 500 | 20 | 20 |

Cardinalidad:

- Plan 1:N usuarios.

## Relaciones y cardinalidad

```txt
Plan 1:N Usuario
Usuario 1:N Cuenta
Usuario 1:N Categoria
Usuario 1:N Transaccion
Usuario 1:N Credito
Cuenta 1:N Transaccion
Categoria 1:N Transaccion
Credito 1:N CuotaCredito
```

## Indices propuestos

- `usuarios.email` unico.
- `usuarios.plan_id`.
- `cuentas.usuario_id`.
- `categorias.usuario_id`.
- `transacciones.usuario_id, fecha`.
- `transacciones.cuenta_id, fecha`.
- `transacciones.moneda, fecha`.
- `creditos.usuario_id, estado`.
- `cuotas_credito.credito_id, fecha_vencimiento`.

## Restricciones iniciales

- Email unico por usuario.
- Moneda permitida: `COP` o `USD`.
- Los saldos, reportes y proyecciones deben agruparse por moneda.
- Monto de transaccion mayor a cero.
- Tipo de transaccion controlado por enum.
- Una transaccion pertenece a un solo usuario.
- Toda consulta financiera debe filtrar por usuario autenticado.
- Una cuota no puede existir sin credito.

## Estrategia de migracion

1. Usuarios y planes.
2. Cuentas y categorias.
3. Transacciones.
4. Creditos y cuotas.
5. Contadores mensuales de transacciones e IA si el plan lo requiere.

## API inicial propuesta

Los contratos preliminares estan documentados en `docs/api.md`.

## Validaciones de API

- Usuario autenticado.
- Recurso pertenece al usuario autenticado.
- Servicios financieros filtran recursos puntuales por `id` y `userId`.
- DTO de entrada.
- Validacion de tipos, montos, fechas, monedas y enums.
- Respuesta normalizada.
- Errores `400`, `401`, `404`, `409` y `429` cuando aplique.

## Riesgos

- IA con recomendaciones financieras debe tener limites y disclaimer.
- Borrar transacciones reduce trazabilidad, aunque es aceptable para gestion personal MVP.

## Testing

- Pruebas unitarias para calculos financieros.
- Pruebas de integracion para endpoints criticos.
- Prueba de aislamiento: un usuario no lee datos de otro.
- Pruebas de moneda COP/USD.
- Prueba de borrado de transacciones.
- Pruebas de limites por plan.
- Prueba de exportacion PDF.
- Prueba de disclaimer en respuestas IA.

## Proximos pasos

Crear el proyecto tecnico NestJS/React con Prisma.
