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
| `POST /auth/registro` | Crear usuario. | `email`, `password`, `nombre`. | Usuario basico y token. | Email valido, password fuerte, email unico. | `400`, `409`. |
| `POST /auth/login` | Emitir JWT. | `email`, `password`. | Token y usuario basico. | Credenciales requeridas. | `400`, `401`. |
| `GET /auth/me` | Obtener sesion actual. | Header JWT. | Usuario autenticado. | Token valido. | `401`. |
| `PATCH /usuarios/me` | Actualizar perfil financiero. | `nombre`, `monedaBase`. | Usuario actualizado. | Moneda `COP` o `USD`. | `400`, `401`. |
| `POST /cuentas` | Crear cuenta. | `nombre`, `tipo`, `moneda`, `saldoInicial`. | Cuenta creada. | Moneda valida, monto valido, limite del plan. | `400`, `401`, `429`. |
| `GET /cuentas` | Listar cuentas del usuario. | Header JWT. | Lista de cuentas. | Token valido. | `401`. |
| `PATCH /cuentas/:id` | Actualizar cuenta. | Campos editables. | Cuenta actualizada. | Cuenta pertenece al usuario. | `400`, `401`, `404`. |
| `DELETE /cuentas/:id` | Borrar cuenta. | `id`. | Confirmacion. | Sin transacciones asociadas o regla definida. | `401`, `404`, `409`. |
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

## Riesgos

- Borrar cuentas con transacciones asociadas debe bloquearse o requerir borrado previo.
- Los limites mensuales deben usar una zona horaria consistente: `America/Bogota`.

## Disclaimer IA

Disclaimer: Este contenido fue generado con asistencia de inteligencia artificial. Aunque se han realizado esfuerzos para garantizar su precision, puede contener errores o informacion desactualizada. Se recomienda verificar los datos antes de tomar decisiones basadas en este contenido.

## Testing

- Suite minima Auth: `npm test`.
- Prueba de autenticacion para endpoints protegidos.
- Prueba de acceso cruzado entre usuarios.
- Prueba de validacion de montos, fechas y monedas.
- Prueba de borrado de transacciones.
- Prueba de limites IA por plan.
- Prueba de disclaimer en respuestas IA.
- Prueba de exportacion PDF.

## Proximos pasos

Definir DTOs exactos para implementacion.
