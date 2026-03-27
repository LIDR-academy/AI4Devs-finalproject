import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || 'postgresql://latearte_user:latearte_pass@localhost:5433/latearte_db?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const obras = await prisma.obra.findMany({
    select: {
      titulo: true,
      duracion_min: true,
      vibe_mood: true,
      estado_acceso: true
    }
  });
  console.log(JSON.stringify(obras, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
