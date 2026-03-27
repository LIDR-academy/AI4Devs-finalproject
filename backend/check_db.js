const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.obra.count();
  const obras = await prisma.obra.findMany({
    where: {
      titulo: { contains: 'Dictator', mode: 'insensitive' }
    },
    select: {
      titulo: true,
      duracion_min: true,
      vibe_mood: true,
      activo: true
    }
  });
  console.log('Total obras:', count);
  console.log('Busqueda "Dictator":', JSON.stringify(obras, null, 2));
}

main().finally(() => prisma.$disconnect());
