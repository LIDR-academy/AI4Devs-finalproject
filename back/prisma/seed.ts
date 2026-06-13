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

  await prisma.priceCatalogItem.deleteMany({
    where: {
      normalizedName: {
        in: ["whole milk", "tomato sauce", "olive oil"],
      },
    },
  });

  await prisma.priceCatalogItem.createMany({
    data: [
      {
        normalizedName: "whole milk",
        category: "Dairy",
        sourceLabel: "MVP Catalog",
        referencePriceEur: "1.69",
        currencyCode: "EUR",
        effectiveDate: new Date("2026-01-15"),
      },
      {
        normalizedName: "tomato sauce",
        category: "Pantry",
        sourceLabel: "MVP Catalog",
        referencePriceEur: "2.29",
        currencyCode: "EUR",
        effectiveDate: new Date("2026-01-15"),
      },
      {
        normalizedName: "olive oil",
        category: "Pantry",
        sourceLabel: "MVP Catalog",
        referencePriceEur: "6.49",
        currencyCode: "EUR",
        effectiveDate: new Date("2026-01-15"),
      },
    ],
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
