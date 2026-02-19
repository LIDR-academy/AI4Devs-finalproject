import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpieza en orden de dependencias (FK inverso)
  await prisma.conversation.deleteMany();
  await prisma.giftRecipient.deleteMany();
  await prisma.orderAddress.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.ecommerce.deleteMany();
  await prisma.phone.deleteMany();

  // ─── Phones ──────────────────────────────────────────────────────────────
  // Los Phone se crean antes que los User porque User.phoneId → Phone.id

  // Compradores (10)
  const ph1 = await prisma.phone.create({
    data: {
      e164: '+34612345001',
      countryCallingCode: '34',
      nationalNumber: '612345001',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 001',
      formattedInternational: '+34 612 345 001',
    },
  });
  const ph2 = await prisma.phone.create({
    data: {
      e164: '+34612345002',
      countryCallingCode: '34',
      nationalNumber: '612345002',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 002',
      formattedInternational: '+34 612 345 002',
    },
  });
  const ph3 = await prisma.phone.create({
    data: {
      e164: '+34612345003',
      countryCallingCode: '34',
      nationalNumber: '612345003',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 003',
      formattedInternational: '+34 612 345 003',
    },
  });
  const ph4 = await prisma.phone.create({
    data: {
      e164: '+34612345004',
      countryCallingCode: '34',
      nationalNumber: '612345004',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 004',
      formattedInternational: '+34 612 345 004',
    },
  });
  const ph5 = await prisma.phone.create({
    data: {
      e164: '+34612345005',
      countryCallingCode: '34',
      nationalNumber: '612345005',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 005',
      formattedInternational: '+34 612 345 005',
    },
  });
  const ph6 = await prisma.phone.create({
    data: {
      e164: '+34612345006',
      countryCallingCode: '34',
      nationalNumber: '612345006',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 006',
      formattedInternational: '+34 612 345 006',
    },
  });
  const ph7 = await prisma.phone.create({
    data: {
      e164: '+33612345007',
      countryCallingCode: '33',
      nationalNumber: '612345007',
      country: 'FR',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '06 12 34 50 07',
      formattedInternational: '+33 6 12 34 50 07',
    },
  });
  const ph8 = await prisma.phone.create({
    data: {
      e164: '+34612345008',
      countryCallingCode: '34',
      nationalNumber: '612345008',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 008',
      formattedInternational: '+34 612 345 008',
    },
  });
  const ph9 = await prisma.phone.create({
    data: {
      e164: '+34612345009',
      countryCallingCode: '34',
      nationalNumber: '612345009',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 009',
      formattedInternational: '+34 612 345 009',
    },
  });
  const ph10 = await prisma.phone.create({
    data: {
      e164: '+34612345010',
      countryCallingCode: '34',
      nationalNumber: '612345010',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 010',
      formattedInternational: '+34 612 345 010',
    },
  });

  // Destinatarios de regalo (4) — sus Users se crean más adelante como no registrados
  const phLucia = await prisma.phone.create({
    data: {
      e164: '+34612345099',
      countryCallingCode: '34',
      nationalNumber: '612345099',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 099',
      formattedInternational: '+34 612 345 099',
    },
  });
  const phJavier = await prisma.phone.create({
    data: {
      e164: '+34612345080',
      countryCallingCode: '34',
      nationalNumber: '612345080',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 080',
      formattedInternational: '+34 612 345 080',
    },
  });
  const phCarmen = await prisma.phone.create({
    data: {
      e164: '+34612345070',
      countryCallingCode: '34',
      nationalNumber: '612345070',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 070',
      formattedInternational: '+34 612 345 070',
    },
  });
  const phIsabelle = await prisma.phone.create({
    data: {
      e164: '+34612345060',
      countryCallingCode: '34',
      nationalNumber: '612345060',
      country: 'ES',
      numberType: 'MOBILE',
      isValid: true,
      formattedNational: '612 345 060',
      formattedInternational: '+34 612 345 060',
    },
  });

  // ─── Ecommerces (2) ──────────────────────────────────────────────────────
  const ecommerce1 = await prisma.ecommerce.create({
    data: {
      taxId: 'B12345678',
      legalName: 'ModaMujer S.L.',
      commercialName: 'ModaMujer',
      email: 'admin@modamujer.com',
      phone: '+34900111222',
      country: 'ES',
      status: 'ACTIVE',
    },
  });

  const ecommerce2 = await prisma.ecommerce.create({
    data: {
      taxId: 'B98765432',
      legalName: 'TechGadgets Spain S.L.',
      commercialName: 'TechGadgets',
      email: 'admin@techgadgets.es',
      phone: '+34900333444',
      country: 'ES',
      status: 'ACTIVE',
    },
  });

  // ─── Tiendas (3: 2 para ecommerce1, 1 para ecommerce2) ───────────────────
  const store1 = await prisma.store.create({
    data: {
      ecommerceId: ecommerce1.id,
      url: 'https://modamujer.example.com',
      name: 'ModaMujer Tienda Principal',
      platform: 'WOOCOMMERCE',
      defaultLanguage: 'es',
      defaultCurrency: 'EUR',
      timezone: 'Europe/Madrid',
      status: 'ACTIVE',
    },
  });

  const store2 = await prisma.store.create({
    data: {
      ecommerceId: ecommerce1.id,
      url: 'https://modamujer-outlet.example.com',
      name: 'ModaMujer Outlet',
      platform: 'SHOPIFY',
      defaultLanguage: 'es',
      defaultCurrency: 'EUR',
      timezone: 'Europe/Madrid',
      status: 'ACTIVE',
    },
  });

  const store3 = await prisma.store.create({
    data: {
      ecommerceId: ecommerce2.id,
      url: 'https://techgadgets.example.com',
      name: 'TechGadgets Store',
      platform: 'PRESTASHOP',
      defaultLanguage: 'es',
      defaultCurrency: 'EUR',
      timezone: 'Europe/Madrid',
      status: 'ACTIVE',
    },
  });

  // ─── Usuarios compradores (10) ───────────────────────────────────────────
  // 7 es / 1 ca / 1 fr / 1 en | 9 ES / 1 FR | 4 registrados

  const user1 = await prisma.user.create({
    data: {
      phoneId: ph1.id,
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana.garcia@email.com',
      preferredLanguage: 'es',
      isRegistered: true,
      registeredAt: new Date('2024-03-15'),
      lastInteractionAt: new Date('2025-11-20'),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      phoneId: ph2.id,
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos.lopez@email.com',
      preferredLanguage: 'es',
      isRegistered: true,
      registeredAt: new Date('2024-05-10'),
      lastInteractionAt: new Date('2025-12-05'),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      phoneId: ph3.id,
      firstName: 'María',
      lastName: 'Fernández',
      email: 'maria.fernandez@email.com',
      preferredLanguage: 'es',
      isRegistered: true,
      registeredAt: new Date('2024-01-20'),
      lastInteractionAt: new Date('2026-01-15'),
    },
  });

  const user4 = await prisma.user.create({
    data: {
      phoneId: ph4.id,
      firstName: 'Pedro',
      lastName: 'Martínez',
      email: 'pedro.martinez@email.com',
      preferredLanguage: 'es',
      isRegistered: true,
      registeredAt: new Date('2023-11-05'),
      lastInteractionAt: new Date('2026-02-01'),
    },
  });

  const user5 = await prisma.user.create({
    data: {
      phoneId: ph5.id,
      firstName: 'Laura',
      lastName: 'Sánchez',
      preferredLanguage: 'es',
      isRegistered: false,
      lastInteractionAt: new Date('2025-10-12'),
    },
  });

  const user6 = await prisma.user.create({
    data: {
      phoneId: ph6.id,
      firstName: 'Jordi',
      lastName: 'Puigdomènech',
      preferredLanguage: 'ca',
      isRegistered: false,
      lastInteractionAt: new Date('2025-09-30'),
    },
  });

  const user7 = await prisma.user.create({
    data: {
      phoneId: ph7.id,
      firstName: 'Sophie',
      lastName: 'Dubois',
      preferredLanguage: 'fr',
      isRegistered: false,
      lastInteractionAt: new Date('2025-08-22'),
    },
  });

  const user8 = await prisma.user.create({
    data: {
      phoneId: ph8.id,
      firstName: 'James',
      lastName: 'Wilson',
      preferredLanguage: 'en',
      isRegistered: false,
      lastInteractionAt: new Date('2025-11-05'),
    },
  });

  const user9 = await prisma.user.create({
    data: {
      phoneId: ph9.id,
      firstName: 'Rosa',
      lastName: 'Gómez',
      preferredLanguage: 'es',
      isRegistered: false,
      lastInteractionAt: new Date('2026-01-28'),
    },
  });

  const user10 = await prisma.user.create({
    data: {
      phoneId: ph10.id,
      firstName: 'Elena',
      lastName: 'Díaz',
      preferredLanguage: 'es',
      isRegistered: false,
      lastInteractionAt: new Date('2025-12-18'),
    },
  });

  // ─── Usuarios destinatarios de regalo (4) — no registrados ───────────────
  // Cada GiftRecipient.recipientUserId apunta a uno de estos Users.
  // Su phoneId es el de la serie "regalo" creada arriba.

  const userLucia = await prisma.user.create({
    data: {
      phoneId: phLucia.id,
      firstName: 'Lucía',
      lastName: 'García',
      preferredLanguage: 'es',
      isRegistered: false,
      lastInteractionAt: new Date('2025-10-15'),
    },
  });

  const userJavier = await prisma.user.create({
    data: {
      phoneId: phJavier.id,
      firstName: 'Javier',
      lastName: 'Fernández',
      preferredLanguage: 'es',
      isRegistered: false,
      lastInteractionAt: new Date('2025-12-06'),
    },
  });

  const userCarmen = await prisma.user.create({
    data: {
      phoneId: phCarmen.id,
      firstName: 'Carmen',
      lastName: 'Martínez',
      preferredLanguage: 'es',
      isRegistered: false,
      lastInteractionAt: new Date('2025-11-21'),
    },
  });

  const userIsabelle = await prisma.user.create({
    data: {
      phoneId: phIsabelle.id,
      firstName: 'Isabelle',
      lastName: 'Moreau',
      preferredLanguage: 'fr',
      isRegistered: false,
      lastInteractionAt: new Date('2025-08-23'),
    },
  });

  // ─── Direcciones guardadas (solo usuarios registrados) ───────────────────
  // Se capturan los IDs de las direcciones que serán referenciadas en
  // OrderAddress.sourceAddressId cuando addressOrigin = ADRESLES_SAVED.

  // user1: 1 dirección
  const addr1Casa = await prisma.address.create({
    data: {
      userId: user1.id,
      label: 'Casa',
      fullAddress: 'Calle Mayor 12, 2º B, 28001 Madrid',
      street: 'Calle Mayor',
      number: '12',
      floor: '2',
      door: 'B',
      postalCode: '28001',
      city: 'Madrid',
      province: 'Madrid',
      country: 'ES',
      isDefault: true,
    },
  });

  // user2: 1 dirección
  await prisma.address.create({
    data: {
      userId: user2.id,
      label: 'Trabajo',
      fullAddress: 'Avenida Diagonal 441, Planta 5, 08036 Barcelona',
      street: 'Avenida Diagonal',
      number: '441',
      floor: '5',
      postalCode: '08036',
      city: 'Barcelona',
      province: 'Barcelona',
      country: 'ES',
      isDefault: true,
    },
  });

  // user3: 2 direcciones
  const addr3Casa = await prisma.address.create({
    data: {
      userId: user3.id,
      label: 'Casa',
      fullAddress: 'Calle Colón 8, 3º 1ª, 46004 Valencia',
      street: 'Calle Colón',
      number: '8',
      floor: '3',
      door: '1ª',
      postalCode: '46004',
      city: 'Valencia',
      province: 'Valencia',
      country: 'ES',
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: user3.id,
      label: 'Casa padres',
      fullAddress: 'Calle Sierpes 22, 41004 Sevilla',
      street: 'Calle Sierpes',
      number: '22',
      postalCode: '41004',
      city: 'Sevilla',
      province: 'Sevilla',
      country: 'ES',
      isDefault: false,
    },
  });

  // user4: 3 direcciones
  await prisma.address.create({
    data: {
      userId: user4.id,
      label: 'Casa',
      fullAddress: 'Calle Gran Vía 15, 1º A, 48001 Bilbao',
      street: 'Calle Gran Vía',
      number: '15',
      floor: '1',
      door: 'A',
      postalCode: '48001',
      city: 'Bilbao',
      province: 'Vizcaya',
      country: 'ES',
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: user4.id,
      label: 'Trabajo',
      fullAddress: 'Alameda Mazarredo 69, 48009 Bilbao',
      street: 'Alameda Mazarredo',
      number: '69',
      postalCode: '48009',
      city: 'Bilbao',
      province: 'Vizcaya',
      country: 'ES',
      isDefault: false,
    },
  });

  await prisma.address.create({
    data: {
      userId: user4.id,
      label: 'Casa de verano',
      fullAddress: 'Calle del Sol 3, 39001 Santander',
      street: 'Calle del Sol',
      number: '3',
      postalCode: '39001',
      city: 'Santander',
      province: 'Cantabria',
      country: 'ES',
      isDefault: false,
    },
  });

  // ─── Pedidos (20) ─────────────────────────────────────────────────────────
  //
  // Cobertura de enums:
  //   Status:      COMPLETED×14 | READY_TO_PROCESS×2 | PENDING_ADDRESS×1
  //                PENDING_PAYMENT×1 | CANCELED×1
  //   OrderMode:   TRADITIONAL×7 | ADRESLES×13
  //   PaymentType: CREDIT_CARD×7 | PAYPAL×4 | BIZUM×3 | BANK_TRANSFER×2
  //                CASH_ON_DELIVERY×2 | OTHER×2
  //   isGift:      true×4 (O2,O5,O9,O14) — ~20%
  //   Sin OA:      O12 (PENDING_ADDRESS) + O19 (PENDING_PAYMENT)
  //
  // Regla: syncedAt solo en COMPLETED. addressConfirmedAt en COMPLETED,
  //        READY_TO_PROCESS y CANCELED (si la dirección se confirmó antes).

  // O1 — Ana García, store1, ADRESLES, CREDIT_CARD, COMPLETED
  const o1 = await prisma.order.create({
    data: {
      storeId: store1.id,
      userId: user1.id,
      externalOrderId: 'WC-10001',
      externalOrderNumber: '#10001',
      totalAmount: 89.95,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 2.25,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'CREDIT_CARD',
      isGift: false,
      webhookReceivedAt: new Date('2025-09-10T10:00:00Z'),
      addressConfirmedAt: new Date('2025-09-10T10:30:00Z'),
      syncedAt: new Date('2025-09-10T11:00:00Z'),
    },
  });

  // O2 — Ana García, store1, ADRESLES, PAYPAL, COMPLETED, GIFT → Lucía García
  const o2 = await prisma.order.create({
    data: {
      storeId: store1.id,
      userId: user1.id,
      externalOrderId: 'WC-10002',
      externalOrderNumber: '#10002',
      totalAmount: 124.5,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 3.11,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'PAYPAL',
      isGift: true,
      webhookReceivedAt: new Date('2025-10-15T14:00:00Z'),
      addressConfirmedAt: new Date('2025-10-15T14:45:00Z'),
      syncedAt: new Date('2025-10-15T15:30:00Z'),
    },
  });

  // O3 — Carlos López, store1, TRADITIONAL, CREDIT_CARD, COMPLETED
  const o3 = await prisma.order.create({
    data: {
      storeId: store1.id,
      userId: user2.id,
      externalOrderId: 'WC-10003',
      externalOrderNumber: '#10003',
      totalAmount: 59.99,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 1.5,
      status: 'COMPLETED',
      orderMode: 'TRADITIONAL',
      paymentType: 'CREDIT_CARD',
      isGift: false,
      webhookReceivedAt: new Date('2025-11-01T09:00:00Z'),
      addressConfirmedAt: new Date('2025-11-01T09:20:00Z'),
      syncedAt: new Date('2025-11-01T10:00:00Z'),
    },
  });

  // O4 — María Fernández, store1, ADRESLES, BIZUM, COMPLETED
  const o4 = await prisma.order.create({
    data: {
      storeId: store1.id,
      userId: user3.id,
      externalOrderId: 'WC-10004',
      externalOrderNumber: '#10004',
      totalAmount: 45.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 1.13,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'BIZUM',
      isGift: false,
      webhookReceivedAt: new Date('2025-07-20T11:00:00Z'),
      addressConfirmedAt: new Date('2025-07-20T11:15:00Z'),
      syncedAt: new Date('2025-07-20T12:00:00Z'),
    },
  });

  // O5 — María Fernández, store1, ADRESLES, CREDIT_CARD, COMPLETED, GIFT → Javier Fernández
  const o5 = await prisma.order.create({
    data: {
      storeId: store1.id,
      userId: user3.id,
      externalOrderId: 'WC-10005',
      externalOrderNumber: '#10005',
      totalAmount: 210.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 5.25,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'CREDIT_CARD',
      isGift: true,
      webhookReceivedAt: new Date('2025-12-05T16:00:00Z'),
      addressConfirmedAt: new Date('2025-12-06T10:00:00Z'),
      syncedAt: new Date('2025-12-06T11:00:00Z'),
    },
  });

  // O6 — María Fernández, store2, ADRESLES, PAYPAL, READY_TO_PROCESS
  const o6 = await prisma.order.create({
    data: {
      storeId: store2.id,
      userId: user3.id,
      externalOrderId: 'SH-20001',
      externalOrderNumber: '#20001',
      totalAmount: 75.8,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 1.9,
      status: 'READY_TO_PROCESS',
      orderMode: 'ADRESLES',
      paymentType: 'PAYPAL',
      isGift: false,
      webhookReceivedAt: new Date('2026-01-10T08:00:00Z'),
      addressConfirmedAt: new Date('2026-01-10T08:30:00Z'),
    },
  });

  // O7 — María Fernández, store2, TRADITIONAL, BANK_TRANSFER, CANCELED
  //      La dirección se confirmó antes de la cancelación → tiene OrderAddress
  const o7 = await prisma.order.create({
    data: {
      storeId: store2.id,
      userId: user3.id,
      externalOrderId: 'SH-20002',
      externalOrderNumber: '#20002',
      totalAmount: 99.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 2.48,
      status: 'CANCELED',
      orderMode: 'TRADITIONAL',
      paymentType: 'BANK_TRANSFER',
      isGift: false,
      webhookReceivedAt: new Date('2025-08-15T13:00:00Z'),
      addressConfirmedAt: new Date('2025-08-15T13:20:00Z'),
    },
  });

  // O8 — Pedro Martínez, store2, TRADITIONAL, CASH_ON_DELIVERY, COMPLETED
  const o8 = await prisma.order.create({
    data: {
      storeId: store2.id,
      userId: user4.id,
      externalOrderId: 'SH-20003',
      externalOrderNumber: '#20003',
      totalAmount: 149.9,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 3.75,
      status: 'COMPLETED',
      orderMode: 'TRADITIONAL',
      paymentType: 'CASH_ON_DELIVERY',
      isGift: false,
      webhookReceivedAt: new Date('2025-06-01T10:00:00Z'),
      addressConfirmedAt: new Date('2025-06-01T10:15:00Z'),
      syncedAt: new Date('2025-06-01T11:00:00Z'),
    },
  });

  // O9 — Pedro Martínez, store2, ADRESLES, BIZUM, COMPLETED, GIFT → Carmen Martínez
  const o9 = await prisma.order.create({
    data: {
      storeId: store2.id,
      userId: user4.id,
      externalOrderId: 'SH-20004',
      externalOrderNumber: '#20004',
      totalAmount: 350.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 8.75,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'BIZUM',
      isGift: true,
      webhookReceivedAt: new Date('2025-11-20T17:00:00Z'),
      addressConfirmedAt: new Date('2025-11-21T09:00:00Z'),
      syncedAt: new Date('2025-11-21T10:00:00Z'),
    },
  });

  // O10 — Pedro Martínez, store3, TRADITIONAL, CREDIT_CARD, COMPLETED
  const o10 = await prisma.order.create({
    data: {
      storeId: store3.id,
      userId: user4.id,
      externalOrderId: 'PS-30001',
      externalOrderNumber: '#30001',
      totalAmount: 299.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 7.48,
      status: 'COMPLETED',
      orderMode: 'TRADITIONAL',
      paymentType: 'CREDIT_CARD',
      isGift: false,
      webhookReceivedAt: new Date('2025-10-05T12:00:00Z'),
      addressConfirmedAt: new Date('2025-10-05T12:30:00Z'),
      syncedAt: new Date('2025-10-05T13:00:00Z'),
    },
  });

  // O11 — Laura Sánchez, store1, ADRESLES, OTHER, COMPLETED
  const o11 = await prisma.order.create({
    data: {
      storeId: store1.id,
      userId: user5.id,
      externalOrderId: 'WC-10006',
      externalOrderNumber: '#10006',
      totalAmount: 32.5,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 0.81,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'OTHER',
      isGift: false,
      webhookReceivedAt: new Date('2025-10-12T15:00:00Z'),
      addressConfirmedAt: new Date('2025-10-12T15:30:00Z'),
      syncedAt: new Date('2025-10-12T16:00:00Z'),
    },
  });

  // O12 — Jordi Puigdomènech, store1, ADRESLES, CREDIT_CARD, PENDING_ADDRESS
  //        Sin OrderAddress (aún no ha facilitado su dirección)
  await prisma.order.create({
    data: {
      storeId: store1.id,
      userId: user6.id,
      externalOrderId: 'WC-10007',
      externalOrderNumber: '#10007',
      totalAmount: 67.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 1.68,
      status: 'PENDING_ADDRESS',
      orderMode: 'ADRESLES',
      paymentType: 'CREDIT_CARD',
      isGift: false,
      webhookReceivedAt: new Date('2026-02-15T11:00:00Z'),
    },
  });

  // O13 — Jordi Puigdomènech, store2, ADRESLES, PAYPAL, COMPLETED
  const o13 = await prisma.order.create({
    data: {
      storeId: store2.id,
      userId: user6.id,
      externalOrderId: 'SH-20005',
      externalOrderNumber: '#20005',
      totalAmount: 55.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 1.38,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'PAYPAL',
      isGift: false,
      webhookReceivedAt: new Date('2025-09-30T10:00:00Z'),
      addressConfirmedAt: new Date('2025-09-30T10:25:00Z'),
      syncedAt: new Date('2025-09-30T11:00:00Z'),
    },
  });

  // O14 — Sophie Dubois, store3, ADRESLES, OTHER, COMPLETED, GIFT → Isabelle Moreau
  const o14 = await prisma.order.create({
    data: {
      storeId: store3.id,
      userId: user7.id,
      externalOrderId: 'PS-30002',
      externalOrderNumber: '#30002',
      totalAmount: 189.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 4.73,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'OTHER',
      isGift: true,
      webhookReceivedAt: new Date('2025-08-22T09:00:00Z'),
      addressConfirmedAt: new Date('2025-08-23T11:00:00Z'),
      syncedAt: new Date('2025-08-23T12:00:00Z'),
    },
  });

  // O15 — James Wilson, store2, TRADITIONAL, CREDIT_CARD, COMPLETED
  const o15 = await prisma.order.create({
    data: {
      storeId: store2.id,
      userId: user8.id,
      externalOrderId: 'SH-20006',
      externalOrderNumber: '#20006',
      totalAmount: 78.5,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 1.96,
      status: 'COMPLETED',
      orderMode: 'TRADITIONAL',
      paymentType: 'CREDIT_CARD',
      isGift: false,
      webhookReceivedAt: new Date('2025-11-05T14:00:00Z'),
      addressConfirmedAt: new Date('2025-11-05T14:20:00Z'),
      syncedAt: new Date('2025-11-05T15:00:00Z'),
    },
  });

  // O16 — James Wilson, store3, ADRESLES, BIZUM, READY_TO_PROCESS
  const o16 = await prisma.order.create({
    data: {
      storeId: store3.id,
      userId: user8.id,
      externalOrderId: 'PS-30003',
      externalOrderNumber: '#30003',
      totalAmount: 420.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 10.5,
      status: 'READY_TO_PROCESS',
      orderMode: 'ADRESLES',
      paymentType: 'BIZUM',
      isGift: false,
      webhookReceivedAt: new Date('2025-11-05T16:00:00Z'),
      addressConfirmedAt: new Date('2025-11-05T16:30:00Z'),
    },
  });

  // O17 — Rosa Gómez, store1, ADRESLES, CREDIT_CARD, COMPLETED
  const o17 = await prisma.order.create({
    data: {
      storeId: store1.id,
      userId: user9.id,
      externalOrderId: 'WC-10008',
      externalOrderNumber: '#10008',
      totalAmount: 44.95,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 1.12,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'CREDIT_CARD',
      isGift: false,
      webhookReceivedAt: new Date('2025-12-10T10:00:00Z'),
      addressConfirmedAt: new Date('2025-12-10T10:20:00Z'),
      syncedAt: new Date('2025-12-10T11:00:00Z'),
    },
  });

  // O18 — Rosa Gómez, store3, ADRESLES, BANK_TRANSFER, COMPLETED
  const o18 = await prisma.order.create({
    data: {
      storeId: store3.id,
      userId: user9.id,
      externalOrderId: 'PS-30004',
      externalOrderNumber: '#30004',
      totalAmount: 119.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 2.98,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'BANK_TRANSFER',
      isGift: false,
      webhookReceivedAt: new Date('2026-01-05T09:00:00Z'),
      addressConfirmedAt: new Date('2026-01-05T09:30:00Z'),
      syncedAt: new Date('2026-01-05T10:00:00Z'),
    },
  });

  // O19 — Rosa Gómez, store3, TRADITIONAL, CASH_ON_DELIVERY, PENDING_PAYMENT
  //        Sin OrderAddress (pago no confirmado aún)
  await prisma.order.create({
    data: {
      storeId: store3.id,
      userId: user9.id,
      externalOrderId: 'PS-30005',
      externalOrderNumber: '#30005',
      totalAmount: 89.99,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 2.25,
      status: 'PENDING_PAYMENT',
      orderMode: 'TRADITIONAL',
      paymentType: 'CASH_ON_DELIVERY',
      isGift: false,
      webhookReceivedAt: new Date('2026-01-28T15:00:00Z'),
    },
  });

  // O20 — Elena Díaz, store2, ADRESLES, PAYPAL, COMPLETED
  const o20 = await prisma.order.create({
    data: {
      storeId: store2.id,
      userId: user10.id,
      externalOrderId: 'SH-20007',
      externalOrderNumber: '#20007',
      totalAmount: 65.0,
      currency: 'EUR',
      feePercentage: 2.5,
      feeAmount: 1.63,
      status: 'COMPLETED',
      orderMode: 'ADRESLES',
      paymentType: 'PAYPAL',
      isGift: false,
      webhookReceivedAt: new Date('2025-12-18T12:00:00Z'),
      addressConfirmedAt: new Date('2025-12-18T12:20:00Z'),
      syncedAt: new Date('2025-12-18T13:00:00Z'),
    },
  });

  // ─── OrderAddresses (18) ──────────────────────────────────────────────────
  //
  // Cobertura de AddressOrigin:
  //   STORE_TRADITIONAL  → O3, O7, O8, O10, O15   (TRADITIONAL mode)
  //   ADRESLES_SAVED     → O1, O4                  (registrado con dir. guardada)
  //   USER_CONVERSATION  → O2,O5,O6,O9,O11,O13,O14,O17,O18  (WhatsApp)
  //   STORE_ADRESLES     → O16, O20                (tienda en modo Adresles)
  //
  // Regla recipientType:
  //   isGift=true  → GIFT_RECIPIENT + recipientPhoneId = phone del destinatario
  //   isGift=false → BUYER         + recipientPhoneId = phone del comprador
  //
  // O12 y O19 no tienen OrderAddress (PENDING_ADDRESS / PENDING_PAYMENT).

  // O1 — ADRESLES_SAVED: dirección guardada de Ana (addr1Casa)
  await prisma.orderAddress.create({
    data: {
      orderId: o1.id,
      sourceAddressId: addr1Casa.id,
      recipientType: 'BUYER',
      recipientName: 'Ana García',
      recipientPhoneId: ph1.id,
      fullAddress: 'Calle Mayor 12, 2º B, 28001 Madrid',
      street: 'Calle Mayor',
      number: '12',
      floor: '2',
      door: 'B',
      postalCode: '28001',
      city: 'Madrid',
      province: 'Madrid',
      country: 'ES',
      addressOrigin: 'ADRESLES_SAVED',
      confirmedAt: new Date('2025-09-10T10:30:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O2 — USER_CONVERSATION: Ana facilita la dirección de su hermana Lucía durante el chat
  await prisma.orderAddress.create({
    data: {
      orderId: o2.id,
      recipientType: 'GIFT_RECIPIENT',
      recipientName: 'Lucía García',
      recipientPhoneId: phLucia.id,
      fullAddress: 'Calle Alcalá 88, 4º C, 28009 Madrid',
      street: 'Calle Alcalá',
      number: '88',
      floor: '4',
      door: 'C',
      postalCode: '28009',
      city: 'Madrid',
      province: 'Madrid',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2025-10-15T14:45:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O3 — STORE_TRADITIONAL: la tienda envía la dirección directamente
  await prisma.orderAddress.create({
    data: {
      orderId: o3.id,
      recipientType: 'BUYER',
      recipientName: 'Carlos López',
      recipientPhoneId: ph2.id,
      fullAddress: 'Avenida Diagonal 441, Planta 5, 08036 Barcelona',
      street: 'Avenida Diagonal',
      number: '441',
      floor: '5',
      postalCode: '08036',
      city: 'Barcelona',
      province: 'Barcelona',
      country: 'ES',
      addressOrigin: 'STORE_TRADITIONAL',
      confirmedAt: new Date('2025-11-01T09:20:00Z'),
      confirmedVia: 'ECOMMERCE_SYNC',
    },
  });

  // O4 — ADRESLES_SAVED: dirección guardada de María (addr3Casa)
  await prisma.orderAddress.create({
    data: {
      orderId: o4.id,
      sourceAddressId: addr3Casa.id,
      recipientType: 'BUYER',
      recipientName: 'María Fernández',
      recipientPhoneId: ph3.id,
      fullAddress: 'Calle Colón 8, 3º 1ª, 46004 Valencia',
      street: 'Calle Colón',
      number: '8',
      floor: '3',
      door: '1ª',
      postalCode: '46004',
      city: 'Valencia',
      province: 'Valencia',
      country: 'ES',
      addressOrigin: 'ADRESLES_SAVED',
      confirmedAt: new Date('2025-07-20T11:15:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O5 — USER_CONVERSATION: María facilita la dirección de su hermano Javier por WhatsApp
  await prisma.orderAddress.create({
    data: {
      orderId: o5.id,
      recipientType: 'GIFT_RECIPIENT',
      recipientName: 'Javier Fernández',
      recipientPhoneId: phJavier.id,
      fullAddress: 'Paseo de Gracia 55, 08007 Barcelona',
      street: 'Paseo de Gracia',
      number: '55',
      postalCode: '08007',
      city: 'Barcelona',
      province: 'Barcelona',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2025-12-06T10:00:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O6 — USER_CONVERSATION: María indica otra dirección para este pedido
  await prisma.orderAddress.create({
    data: {
      orderId: o6.id,
      recipientType: 'BUYER',
      recipientName: 'María Fernández',
      recipientPhoneId: ph3.id,
      fullAddress: 'Calle Sierpes 22, 41004 Sevilla',
      street: 'Calle Sierpes',
      number: '22',
      postalCode: '41004',
      city: 'Sevilla',
      province: 'Sevilla',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2026-01-10T08:30:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O7 — STORE_TRADITIONAL: pedido cancelado, la dirección ya había sido confirmada
  await prisma.orderAddress.create({
    data: {
      orderId: o7.id,
      recipientType: 'BUYER',
      recipientName: 'María Fernández',
      recipientPhoneId: ph3.id,
      fullAddress: 'Calle Colón 8, 3º 1ª, 46004 Valencia',
      street: 'Calle Colón',
      number: '8',
      floor: '3',
      door: '1ª',
      postalCode: '46004',
      city: 'Valencia',
      province: 'Valencia',
      country: 'ES',
      addressOrigin: 'STORE_TRADITIONAL',
      confirmedAt: new Date('2025-08-15T13:20:00Z'),
      confirmedVia: 'ECOMMERCE_SYNC',
    },
  });

  // O8 — STORE_TRADITIONAL: Pedro, compra tradicional contra reembolso
  await prisma.orderAddress.create({
    data: {
      orderId: o8.id,
      recipientType: 'BUYER',
      recipientName: 'Pedro Martínez',
      recipientPhoneId: ph4.id,
      fullAddress: 'Calle Gran Vía 15, 1º A, 48001 Bilbao',
      street: 'Calle Gran Vía',
      number: '15',
      floor: '1',
      door: 'A',
      postalCode: '48001',
      city: 'Bilbao',
      province: 'Vizcaya',
      country: 'ES',
      addressOrigin: 'STORE_TRADITIONAL',
      confirmedAt: new Date('2025-06-01T10:15:00Z'),
      confirmedVia: 'ECOMMERCE_SYNC',
    },
  });

  // O9 — USER_CONVERSATION: Pedro facilita la dirección de su madre Carmen por WhatsApp
  await prisma.orderAddress.create({
    data: {
      orderId: o9.id,
      recipientType: 'GIFT_RECIPIENT',
      recipientName: 'Carmen Martínez',
      recipientPhoneId: phCarmen.id,
      fullAddress: 'Calle Serrano 12, 28001 Madrid',
      street: 'Calle Serrano',
      number: '12',
      postalCode: '28001',
      city: 'Madrid',
      province: 'Madrid',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2025-11-21T09:00:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O10 — STORE_TRADITIONAL: Pedro compra en TechGadgets de forma tradicional
  await prisma.orderAddress.create({
    data: {
      orderId: o10.id,
      recipientType: 'BUYER',
      recipientName: 'Pedro Martínez',
      recipientPhoneId: ph4.id,
      fullAddress: 'Alameda Mazarredo 69, 48009 Bilbao',
      street: 'Alameda Mazarredo',
      number: '69',
      postalCode: '48009',
      city: 'Bilbao',
      province: 'Vizcaya',
      country: 'ES',
      addressOrigin: 'STORE_TRADITIONAL',
      confirmedAt: new Date('2025-10-05T12:30:00Z'),
      confirmedVia: 'ECOMMERCE_SYNC',
    },
  });

  // O11 — USER_CONVERSATION: Laura facilita su dirección por WhatsApp
  await prisma.orderAddress.create({
    data: {
      orderId: o11.id,
      recipientType: 'BUYER',
      recipientName: 'Laura Sánchez',
      recipientPhoneId: ph5.id,
      fullAddress: 'Calle Goya 33, 2º B, 28001 Madrid',
      street: 'Calle Goya',
      number: '33',
      floor: '2',
      door: 'B',
      postalCode: '28001',
      city: 'Madrid',
      province: 'Madrid',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2025-10-12T15:30:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O12 — PENDING_ADDRESS → sin OrderAddress

  // O13 — USER_CONVERSATION: Jordi facilita dirección por WhatsApp
  await prisma.orderAddress.create({
    data: {
      orderId: o13.id,
      recipientType: 'BUYER',
      recipientName: 'Jordi Puigdomènech',
      recipientPhoneId: ph6.id,
      fullAddress: 'Carrer de la Diputació 112, 08015 Barcelona',
      street: 'Carrer de la Diputació',
      number: '112',
      postalCode: '08015',
      city: 'Barcelona',
      province: 'Barcelona',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2025-09-30T10:25:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O14 — USER_CONVERSATION: Sophie facilita la dirección de su amiga Isabelle por WhatsApp
  await prisma.orderAddress.create({
    data: {
      orderId: o14.id,
      recipientType: 'GIFT_RECIPIENT',
      recipientName: 'Isabelle Moreau',
      recipientPhoneId: phIsabelle.id,
      fullAddress: 'Calle Fuencarral 45, 3º, 28004 Madrid',
      street: 'Calle Fuencarral',
      number: '45',
      floor: '3',
      postalCode: '28004',
      city: 'Madrid',
      province: 'Madrid',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2025-08-23T11:00:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O15 — STORE_TRADITIONAL: James compra en la outlet de forma tradicional
  await prisma.orderAddress.create({
    data: {
      orderId: o15.id,
      recipientType: 'BUYER',
      recipientName: 'James Wilson',
      recipientPhoneId: ph8.id,
      fullAddress: 'Calle Velázquez 25, 28001 Madrid',
      street: 'Calle Velázquez',
      number: '25',
      postalCode: '28001',
      city: 'Madrid',
      province: 'Madrid',
      country: 'ES',
      addressOrigin: 'STORE_TRADITIONAL',
      confirmedAt: new Date('2025-11-05T14:20:00Z'),
      confirmedVia: 'ECOMMERCE_SYNC',
    },
  });

  // O16 — STORE_ADRESLES: la tienda envía la dirección pero en modo Adresles; confirmada manualmente
  await prisma.orderAddress.create({
    data: {
      orderId: o16.id,
      recipientType: 'BUYER',
      recipientName: 'James Wilson',
      recipientPhoneId: ph8.id,
      fullAddress: 'Calle Velázquez 25, 28001 Madrid',
      street: 'Calle Velázquez',
      number: '25',
      postalCode: '28001',
      city: 'Madrid',
      province: 'Madrid',
      country: 'ES',
      addressOrigin: 'STORE_ADRESLES',
      confirmedAt: new Date('2025-11-05T16:30:00Z'),
      confirmedVia: 'MANUAL',
    },
  });

  // O17 — USER_CONVERSATION: Rosa facilita su dirección en Zaragoza
  await prisma.orderAddress.create({
    data: {
      orderId: o17.id,
      recipientType: 'BUYER',
      recipientName: 'Rosa Gómez',
      recipientPhoneId: ph9.id,
      fullAddress: 'Avenida Libertad 8, 50001 Zaragoza',
      street: 'Avenida Libertad',
      number: '8',
      postalCode: '50001',
      city: 'Zaragoza',
      province: 'Zaragoza',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2025-12-10T10:20:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O18 — USER_CONVERSATION: Rosa facilita otra dirección (familiar en Teruel)
  await prisma.orderAddress.create({
    data: {
      orderId: o18.id,
      recipientType: 'BUYER',
      recipientName: 'Rosa Gómez',
      recipientPhoneId: ph9.id,
      fullAddress: 'Plaza del Torico 3, 44001 Teruel',
      street: 'Plaza del Torico',
      number: '3',
      postalCode: '44001',
      city: 'Teruel',
      province: 'Teruel',
      country: 'ES',
      addressOrigin: 'USER_CONVERSATION',
      confirmedAt: new Date('2026-01-05T09:30:00Z'),
      confirmedVia: 'CONVERSATION',
    },
  });

  // O19 — PENDING_PAYMENT → sin OrderAddress

  // O20 — STORE_ADRESLES: la tienda envía la dirección en modo Adresles; confirmada manualmente
  await prisma.orderAddress.create({
    data: {
      orderId: o20.id,
      recipientType: 'BUYER',
      recipientName: 'Elena Díaz',
      recipientPhoneId: ph10.id,
      fullAddress: 'Carrer de Portaferrissa 14, 1r 1a, 08002 Barcelona',
      street: 'Carrer de Portaferrissa',
      number: '14',
      floor: '1r',
      door: '1a',
      postalCode: '08002',
      city: 'Barcelona',
      province: 'Barcelona',
      country: 'ES',
      addressOrigin: 'STORE_ADRESLES',
      confirmedAt: new Date('2025-12-18T12:20:00Z'),
      confirmedVia: 'MANUAL',
    },
  });

  // ─── GiftRecipients (4) ───────────────────────────────────────────────────
  //
  // phoneId        → Phone.id del destinatario (mismo que su User.phoneId)
  // recipientUserId → User.id del destinatario (creado arriba como no registrado)
  //
  // Invariante: GiftRecipient.phoneId == recipientUser.phoneId

  // O2 — Lucía García, hermana de Ana
  await prisma.giftRecipient.create({
    data: {
      orderId: o2.id,
      phoneId: phLucia.id,
      recipientUserId: userLucia.id,
      firstName: 'Lucía',
      lastName: 'García',
      note: 'Regalo de cumpleaños, envolver con cuidado',
      status: 'COMPLETED',
    },
  });

  // O5 — Javier Fernández, hermano de María
  await prisma.giftRecipient.create({
    data: {
      orderId: o5.id,
      phoneId: phJavier.id,
      recipientUserId: userJavier.id,
      firstName: 'Javier',
      lastName: 'Fernández',
      note: 'Regalo de Navidad, no revelar quién lo envía',
      status: 'COMPLETED',
    },
  });

  // O9 — Carmen Martínez, madre de Pedro
  await prisma.giftRecipient.create({
    data: {
      orderId: o9.id,
      phoneId: phCarmen.id,
      recipientUserId: userCarmen.id,
      firstName: 'Carmen',
      lastName: 'Martínez',
      note: 'Para mi madre, es su aniversario de bodas',
      status: 'COMPLETED',
    },
  });

  // O14 — Isabelle Moreau, amiga francesa de Sophie residente en Madrid
  await prisma.giftRecipient.create({
    data: {
      orderId: o14.id,
      phoneId: phIsabelle.id,
      recipientUserId: userIsabelle.id,
      firstName: 'Isabelle',
      lastName: 'Moreau',
      note: 'Cadeau pour mon amie qui vit à Madrid',
      status: 'COMPLETED',
    },
  });

  console.log(
    'Seed completado: 14 phones, 2 ecommerces, 3 tiendas, 14 usuarios, ' +
      '20 pedidos (4 gifts, 1 pending_address, 1 pending_payment, 1 canceled)',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
