# CuentiQ - API inicial

## Analisis muy corto

La API queda orientada a usuario individual. No hay rutas de organizaciones, membresias ni roles en MVP.

## Convenciones

- Autenticacion: `Authorization: Bearer <token>`.
- Formato: JSON.
- Fechas: ISO 8601.
- Monedas permitidas: `COP`, `USD`.
- Reportes y proyecciones muestran COP y USD separados.
- Errores: `{ "codigo": "string", "mensaje": "string" }`.
- Error de validacion de DTOs: `{ "codigo": "REQUEST_INVALIDO", "mensaje": "La solicitud contiene datos invalidos." }`.
- Error de email duplicado: `{ "codigo": "EMAIL_YA_REGISTRADO", "mensaje": "El email ya esta registrado." }`.
- Error de credenciales invalidas: `{ "codigo": "CREDENCIALES_INVALIDAS", "mensaje": "Email o password invalidos." }`.
- Error de token invalido: `{ "codigo": "TOKEN_INVALIDO", "mensaje": "Token ausente, invalido o expirado." }`.
- Error de limite de cuentas: `{ "codigo": "LIMITE_CUENTAS_ALCANZADO", "mensaje": "Alcanzaste el limite de cuentas de tu plan." }`.
- Error al borrar la cuenta principal: `{ "codigo": "CUENTA_PRINCIPAL_NO_ELIMINABLE", "mensaje": "La cuenta principal no se puede eliminar." }`.
- Password minimo para MVP: 8 caracteres.
- Ningun endpoint financiero acepta `userId` en body o query; el backend usa `request.user.id`.

## Aislamiento de datos

Los endpoints de cuentas, categorias, transacciones, creditos, reportes, proyecciones e IA deben obtener `userId` exclusivamente del usuario autenticado.

- En creacion, asignar `userId` desde `request.user.id`.
- En lectura, actualizacion y borrado de recursos puntuales, filtrar por `id` y `userId`.
- En listados y reportes, filtrar por `userId`.
- La primera implementacion de recurso financiero debe incluir una prueba de acceso cruzado entre dos usuarios.

## Endpoints

| Endpoint | Objetivo | Request | Response | Validaciones | Errores |
| --- | --- | --- | --- | --- | --- |
| `POST /auth/registro` | Crear usuario y su cuenta principal `id = 0`. | `email`, `password`, `nombre`. | Usuario basico y token; no expone la cuenta. | Email valido, password fuerte, email unico. | `400`, `409`. |
| `POST /auth/login` | Emitir JWT. | `email`, `password`. | Token y usuario basico. | Credenciales requeridas. | `400`, `401`. |
| `GET /auth/me` | Obtener sesion actual. | Header JWT. | Usuario autenticado. | Token valido. | `401`. |
| `PATCH /usuarios/me` | Actualizar perfil financiero. | `nombre`, `monedaBase`. | Usuario actualizado. | Moneda `COP` o `USD`. | `400`, `401`. |
| `POST /cuentas` | Crear cuenta. | `nombre`, `tipo`, `moneda`, `saldoInicial`. | Cuenta con `saldoReal`. | DTO valido y limite del plan. | `400`, `401`, `429`. |
| `GET /cuentas` | Listar cuentas del usuario. | Header JWT. | Cuentas propias con `saldoReal`. | Token valido. | `401`. |
| `GET /cuentas/:id` | Obtener una cuenta. | `id`. | Cuenta propia con `saldoReal`. | Cuenta pertenece al usuario. | `401`, `404`. |
| `PATCH /cuentas/:id` | Actualizar cuenta. | `nombre`, `tipo`, `moneda`, `saldoInicial`, todos opcionales. | Cuenta con `saldoReal`. | Cuenta pertenece al usuario. | `400`, `401`, `404`. |
| `DELETE /cuentas/:id` | Borrar cuenta. | `id`. | `{ "eliminada": true }`. | Cuenta propia y distinta de `id = 0`. | `401`, `404`, `409`. |
| `POST /categorias` | Crear categoria. | `nombre`, `tipo`. | Categoria creada. | Nombre requerido, tipo valido. | `400`, `401`. |
| `GET /categorias` | Listar categorias. | Header JWT. | Lista de categorias. | Token valido. | `401`. |
| `POST /transacciones` | Crear movimiento. | `cuentaId`, `categoriaId`, `tipo`, `monto`, `moneda`, `fecha`, `descripcion`. | Transaccion creada. | Monto mayor a cero, moneda valida, cuenta y categoria propias, limite mensual del plan. | `400`, `401`, `404`, `429`. |
| `GET /transacciones` | Listar movimientos. | Filtros `desde`, `hasta`, `tipo`, `cuentaId`, `moneda`. | Lista paginada. | Fechas y moneda validas. | `400`, `401`. |
| `PATCH /transacciones/:id` | Actualizar movimiento. | Campos editables. | Transaccion actualizada. | Transaccion pertenece al usuario. | `400`, `401`, `404`. |
| `DELETE /transacciones/:id` | Borrar movimiento. | `id`. | Confirmacion. | Transaccion pertenece al usuario. | `401`, `404`. |
| `POST /creditos` | Crear credito. | `nombre`, `monto`, `moneda`, `tasa`, `plazo`, `fechaInicio`. | Credito creado. | Montos positivos, moneda valida, plazo valido, limite del plan. | `400`, `401`, `429`. |
| `GET /creditos` | Listar creditos. | Filtros opcionales. | Lista de creditos. | Token valido. | `401`. |
| `GET /creditos/:id` | Ver credito con cuotas. | `id`. | Credito y cuotas. | Credito pertenece al usuario. | `401`, `404`. |
| `GET /reportes/resumen` | Resumen financiero. | Periodo opcional. | KPIs separados por moneda. | Fechas validas. | `400`, `401`. |
| `GET /reportes/flujo-caja` | Flujo por periodo. | `desde`, `hasta`, `moneda`. | Series de flujo. | Rango y moneda validos. | `400`, `401`. |
| `GET /reportes/resumen.pdf` | Exportar resumen financiero. | Periodo opcional. | PDF. | Fechas validas. | `400`, `401`. |
| `POST /proyecciones` | Calcular escenario. | Horizonte, supuestos, moneda. | Proyeccion deterministica por moneda. | Horizonte permitido, supuestos validos. | `400`, `401`. |
| `POST /ia/recomendaciones` | Recomendar acciones. | Periodo, objetivo, moneda. | Recomendaciones asistidas con disclaimer. | Datos minimizados, limite de plan. | `400`, `401`, `429`. |
| `POST /ia/proyecciones` | Proyectar con IA. | Horizonte, supuestos, objetivo. | Proyeccion explicada con disclaimer. | Datos minimizados, limite de plan. | `400`, `401`, `429`. |

