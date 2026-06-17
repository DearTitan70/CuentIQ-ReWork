# CuentiQ - Reglas de codigo

## Analisis muy corto

Estas reglas buscan mantener el codigo simple, testeable y seguro. No sustituyen revision tecnica; sirven como contrato base del equipo.

## Reglas generales

- Codigo en espanol.
- Nombres descriptivos.
- Una responsabilidad por archivo.
- Evitar archivos mayores a 300 lineas cuando sea razonable.
- Evitar codigo muerto.
- Evitar hardcodes.
- Evitar dependencias sin justificacion.
- Preferir soluciones simples sobre abstracciones prematuras.
- Validar siempre datos que cruzan limites de confianza.

## Backend NestJS

- Un modulo por dominio.
- Controladores delgados.
- Servicios con reglas de negocio.
- DTOs para entrada y salida.
- Validaciones declarativas cuando sea posible.
- Prisma encapsulado detras de servicios o repositorios del modulo.
- Errores de dominio convertidos a respuestas HTTP claras.

## Frontend React

- Componentes pequenos y descriptivos.
- Formularios con validacion visible.
- Cliente HTTP centralizado.
- Estados de carga, error y vacio.
- Accesibilidad basica en botones, formularios y navegacion.

## Comentarios

Las funciones deben documentar:

- Que hace.
- Parametros de entrada.
- Que retorna.

Evitar comentarios que repitan literalmente el codigo.

## Seguridad

- JWT con expiracion.
- Passwords hasheados.
- No guardar secretos en el repositorio.
- Validar que todo recurso pertenezca al usuario autenticado.
- No confiar en permisos del frontend.
- Minimizar datos enviados a OpenAI.
- Registrar acciones sensibles cuando afecten seguridad o suscripcion.

## Testing

- Todo calculo financiero debe tener prueba.
- Todo endpoint critico debe tener prueba de integracion.
- Todo control de propiedad debe probar acceso permitido y denegado.
- Toda correccion de bug debe incluir una prueba que falle sin la correccion.

## Proximos pasos

Convertir estas reglas en configuracion real cuando exista codigo: ESLint, Prettier, Jest/Vitest y pipeline de CI.
