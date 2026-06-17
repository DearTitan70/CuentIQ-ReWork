# CuentiQ - Decisiones arquitectonicas

## Analisis muy corto

Este documento registra decisiones cerradas para evitar reabrir alcance sin nueva informacion.

## ADR-001 - Monolito modular para MVP

Estado: aceptada.

Decision:

Usar NestJS como monolito modular para el MVP.

Motivo:

La escala inicial es 1.000 usuarios. Microservicios agregarian complejidad sin beneficio probado.

Consecuencia:

Los dominios deben mantenerse separados por modulos.

## ADR-002 - MVP para personas naturales

Estado: aceptada.

Decision:

El MVP se enfocara en personas naturales.

Motivo:

Reduce alcance y permite validar valor financiero antes de entrar a PYMES o empresas.

Consecuencia:

No se implementan organizaciones, membresias ni roles en la primera version.

## ADR-003 - Gestion financiera, no contabilidad formal

Estado: aceptada.

Decision:

CuentiQ sera gestion financiera personal.

Motivo:

El usuario necesita control, proyeccion y recomendaciones, no partida doble ni cumplimiento contable.

Consecuencia:

No se crean asientos contables, libro diario ni plan unico de cuentas.

## ADR-004 - PostgreSQL y Prisma

Estado: aceptada.

Decision:

Usar PostgreSQL como fuente de verdad y Prisma como ORM.

Motivo:

El dominio requiere relaciones, consistencia e indices. Prisma acelera el MVP con tipado fuerte.

Consecuencia:

Las migraciones deben revisarse antes de aplicarse.

## ADR-005 - Datos financieros por usuario

Estado: aceptada.

Decision:

Asociar cuentas, categorias, transacciones y creditos directamente al usuario.

Motivo:

No hay multiusuario ni roles en MVP.

Consecuencia:

Si luego entran empresas, se agregara `organizacion` como frontera de datos.

## ADR-006 - Monedas COP y USD

Estado: aceptada.

Decision:

Permitir COP y USD, mostrar saldos y reportes separados, sin conversion automatica.

## ADR-007 - Borrado de transacciones

Estado: aceptada.

Decision:

Permitir borrar transacciones en MVP.

Motivo:

El producto inicial es gestion financiera personal, no contabilidad auditada.

Consecuencia:

Los balances deben recalcularse despues del borrado.

## ADR-008 - IA para recomendar y proyectar

Estado: aceptada.

Decision:

La IA recomendara acciones y explicara proyecciones.

Motivo:

Es parte central del diferencial del producto.

Consecuencia:

Los calculos base deben seguir siendo deterministicos; IA no debe ser la unica fuente numerica.

Disclaimer obligatorio:

Disclaimer: Este contenido fue generado con asistencia de inteligencia artificial. Aunque se han realizado esfuerzos para garantizar su precision, puede contener errores o informacion desactualizada. Se recomienda verificar los datos antes de tomar decisiones basadas en este contenido.

## ADR-009 - Planes y limites comerciales

Estado: aceptada.

Decision:

Usar planes por usuario con limites funcionales.

| Plan | Cuentas | Transacciones mensuales | Creditos | Consultas IA |
| --- | ---: | ---: | ---: | ---: |
| Gratuito | 2 | 50 | 2 | 3 |
| Mensual | 5 | 100 | 5 | 10 |
| Anual | 20 | 500 | 20 | 20 |

Motivo:

Permite monetizar sin agregar multiusuario ni complejidad empresarial.

Consecuencia:

La API debe validar limites antes de crear cuentas, transacciones, creditos o consultas IA.

## Proximos pasos

Crear el proyecto tecnico NestJS/React con Prisma.
