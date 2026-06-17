# Tasks - Modulo Auth

## Contexto

Implementar autenticacion para el MVP de CuentiQ como usuario individual. No incluir organizaciones, roles, permisos avanzados ni refresh tokens en esta fase.

Stack esperado por los documentos: NestJS, Prisma, PostgreSQL, API REST y React/Vite. El backend debe emitir JWT con expiracion de 7 dias y todas las consultas financieras futuras deben aislar datos por `userId`.

## Dependencias previas

- Proyecto NestJS creado y ejecutando.
- Prisma configurado contra PostgreSQL.
- Variables de entorno cargadas para `DATABASE_URL` y `JWT_SECRET`.
- Librerias habituales de NestJS para JWT, Passport y validacion instaladas.
- Estrategia de tests basica disponible.

## Tareas

### 1. Crear modelo base de usuarios y planes

Estado: completada.

**Objetivo:** dejar la persistencia minima para registrar usuarios y asignar plan gratuito por defecto.

**Detalle:**

- Crear entidades Prisma para `Usuario` y `Plan`.
- Campos minimos de `Usuario`: `id`, `email`, `passwordHash`, `nombre`, `monedaBase`, `planId`, `createdAt`, `updatedAt`.
- Crear indice unico para `Usuario.email`.
- Crear relacion `Plan 1:N Usuario`.
- Cargar planes iniciales: gratuito, mensual y anual.
- Definir `monedaBase` por defecto como `COP`.

**Dependencias:** Prisma y PostgreSQL configurados.

**Riesgos:**

- Migracion inicial mal nombrada o dificil de revertir.
- Seed duplicado de planes si se ejecuta mas de una vez.

**Criterios de aceptacion:**

- [x] La migracion crea `usuarios` y `planes`.
- [x] No se pueden crear dos usuarios con el mismo email.
- [x] Un usuario nuevo puede quedar asociado al plan gratuito.
- [x] El seed de planes es idempotente.

### 2. Configurar modulo Auth

Estado: completada.

**Objetivo:** crear la estructura minima del modulo `auth`.

**Detalle:**

- Crear `AuthModule`, `AuthController` y `AuthService`.
- Registrar dependencias necesarias para JWT y acceso a usuarios.
- Leer `JWT_SECRET` desde variables de entorno.
- Configurar expiracion del token en 7 dias.

**Dependencias:** tarea 1.

**Riesgos:**

- Secreto JWT hardcodeado.
- Configuracion duplicada entre modulos.

**Criterios de aceptacion:**

- [x] El modulo compila.
- [x] La expiracion del token queda en `7d`.
- [x] La app falla de forma clara si falta `JWT_SECRET`.

### 3. Implementar DTOs y validaciones de Auth

Estado: completada.

**Objetivo:** validar entradas antes de tocar base de datos.

**Detalle:**

- Crear DTO para `POST /auth/registro` con `email`, `password`, `nombre`.
- Crear DTO para `POST /auth/login` con `email`, `password`.
- Validar email valido, password requerida y nombre requerido.
- Definir regla minima de password fuerte segun el criterio del equipo antes de implementar.

**Dependencias:** tarea 2.

**Riesgos:**

- Regla de password demasiado estricta para MVP.
- Mensajes de error inconsistentes con `docs/api.md`.

**Criterios de aceptacion:**

- [x] Requests invalidos responden `400`.
- [x] El formato de error sigue `{ codigo, mensaje }`.
- [x] No se ejecuta logica de registro/login con DTO invalido.

### 4. Implementar registro de usuario

Estado: completada.

**Objetivo:** permitir crear usuario con email, password y nombre.

**Detalle:**

- Normalizar email antes de guardar.
- Hashear password antes de persistir.
- Crear usuario con plan gratuito y moneda base `COP`.
- Responder usuario basico y JWT.
- No devolver `passwordHash`.
- Mapear email duplicado a `409`.

**Dependencias:** tareas 1, 2 y 3.

**Riesgos:**

- Guardar password sin hash.
- Filtrar `passwordHash` por accidente.
- Condicion de carrera en email duplicado si no se confia en el indice unico.

**Criterios de aceptacion:**

- [x] `POST /auth/registro` crea usuario valido.
- [x] La respuesta incluye token y usuario basico.
- [x] El token contiene `sub` con el id del usuario.
- [x] Password queda hasheada en base de datos.
- [x] Email duplicado responde `409`.

### 5. Implementar inicio de sesion

