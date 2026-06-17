# CuentiQ - Producto MVP

## Analisis muy corto

CuentiQ iniciara como SaaS de gestion financiera para personas naturales en Colombia. El MVP debe permitir registrar dinero, entender flujo, manejar creditos y proyectar decisiones futuras con apoyo de IA.

## Alcance definido

- Usuario inicial: persona natural.
- Mercado inicial: Colombia.
- Monedas permitidas: COP y USD.
- Moneda base recomendada: COP.
- COP y USD se muestran separados, sin conversion automatica.
- Modelo comercial: suscripcion por usuario.
- Planes: gratuito, mensual y anual.
- Tipo de producto: gestion financiera, no contabilidad formal.
- Multiusuario y roles: fuera del MVP.
- Transacciones: se pueden borrar.
- IA: debe recomendar y proyectar.
- Exportacion: solo PDF.

## Problema

Las personas registran ingresos, gastos, deudas y metas en herramientas separadas. Esto impide ver con claridad cuanto dinero tienen, cuanto deben y como una decision afecta su futuro financiero.

## Propuesta de valor

CuentiQ centraliza cuentas, transacciones, creditos y proyecciones para ayudar a tomar mejores decisiones financieras personales.

## MVP

1. Registro e inicio de sesion.
2. Perfil financiero del usuario.
3. Cuentas financieras personales.
4. Categorias de ingresos y gastos.
5. Transacciones manuales.
6. Creditos y cuotas.
7. Reportes basicos.
8. Proyecciones financieras.
9. Recomendaciones con IA.

## Planes comerciales

| Plan | Cuentas | Transacciones mensuales | Creditos | Consultas IA |
| --- | ---: | ---: | ---: | ---: |
| Gratuito | 2 | 50 | 2 | 3 |
| Mensual | 5 | 100 | 5 | 10 |
| Anual | 20 | 500 | 20 | 20 |

## Disclaimer IA

Disclaimer: Este contenido fue generado con asistencia de inteligencia artificial. Aunque se han realizado esfuerzos para garantizar su precision, puede contener errores o informacion desactualizada. Se recomienda verificar los datos antes de tomar decisiones basadas en este contenido.

## Fuera del MVP

- PYMES y empresas.
- Organizaciones multiusuario.
- Roles y permisos avanzados.
- Contabilidad formal o partida doble.
- Integraciones bancarias.
- Facturacion electronica.
- Multi-moneda avanzado con tasas automaticas.
- Exportacion a Excel.

## Criterios de exito del MVP

- El usuario puede registrarse e iniciar sesion.
- El usuario puede crear cuentas en COP o USD.
- El usuario puede registrar ingresos, gastos y transferencias.
- El usuario puede borrar transacciones.
- El usuario puede registrar creditos y cuotas.
- El sistema calcula balance, flujo mensual y obligaciones.
- El sistema muestra COP y USD en saldos separados.
- El sistema proyecta escenarios financieros.
- La IA entrega recomendaciones basadas en datos del usuario.
- Las respuestas IA muestran el disclaimer definido.
- El sistema exporta reportes a PDF.

## Testing

- Flujo completo de registro, login y cierre de sesion.
- Creacion de cuenta financiera.
- Registro y borrado de transaccion.
- Registro de credito y cuota.
- Calculo de balance y flujo.
- Proyeccion con datos minimos.
- Recomendacion de IA con datos minimizados.
- Exportacion de reporte a PDF.

## Proximos pasos

Crear el proyecto tecnico NestJS/React con Prisma.
