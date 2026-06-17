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
- Las creaciones de cuentas, transacciones, creditos y consultas IA deben validar limites del plan.

## Estrategia de migracion

1. Planes y usuarios.
2. Cuentas y categorias.
3. Transacciones.
4. Creditos y cuotas.

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

Definir si los contadores mensuales se calculan por consulta o se materializan.