Estado: completada.

**Objetivo:** emitir JWT para credenciales validas.

**Detalle:**

- Buscar usuario por email normalizado.
- Comparar password contra `passwordHash`.
- Responder token y usuario basico.
- Responder `401` para email inexistente o password incorrecta.

**Dependencias:** tarea 4.

**Riesgos:**

- Mensajes que revelen si el email existe.
- Comparacion insegura o incorrecta de password.

**Criterios de aceptacion:**

- [x] `POST /auth/login` responde token con credenciales validas.
- [x] Credenciales invalidas responden `401`.
- [x] La respuesta no incluye `passwordHash`.
- [x] El JWT expira en 7 dias.

### 6. Implementar JwtStrategy y JwtAuthGuard

Estado: completada.

**Objetivo:** proteger endpoints usando `Authorization: Bearer <token>`.

**Detalle:**

- Crear estrategia JWT que valide firma y expiracion.
- Cargar el usuario autenticado minimo en `request.user`.
- Crear o exponer `JwtAuthGuard`.
- Rechazar tokens ausentes, invalidos o expirados con `401`.

**Dependencias:** tareas 2 y 5.

**Riesgos:**

- Usar payload sin verificar existencia actual del usuario.
- Dejar endpoints protegidos aceptando token expirado.

**Criterios de aceptacion:**

- [x] Un endpoint protegido rechaza requests sin token.
- [x] Un endpoint protegido acepta token valido.
- [x] Token expirado o mal firmado responde `401`.
- [x] `request.user.id` queda disponible para servicios y controladores.

### 7. Implementar `GET /auth/me`

Estado: completada.

**Objetivo:** validar sesion actual y devolver usuario autenticado.

**Detalle:**

- Crear endpoint `GET /auth/me`.
- Protegerlo con `JwtAuthGuard`.
- Responder usuario basico desde `request.user` o base de datos.
- No devolver datos sensibles.

**Dependencias:** tarea 6.

**Riesgos:**

- Responder informacion interna del modelo.

**Criterios de aceptacion:**

- [x] Sin token responde `401`.
- [x] Con token valido responde el usuario autenticado.
- [x] La respuesta no incluye `passwordHash`.

### 8. Preparar aislamiento por `userId`

Estado: completada.

**Objetivo:** dejar el contrato para que los modulos financieros filtren por usuario autenticado.

**Detalle:**

- Documentar que todo servicio financiero debe recibir `userId` desde `request.user.id`.
- Crear helper/decorador solo si el patron se repite al implementar el segundo endpoint protegido.
- Definir criterio de propiedad: todo `find`, `update` y `delete` financiero debe filtrar por `id` y `userId`.

**Dependencias:** tarea 6.

**Riesgos:**

- Confiar en `userId` enviado por el frontend.
- Olvidar el filtro `userId` en endpoints futuros.

**Criterios de aceptacion:**

- [x] Ningun endpoint financiero planificado acepta `userId` desde body o query.
- [x] La guia queda clara para cuentas, categorias, transacciones y creditos.
- [x] Existe al menos una prueba de acceso cruzado cuando se implemente el primer recurso financiero.

### 9. Agregar pruebas minimas de Auth

Estado: completada.

**Objetivo:** cubrir el flujo critico sin suite gigante.

**Detalle:**

- Probar registro exitoso.
- Probar email duplicado.
- Probar login exitoso.
- Probar login invalido.
- Probar `GET /auth/me` sin token y con token valido.
- Probar que la respuesta nunca incluya `passwordHash`.

**Dependencias:** tareas 4, 5, 6 y 7.

**Riesgos:**

- Tests acoplados a detalles internos del JWT.
- Base de datos de tests no aislada.

**Criterios de aceptacion:**

- [x] Las pruebas corren en local.
- [x] Fallan si se remueve hash de password, guard o expiracion del JWT.
- [x] Cubren al menos un caso `400`, `401` y `409`.

## Orden recomendado

1. Modelo `Usuario`/`Plan` y seed de planes.
2. Modulo Auth y configuracion JWT.
3. DTOs.
4. Registro.
5. Login.
6. Guard JWT.
7. `/auth/me`.
8. Contrato de aislamiento por `userId`.
9. Pruebas minimas.

## Fuera de alcance

- Refresh tokens.
- Recuperacion de password.
- Roles y permisos.
- Organizaciones o equipos.
- Login social.
- Verificacion de email.
- MFA.
