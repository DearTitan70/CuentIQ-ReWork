# Tasks - Modulo Cuentas

## Contexto

Implementar el primer recurso financiero del MVP: cuentas bancarias y billeteras personales en COP o USD. El modulo debe apoyarse en Auth ya terminado, tomar siempre el usuario desde `request.user.id` y respetar limites por plan.

No incluir frontend todavia: el proyecto indica que React/Vite no esta iniciado. Primero cerrar contrato backend y pruebas; la pantalla de cuentas se agrega cuando exista la base frontend.

## Dependencias previas

- Modulo Auth completado.
- `JwtAuthGuard` disponible para proteger endpoints.
- Prisma y PostgreSQL funcionando.
- Planes cargados con limites de cuentas.
- Formato de errores `{ codigo, mensaje }` definido.

## Decisiones para este modulo

- `Cuenta.id` sera numerico y scoped por usuario para permitir cuenta por defecto `id = 0` en cada usuario.
- Toda operacion puntual filtrara por `id` y `usuarioId`.
- La cuenta por defecto `id = 0` se crea automaticamente para cada usuario y no se puede borrar.
- `saldoInicial` se persiste.
- `saldoReal` se devuelve calculado, no editable. Mientras no exista `transacciones`, sera igual a `saldoInicial`; al implementar movimientos, se suma/resta desde transacciones.

## Tareas

### 1. Definir modelo Prisma de cuentas

Estado: completada.

**Objetivo:** agregar persistencia minima para cuentas personales.

**Detalle:**

- Crear modelo `Cuenta` asociado a `Usuario`.
- Campos minimos: `usuarioId`, `id`, `nombre`, `tipo`, `moneda`, `saldoInicial`, `createdAt`, `updatedAt`.
- Usar `id` numerico scoped por usuario para permitir `id = 0` por usuario.
- Agregar indice por `usuarioId`.
- Agregar validacion de moneda `COP` o `USD`.
- Definir tipos iniciales simples: `bancaria` y `billetera`.

**Dependencias:** Auth, Prisma y modelo `Usuario`.

**Riesgos:**

- Si `Cuenta.id` se modela como id global, no se puede tener `id = 0` por usuario.
- Si se agregan demasiados tipos de cuenta ahora, se abre alcance innecesario.

**Criterios de aceptacion:**

- [x] La migracion crea la tabla `cuentas`.
- [x] Cada cuenta pertenece a un usuario.
- [x] Un usuario puede tener una cuenta con `id = 0`.
- [x] Dos usuarios pueden tener su propia cuenta `id = 0`.
- [x] La moneda solo acepta `COP` o `USD`.

### 2. Crear cuenta por defecto al registrar usuario

Estado: completada.

**Objetivo:** asegurar que todo usuario nuevo tenga una cuenta base no eliminable.

**Detalle:**

- Al completar `POST /auth/registro`, crear cuenta `id = 0` para el usuario.
- Nombre sugerido: `Principal`.
- Tipo sugerido: `billetera`.
- Moneda: usar `monedaBase` del usuario.
- `saldoInicial`: `0`.
- Crear usuario y cuenta por defecto en una transaccion de base de datos.

**Dependencias:** tarea 1 y registro de Auth.

**Riesgos:**

- Usuario creado sin cuenta si falla la segunda escritura.
- Duplicar cuenta `id = 0` si el flujo de registro se reintenta mal.

**Criterios de aceptacion:**

- [x] Todo usuario nuevo queda con cuenta `id = 0`.
- [x] La creacion de usuario falla completa si no se puede crear la cuenta por defecto.
- [x] La respuesta de registro no expone campos internos de cuenta.

### 3. Implementar DTOs y validaciones de cuentas

Estado: completada.

**Objetivo:** validar requests antes de tocar base de datos.

**Detalle:**

- Crear DTO para `POST /cuentas` con `nombre`, `tipo`, `moneda`, `saldoInicial`.
- Crear DTO para `PATCH /cuentas/:id` con campos editables.
- Validar nombre requerido.
- Validar tipo permitido.
- Validar moneda `COP` o `USD`.
- Validar `saldoInicial` numerico.
- No aceptar `usuarioId`, `saldoReal` ni flags internos desde el request.

