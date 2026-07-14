import { PrismaClient, ProductStatus, SupplierStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const adminId = process.env.DEMO_ADMIN_ID;
const partnerId = process.env.DEMO_PARTNER_ID;
const sellerId = process.env.DEMO_SELLER_ID;

function ensureIds() {
  const missing = [
    ["DEMO_ADMIN_ID", adminId],
    ["DEMO_PARTNER_ID", partnerId],
    ["DEMO_SELLER_ID", sellerId],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(
      `Missing seed environment variables: ${missing.map(([name]) => name).join(", ")}`,
    );
  }
}

async function upsertProfiles() {
  await prisma.userProfile.upsert({
    where: { id: adminId! },
    update: { fullName: "Admin Demo", role: UserRole.ADMIN, isActive: true },
    create: { id: adminId!, fullName: "Admin Demo", role: UserRole.ADMIN, isActive: true },
  });

  await prisma.userProfile.upsert({
    where: { id: partnerId! },
    update: { fullName: "Partner Demo", role: UserRole.PARTNER, isActive: true },
    create: { id: partnerId!, fullName: "Partner Demo", role: UserRole.PARTNER, isActive: true },
  });

  await prisma.userProfile.upsert({
    where: { id: sellerId! },
    update: { fullName: "Seller Demo", role: UserRole.SELLER, isActive: true },
    create: { id: sellerId!, fullName: "Seller Demo", role: UserRole.SELLER, isActive: true },
  });
}

async function upsertSuppliersAndProducts() {
  const suppliers = [
    {
      commercialName: "Ocean Parts",
      legalName: "Ocean Parts Ltd.",
      country: "China",
      city: "Shenzhen",
      currency: "USD",
      incoterm: "FOB",
      averageLeadTimeDays: 30,
    },
    {
      commercialName: "Andes Industrial",
      legalName: "Andes Industrial SpA",
      country: "Chile",
      city: "Santiago",
      currency: "USD",
      incoterm: "EXW",
      averageLeadTimeDays: 12,
    },
    {
      commercialName: "Pacific Machines",
      legalName: "Pacific Machines Co.",
      country: "Peru",
      city: "Lima",
      currency: "USD",
      incoterm: "CIF",
      averageLeadTimeDays: 20,
    },
  ];

  const persistedSuppliers = [] as Array<{ id: string; commercialName: string }>;

  for (const supplier of suppliers) {
    const record = await prisma.supplier.upsert({
      where: { commercialName: supplier.commercialName },
      update: {
        legalName: supplier.legalName,
        country: supplier.country,
        city: supplier.city,
        currency: supplier.currency,
        incoterm: supplier.incoterm,
        status: SupplierStatus.ACTIVE,
        averageLeadTimeDays: supplier.averageLeadTimeDays,
      },
      create: {
        commercialName: supplier.commercialName,
        legalName: supplier.legalName,
        country: supplier.country,
        city: supplier.city,
        currency: supplier.currency,
        incoterm: supplier.incoterm,
        status: SupplierStatus.ACTIVE,
        averageLeadTimeDays: supplier.averageLeadTimeDays,
      },
    });

    persistedSuppliers.push({ id: record.id, commercialName: record.commercialName });
  }

  const products = [
    { sku: "SKU-001", name: "Filtro hidráulico", basePrice: 250, supplierName: "Ocean Parts" },
    { sku: "SKU-002", name: "Bomba de agua", basePrice: 480, supplierName: "Ocean Parts" },
    { sku: "SKU-003", name: "Válvula de control", basePrice: 320, supplierName: "Andes Industrial" },
    { sku: "SKU-004", name: "Kit de sellos", basePrice: 95, supplierName: "Andes Industrial" },
    { sku: "SKU-005", name: "Motor auxiliar", basePrice: 890, supplierName: "Pacific Machines" },
    { sku: "SKU-006", name: "Rodamiento premium", basePrice: 210, supplierName: "Pacific Machines" },
  ];

  for (const product of products) {
    const supplier = persistedSuppliers.find((candidate) => candidate.commercialName === product.supplierName);

    if (!supplier) {
      throw new Error(`Supplier not found for product ${product.sku}`);
    }

    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        basePrice: product.basePrice,
        status: ProductStatus.ACTIVE,
        supplierId: supplier.id,
      },
      create: {
        sku: product.sku,
        name: product.name,
        basePrice: product.basePrice,
        status: ProductStatus.ACTIVE,
        supplierId: supplier.id,
      },
    });
  }
}

async function main() {
  ensureIds();
  await upsertProfiles();
  await upsertSuppliersAndProducts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });