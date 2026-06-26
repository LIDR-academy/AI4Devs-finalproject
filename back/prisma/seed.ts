import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "demo@RealSaveFooding.dev" },
    update: {},
    create: {
      email: "demo@RealSaveFooding.dev",
      password: "changeme",
    },
  });

}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