**Dependencias:** tarea 1.

**Riesgos:**

- Permitir que el frontend envie `usuarioId`.
- Permitir editar `saldoReal`, que debe ser calculado.

**Criterios de aceptacion:**

- [x] Requests invalidos responden `400`.
- [x] El formato de error sigue `{ codigo, mensaje }`.
- [x] `usuarioId` enviado por body se ignora o rechaza.
- [x] `saldoReal` no es aceptado como campo editable.

### 4. Crear `CuentasModule`, controller y service

Estado: completada.

**Objetivo:** exponer el CRUD minimo de cuentas.

**Detalle:**

- Crear `CuentasModule`, `CuentasController` y `CuentasService`.
- Proteger todos los endpoints con `JwtAuthGuard`.
- Obtener `usuarioId` desde `request.user.id`.
- Implementar:
  - `POST /cuentas`
  - `GET /cuentas`
  - `GET /cuentas/:id`
  - `PATCH /cuentas/:id`
  - `DELETE /cuentas/:id`
- Mantener controladores delgados y reglas en service.

**Dependencias:** tareas 1 y 3.

**Riesgos:**

- Repetir logica de Auth dentro de Cuentas.
- Consultar cuentas sin filtro por usuario.

**Criterios de aceptacion:**

- [x] Todos los endpoints requieren JWT.
- [x] Ningun endpoint financiero acepta `userId` desde body o query.
- [x] Las operaciones puntuales filtran por `id` y `usuarioId`.
- [x] Recursos inexistentes o de otro usuario responden `404`.

### 5. Implementar creacion de cuentas con limite de plan

Estado: completada.

**Objetivo:** permitir crear cuentas respetando el plan del usuario.

**Detalle:**

- Antes de crear, contar cuentas existentes del usuario.
- Comparar contra `Plan.limiteCuentas`.
- Asignar el siguiente `id` numerico disponible para ese usuario.
- Guardar `saldoInicial`.
- Responder cuenta creada con `saldoReal`.

**Dependencias:** tareas 1, 3 y 4.

**Riesgos:**

- Condicion de carrera al calcular el siguiente `id`.
- Contar mal la cuenta por defecto dentro del limite.

**Criterios de aceptacion:**

- [x] Un usuario puede crear una cuenta valida.
- [x] El plan gratuito permite maximo 2 cuentas en total, incluyendo `id = 0`.
- [x] Al superar el limite responde `429`.
- [x] La respuesta incluye `saldoInicial` y `saldoReal`.

### 6. Implementar listado y detalle con saldo real calculado

Estado: completada.

**Objetivo:** devolver cuentas del usuario con saldo real no editable.

**Detalle:**

- `GET /cuentas` lista solo cuentas del usuario autenticado.
- `GET /cuentas/:id` devuelve solo cuenta propia.
- Incluir `saldoReal` en la respuesta.
- Mientras no exista `transacciones`, calcular `saldoReal = saldoInicial`.
- Dejar el calculo encapsulado en una funcion del service para reemplazarlo cuando existan movimientos.

**Dependencias:** tarea 4.

**Riesgos:**

- Mezclar COP y USD en calculos futuros.
- Guardar `saldoReal` y desincronizarlo cuando se borren movimientos.

**Criterios de aceptacion:**

- [x] El listado no muestra cuentas de otros usuarios.
- [x] El detalle de cuenta ajena responde `404`.
- [x] `saldoReal` se calcula y no se lee desde un campo persistido.
- [x] Con cero movimientos, `saldoReal` es igual a `saldoInicial`.

### 7. Implementar actualizacion de cuentas

Estado: completada.

**Objetivo:** editar datos basicos sin romper saldos calculados.

**Detalle:**

- Permitir editar `nombre` y `tipo`.
- Permitir editar `moneda` solo si la cuenta no tiene movimientos cuando exista `transacciones`.
- Permitir editar `saldoInicial`.
- No permitir cambiar `id`.
- No permitir cambiar `usuarioId`.
- No permitir editar `saldoReal`.

