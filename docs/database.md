# CuentiQ - Modelo de datos inicial

## Analisis muy corto

El modelo inicial queda centrado en `usuario`. Organizaciones, membresias y roles salen del MVP porque el primer producto sera para personas naturales.

## Entidades

| Entidad | Justificacion |
| --- | --- |
| Usuario | Identidad autenticada y duena de los datos. |
| Plan | Suscripcion y limites comerciales por usuario. |
| Cuenta | Origen o destino de dinero personal. |
| Categoria | Clasificacion de ingresos, gastos y obligaciones. |
| Transaccion | Registro principal de movimientos financieros. |
| Credito | Obligacion financiera personal. |
| CuotaCredito | Calendario de pagos de un credito. |

## Implementacion Prisma actual

Las migraciones actuales crean `planes`, `usuarios`, `cuentas` y `transacciones`.

### `planes`

- `id`: UUID.
- `codigo`: unico; valores iniciales `gratuito`, `mensual`, `anual`.
- `nombre`.
- `limite_cuentas`.
- `limite_transacciones_mes`.
- `limite_creditos`.
- `limite_consultas_ia_mes`.
- `created_at`, `updated_at`.

### `usuarios`

- `id`: UUID.
- `email`: unico.
- `password_hash`.
- `nombre`.
- `moneda_base`: enum `COP` o `USD`, por defecto `COP`.
- `plan_id`: relacion obligatoria con `planes.id`.
- `created_at`, `updated_at`.

### `cuentas`

- `usuario_id`: UUID, parte de la llave primaria compuesta y relacion obligatoria con `usuarios.id`.
- `id`: entero, parte de la llave primaria compuesta. Es scoped por usuario para permitir cuenta por defecto `id = 0` por usuario.
- `nombre`.
- `tipo`: enum `TipoCuenta`, valores `bancaria` o `billetera`.
- `moneda`: enum `Moneda`, valores `COP` o `USD`.
- `saldo_inicial`: decimal `14,2`.
- `created_at`, `updated_at`.

`saldo_real` no se persiste: PostgreSQL agrega los movimientos asociados y la API los suma o resta de `saldo_inicial`.

La llave primaria es compuesta (`usuario_id`, `id`): `id = 0` identifica la cuenta principal dentro de cada usuario, no globalmente. La API no permite borrarla.

El registro de usuario crea atomicamente una cuenta `Principal` con `id = 0`, tipo `billetera`, moneda base `COP` y saldo inicial `0`. La cuenta se crea mediante nested write de Prisma, por lo que usuario y cuenta se confirman o revierten juntos.

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

## Planes iniciales

| Plan | Cuentas | Transacciones mensuales | Creditos | Consultas IA |
| --- | ---: | ---: | ---: | ---: |
| Gratuito | 2 | 50 | 2 | 3 |
| Mensual | 5 | 100 | 5 | 10 |
| Anual | 20 | 500 | 20 | 20 |

## Indices

- `usuarios.email` unico.
- `usuarios.plan_id`.
- `cuentas.usuario_id`.
- `categorias.usuario_id`.
- `transacciones.usuario_id, fecha`.
- `transacciones.cuenta_id, fecha`.
- `transacciones.moneda, fecha`.
- `creditos.usuario_id, estado`.
- `cuotas_credito.credito_id, fecha_vencimiento`.

## Restricciones

- Email unico.
- Moneda permitida: `COP` o `USD`.
- No se convierte entre COP y USD.
- Los agregados financieros se calculan separados por moneda.
- Monto de transaccion mayor a cero.
- Monto de credito mayor a cero.
- Cuota de credito mayor o igual a cero.
- Tipo de transaccion controlado por enum.
- Toda consulta financiera debe filtrar por usuario autenticado.
- Todo `find`, `update` y `delete` financiero sobre recurso puntual debe filtrar por `id` y `userId`.
- Las creaciones de cuentas, transacciones, creditos y consultas IA deben validar limites del plan.

## Estrategia de migracion

1. Planes y usuarios: implementada en `prisma/migrations/20260617162000_crear_usuarios_y_planes`.
2. Cuentas: implementada en `prisma/migrations/20260617173000_crear_cuentas`.
3. Categorias.
4. Transacciones: modelo minimo implementado en `prisma/migrations/20260618120000_agregar_transacciones_y_proteger_principal`.
5. Creditos y cuotas.

## Seed

`prisma/seed.js` carga los planes iniciales con `upsert` por `codigo`, asi que puede ejecutarse mas de una vez sin duplicar planes.

## Riesgos

- Si luego entran empresas, habra que agregar organizacion como frontera de datos.
- Borrado fisico de transacciones simplifica MVP, pero elimina historial.

## Testing

- Pruebas de restricciones de unicidad.
- Pruebas de integridad referencial.
- Pruebas de aislamiento por usuario.
- Pruebas de calculos separados para COP y USD.
- Prueba de borrado de transaccion y recalcule de balance.
- Pruebas de limites por plan.

## Proximos pasos

Implementar categorias y los endpoints de transacciones.
