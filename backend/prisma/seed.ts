import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const levels = [
  { name: "Principiante", color: "#4A90D9", sort_order: 1 },
  { name: "Basico", color: "#50C878", sort_order: 2 },
  { name: "Intermedio", color: "#F5A623", sort_order: 3 },
  { name: "Avanzado", color: "#E67E22", sort_order: 4 },
  { name: "Experto", color: "#E74C3C", sort_order: 5 },
];

async function main() {
  console.log("Seeding levels...");

  for (const level of levels) {
    const result = await prisma.level.upsert({
      where: { name: level.name },
      update: { color: level.color, sort_order: level.sort_order },
      create: level,
    });
    console.log(`Level "${result.name}" (${result.color}) — ${result.sort_order}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