## DTOs de cuentas

- `POST /cuentas`: `nombre` requerido y no vacio; `tipo` requerido (`bancaria` o `billetera`); `moneda` requerida (`COP` o `USD`); `saldoInicial` numerico requerido.
- La cuenta principal `id = 0` cuenta dentro del limite del plan. La respuesta de creacion incluye `saldoInicial` y `saldoReal`; sin movimientos ambos son iguales.
- Listado y detalle calculan `saldoReal`; mientras no existan movimientos, es igual a `saldoInicial`.
- `PATCH /cuentas/:id`: los mismos campos son opcionales y se validan cuando se envian.
- `PATCH /cuentas/:id` devuelve la cuenta actualizada con `saldoReal` recalculado y responde `409` si intenta cambiar la moneda de una cuenta con movimientos.
- `DELETE /cuentas/:id` elimina cuentas propias, responde `404` para cuentas ajenas y `409` para la cuenta principal `id = 0`.
- El borrado responde `409` si la cuenta tiene movimientos.
- Propiedades no declaradas, incluidas `usuarioId` y `saldoReal`, son eliminadas por el `ValidationPipe` y nunca llegan al servicio.
- Requests invalidos responden `400` con `{ "codigo": "REQUEST_INVALIDO", "mensaje": "La solicitud contiene datos invalidos." }`.

## Riesgos

- Borrar cuentas con transacciones asociadas debe bloquearse o requerir borrado previo.
- Los limites mensuales deben usar una zona horaria consistente: `America/Bogota`.

## Disclaimer IA

Disclaimer: Este contenido fue generado con asistencia de inteligencia artificial. Aunque se han realizado esfuerzos para garantizar su precision, puede contener errores o informacion desactualizada. Se recomienda verificar los datos antes de tomar decisiones basadas en este contenido.

## Testing

- Suite minima Auth y Cuentas: `npm test`.
- Cuentas cubre registro con cuenta `id = 0`, creacion, limite de plan, listado aislado, acceso cruzado, saldo real y proteccion de borrado de la cuenta principal.
- Prueba de autenticacion para endpoints protegidos.
- Prueba de acceso cruzado entre usuarios.
- Prueba de validacion de montos, fechas y monedas.
- Prueba de borrado de transacciones.
- Prueba de limites IA por plan.
- Prueba de disclaimer en respuestas IA.
- Prueba de exportacion PDF.

## Proximos pasos

Implementar categorias y los endpoints de transacciones.
