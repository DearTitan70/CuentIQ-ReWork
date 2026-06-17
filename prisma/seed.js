const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const planes = [
  {
    codigo: "gratuito",
    nombre: "Gratuito",
    limiteCuentas: 2,
    limiteTransaccionesMes: 50,
    limiteCreditos: 2,
    limiteConsultasIaMes: 3,
  },
  {
    codigo: "mensual",
    nombre: "Mensual",
    limiteCuentas: 5,
    limiteTransaccionesMes: 100,
    limiteCreditos: 5,
    limiteConsultasIaMes: 10,
  },
  {
    codigo: "anual",
    nombre: "Anual",
    limiteCuentas: 20,
    limiteTransaccionesMes: 500,
    limiteCreditos: 20,
    limiteConsultasIaMes: 20,
  },
];

async function main() {
  for (const plan of planes) {
    await prisma.plan.upsert({
      where: { codigo: plan.codigo },
      update: plan,
      create: plan,
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
