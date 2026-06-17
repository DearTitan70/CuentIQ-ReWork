# CuentiQ - Roadmap inicial

## Analisis muy corto

El roadmap prioriza gestion financiera personal, proyecciones e IA. Se elimina multiusuario del MVP.

## Fase 0 - Fundacion

- Definir modelo de datos final.
- Configurar repositorio, Docker y tooling.

## Fase 1 - Identidad

- Registro.
- Login.
- JWT.
- Perfil financiero del usuario.
- Plan gratuito por defecto.

## Fase 2 - Registro financiero

- Cuentas en COP o USD.
- Saldos separados por moneda.
- Categorias.
- Transacciones.
- Borrado de transacciones.
- Balance por cuenta.

## Fase 3 - Creditos

- Registro de creditos.
- Cuotas.
- Vencimientos.
- Estado de pagos.

## Fase 4 - Reportes

- Resumen financiero.
- Flujo de caja mensual.
- Ingresos vs gastos.
- Endeudamiento.
- Exportacion PDF.

## Fase 5 - Proyecciones

- Escenario base.
- Escenario optimista.
- Escenario conservador.
- Capacidad de pago.
- Riesgo de liquidez.

## Fase 6 - IA

- Recomendaciones financieras.
- Proyecciones explicadas.
- Resumen de riesgos.
- Limites por plan.
- Disclaimer obligatorio.

## Fuera de roadmap MVP

- PYMES.
- Empresas.
- Organizaciones multiusuario.
- Roles.
- Integraciones bancarias.
- Facturacion electronica.
- Contabilidad formal.
- Multi-moneda avanzado.
- Exportacion a Excel.

## Testing

Cada fase debe cerrar con:

- Pruebas unitarias del dominio agregado.
- Pruebas de integracion de endpoints.
- Prueba manual del flujo principal.
- Prueba de aislamiento por usuario.

## Proximos pasos

Crear el proyecto tecnico NestJS/React con Prisma.
