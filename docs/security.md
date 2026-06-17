# CuentiQ - Seguridad y aislamiento

## Aislamiento por usuario

Todo endpoint financiero protegido debe tomar el usuario autenticado desde `request.user.id`, expuesto en controladores con `@UsuarioActual()`.

El frontend nunca debe enviar `userId` en `body`, `query` o params para cuentas, categorias, transacciones, creditos, reportes, proyecciones o IA. Si una operacion necesita pertenencia, el backend usa el `id` del recurso y el `userId` autenticado.

## Regla de propiedad

- `find`: filtrar por `userId`; si busca un recurso puntual, filtrar por `id` y `userId`.
- `update`: filtrar por `id` y `userId`.
- `delete`: filtrar por `id` y `userId`.
- `create`: asignar `userId` desde `request.user.id`, nunca desde la solicitud.

## Pruebas

Cuando se implemente el primer recurso financiero, agregar una prueba de acceso cruzado:

1. Crear recurso para usuario A.
2. Autenticarse como usuario B.
3. Intentar leer, actualizar o borrar el recurso de A.
4. Esperar `404` o `401`, segun el endpoint.
