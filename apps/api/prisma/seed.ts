import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create mock eCommerce and store for testing
  const ecommerce = await prisma.ecommerce.upsert({
    where: { taxId: 'B12345678' },
    update: {},
    create: {
      taxId: 'B12345678',
      legalName: 'Tienda Mock S.L.',
      commercialName: 'Tienda Mock',
      email: 'admin@tiendamock.com',
      phone: '+34900123456',
      country: 'ES',
      status: 'ACTIVE',
    },
  });

  await prisma.store.upsert({
    where: { url: 'https://tiendamock.example.com' },
    update: {},
    create: {
      ecommerceId: ecommerce.id,
      url: 'https://tiendamock.example.com',
      name: 'Tienda Mock Demo',
      platform: 'WOOCOMMERCE',
      defaultLanguage: 'es',
      defaultCurrency: 'EUR',
      timezone: 'Europe/Madrid',
      status: 'ACTIVE',
    },
  });

  console.log('Seed completed: ecommerce and store mock created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