**Dependencias:** tareas 3, 4 y 6.

**Riesgos:**

- Cambiar moneda en una cuenta con movimientos futuros y corromper reportes.
- Permitir actualizar la cuenta de otro usuario.

**Criterios de aceptacion:**

- [x] Actualizar cuenta propia responde cuenta actualizada.
- [x] Actualizar cuenta ajena responde `404`.
- [x] Cambiar `saldoInicial` recalcula `saldoReal`.
- [x] `id`, `usuarioId` y `saldoReal` no son editables.

### 8. Implementar borrado de cuentas

Estado: completada.

**Objetivo:** permitir borrar cuentas normales sin borrar la cuenta por defecto.

**Detalle:**

- Bloquear `DELETE /cuentas/0`.
- Borrar solo cuentas propias.
- Mientras no exista `transacciones`, permitir borrar cuentas sin movimientos.
- Cuando exista `transacciones`, bloquear borrado si hay movimientos asociados.
- Responder `409` para cuenta por defecto o cuenta con movimientos.

**Dependencias:** tarea 4.

**Riesgos:**

- Borrar `id = 0` deja al usuario sin cuenta base.
- Borrar cuenta con movimientos rompe balances y reportes.

**Criterios de aceptacion:**

- [x] Cuenta `id = 0` no se puede borrar.
- [x] Cuenta propia sin movimientos se puede borrar.
- [x] Cuenta ajena responde `404`.
- [x] La proteccion de cuentas con movimientos queda exigida para cuando exista `transacciones`.

### 9. Agregar pruebas minimas de cuentas

Estado: completada.

**Objetivo:** cubrir reglas criticas del primer recurso financiero.

**Detalle:**

- Probar que registro crea cuenta `id = 0`.
- Probar creacion de cuenta valida.
- Probar limite del plan gratuito.
- Probar listado filtrado por usuario.
- Probar acceso cruzado entre dos usuarios.
- Probar que `DELETE /cuentas/0` responde `409`.
- Probar que `saldoReal` iguala `saldoInicial` sin movimientos.

**Dependencias:** tareas 2, 4, 5, 6 y 8.

**Riesgos:**

- Tests demasiado grandes o acoplados a detalles internos.
- No cubrir aislamiento del primer recurso financiero.

**Criterios de aceptacion:**

- [x] `npm test` cubre cuentas.
- [x] Existe prueba de acceso cruzado requerida por `docs/security.md`.
- [x] La suite falla si se elimina el filtro por `usuarioId`.
- [x] La suite falla si se permite borrar `id = 0`.

### 10. Actualizar documentacion del modulo

Estado: completada.

**Objetivo:** mantener docs alineados con la implementacion real.

**Detalle:**

- Actualizar `docs/database.md` con campos reales de `Cuenta`.
- Actualizar `docs/api.md` con DTOs exactos de cuentas.
- Actualizar `docs/project-status.md` al cerrar el modulo.
- Registrar decision de `id = 0` scoped por usuario si no queda ya documentada.

**Dependencias:** tareas 1 a 9.

**Riesgos:**

- Docs prometen campos o endpoints que no existen.
- El criterio `id = 0` queda ambiguo para transacciones.

**Criterios de aceptacion:**

- [x] La documentacion coincide con endpoints y modelo reales.
- [x] Queda claro que `id = 0` es por usuario.
- [x] Queda claro que `saldoReal` se calcula desde `saldoInicial + movimientos`.

## Orden recomendado

1. Modelo Prisma de cuentas.
2. Cuenta por defecto en registro.
3. DTOs.
4. Modulo, controller y service.
5. Crear cuenta con limite de plan.
6. Listado y detalle con saldo real.
7. Actualizacion.
8. Borrado.
9. Pruebas minimas.
10. Documentacion.

## Fuera de alcance

- Frontend de cuentas, hasta iniciar React/Vite.
- Integraciones bancarias.
- Conciliacion bancaria.
- Transferencias entre cuentas, hasta modulo Transacciones.
- Saldos convertidos entre COP y USD.
- Historial/auditoria de cambios de saldo inicial.
