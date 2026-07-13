export type DemoPricingRule = {
  maxDiscountPercent: number;
  lowRotationDays: number;
  lowStockThreshold: number;
  approvalDiscountThreshold: number;
  offerExpiresInMinutes: number;
};

export type DemoInventoryMovement = {
  type: 'initial' | 'restock' | 'reservation' | 'sale' | 'adjustment';
  quantity: number;
  reason: string;
  referenceId?: string;
};

export type DemoProduct = {
  sku: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  minPrice: number;
  initialStock: number;
  stock: number;
  pricingRule: DemoPricingRule;
  movements?: DemoInventoryMovement[];
};

export type DemoLead = {
  name: string;
  phone: string;
  source: string;
  status: string;
};

export type DemoMessage = {
  direction: 'inbound' | 'outbound' | 'system';
  body: string;
  metadata?: Record<string, unknown>;
};

export type DemoNegotiation = {
  quantity: number;
  initialPrice: number;
  proposedPrice: number;
  minAllowedPrice: number;
  discountPercent: number;
  rationale: string;
  status: string;
  expiresInMinutes: number;
};

export type DemoOrder = {
  quantity: number;
  unitPrice: number;
  status: string;
  paymentLink?: {
    externalId: string;
    url: string;
    status: string;
    expiresInMinutes: number;
  };
  paymentEvent?: {
    status: 'paid' | 'failed';
    payload: Record<string, unknown>;
  };
  delivery?: {
    deliveryType: 'meetup' | 'home';
    addressText: string;
    latitude: number;
    longitude: number;
    status: string;
    scheduledInMinutes: number;
  };
};

export type DemoConversation = {
  key: string;
  leadPhone: string;
  productSku: string;
  status: string;
  automationPaused?: boolean;
  lastMessageMinutesAgo: number;
  messages: DemoMessage[];
  negotiation?: DemoNegotiation;
  order?: DemoOrder;
};

export const demoStore = {
  name: 'ComercIA Demo Store',
  phone: '+573001112233'
};

export const demoProducts: DemoProduct[] = [
  {
    sku: 'AUD-BT-001',
    name: 'Audifonos Bluetooth Pro',
    description: 'Audifonos inalambricos con cancelacion de ruido y estuche de carga.',
    category: 'Electronica',
    basePrice: 180000,
    minPrice: 145000,
    initialStock: 12,
    stock: 12,
    pricingRule: {
      maxDiscountPercent: 18,
      lowRotationDays: 14,
      lowStockThreshold: 3,
      approvalDiscountThreshold: 15,
      offerExpiresInMinutes: 30
    }
  },
  {
    sku: 'CAM-WIFI-002',
    name: 'Camara WiFi 360',
    description: 'Camara de seguridad interior con vision nocturna y seguimiento de movimiento.',
    category: 'Hogar',
    basePrice: 220000,
    minPrice: 175000,
    initialStock: 6,
    stock: 6,
    pricingRule: {
      maxDiscountPercent: 20,
      lowRotationDays: 21,
      lowStockThreshold: 2,
      approvalDiscountThreshold: 18,
      offerExpiresInMinutes: 45
    }
  },
  {
    sku: 'CAF-ESP-003',
    name: 'Cafetera Espresso Compacta',
    description: 'Cafetera espresso para capsulas y cafe molido con vaporizador manual.',
    category: 'Hogar',
    basePrice: 390000,
    minPrice: 330000,
    initialStock: 4,
    stock: 3,
    pricingRule: {
      maxDiscountPercent: 14,
      lowRotationDays: 30,
      lowStockThreshold: 2,
      approvalDiscountThreshold: 12,
      offerExpiresInMinutes: 30
    },
    movements: [
      {
        type: 'reservation',
        quantity: -1,
        reason: 'Reserva demo para orden pendiente de pago',
        referenceId: 'seed-order-waiting-payment-coffee'
      }
    ]
  },
  {
    sku: 'MOCH-URB-004',
    name: 'Morral Urbano Antirrobo',
    description: 'Morral impermeable con puerto USB, bolsillo oculto y compartimento para portatil.',
    category: 'Accesorios',
    basePrice: 155000,
    minPrice: 120000,
    initialStock: 14,
    stock: 12,
    pricingRule: {
      maxDiscountPercent: 16,
      lowRotationDays: 18,
      lowStockThreshold: 4,
      approvalDiscountThreshold: 14,
      offerExpiresInMinutes: 30
    },
    movements: [
      {
        type: 'sale',
        quantity: -2,
        reason: 'Venta demo pagada',
        referenceId: 'seed-order-paid-delivery-backpack'
      }
    ]
  },
  {
    sku: 'KIT-GAM-005',
    name: 'Kit Teclado y Mouse Gamer',
    description: 'Combo gamer con teclado mecanico compacto, mouse RGB y pad extendido.',
    category: 'Electronica',
    basePrice: 260000,
    minPrice: 210000,
    initialStock: 5,
    stock: 2,
    pricingRule: {
      maxDiscountPercent: 15,
      lowRotationDays: 10,
      lowStockThreshold: 3,
      approvalDiscountThreshold: 12,
      offerExpiresInMinutes: 20
    },
    movements: [
      {
        type: 'sale',
        quantity: -3,
        reason: 'Ventas presenciales demo',
        referenceId: 'seed-sales-gamer-kit'
      }
    ]
  },
  {
    sku: 'TER-ACO-006',
    name: 'Termo Acero 1L',
    description: 'Termo de acero inoxidable con doble pared, tapa antifugas y conservacion 24 horas.',
    category: 'Hogar',
    basePrice: 85000,
    minPrice: 65000,
    initialStock: 24,
    stock: 24,
    pricingRule: {
      maxDiscountPercent: 12,
      lowRotationDays: 20,
      lowStockThreshold: 5,
      approvalDiscountThreshold: 10,
      offerExpiresInMinutes: 25
    }
  }
];

export const demoLeads: DemoLead[] = [
  { name: 'Laura Perez', phone: '+573001231231', source: 'whatsapp', status: 'open' },
  { name: 'Carlos Medina', phone: '+573105551111', source: 'whatsapp', status: 'open' },
  { name: 'Ana Torres', phone: '+573204441010', source: 'whatsapp', status: 'open' },
  { name: 'Miguel Rojas', phone: '+573145552222', source: 'whatsapp', status: 'won' },
  { name: 'Sofia Ramirez', phone: '+573185553333', source: 'whatsapp', status: 'open' }
];

export const demoConversations: DemoConversation[] = [
  {
    key: 'open-audio',
    leadPhone: '+573001231231',
    productSku: 'AUD-BT-001',
    status: 'open',
    lastMessageMinutesAgo: 25,
    messages: [
      {
        direction: 'inbound',
        body: 'Hola, vi los audifonos Bluetooth. Estan disponibles para entrega hoy?',
        metadata: { requestedDiscountPercent: null, quantity: 1 }
      },
      {
        direction: 'system',
        body: 'Lead creado desde WhatsApp. Pendiente sugerir respuesta comercial.',
        metadata: { stage: 'lead_created' }
      }
    ]
  },
  {
    key: 'human-review-camera',
    leadPhone: '+573105551111',
    productSku: 'CAM-WIFI-002',
    status: 'human_review',
    automationPaused: true,
    lastMessageMinutesAgo: 18,
    messages: [
      {
        direction: 'inbound',
        body: 'Me interesa la camara WiFi, pero necesito un descuento fuerte si compro hoy.',
        metadata: { requestedDiscountPercent: 20, quantity: 1 }
      },
      {
        direction: 'system',
        body: 'La oferta calculada supera el umbral de aprobacion automatica.',
        metadata: { stage: 'approval_required' }
      }
    ],
    negotiation: {
      quantity: 1,
      initialPrice: 220000,
      proposedPrice: 176000,
      minAllowedPrice: 175000,
      discountPercent: 20,
      rationale: 'baja rotacion: descuento maximo permitido; requiere aprobacion humana',
      status: 'human_review',
      expiresInMinutes: 240
    }
  },
  {
    key: 'waiting-payment-coffee',
    leadPhone: '+573204441010',
    productSku: 'CAF-ESP-003',
    status: 'waiting_payment',
    lastMessageMinutesAgo: 12,
    messages: [
      {
        direction: 'inbound',
        body: 'La cafetera me sirve. Me la puedes dejar separada con link de pago?',
        metadata: { requestedDiscountPercent: 10, quantity: 1 }
      },
      {
        direction: 'system',
        body: 'Oferta sugerida: unidad en $351.000 COP con vigencia de 30 minutos.',
        metadata: { stage: 'offer_suggested' }
      },
      {
        direction: 'outbound',
        body: 'Perfecto, Ana. Te separo 1 unidad de la cafetera por $351.000 COP.',
        metadata: { stage: 'order_created' }
      }
    ],
    negotiation: {
      quantity: 1,
      initialPrice: 390000,
      proposedPrice: 351000,
      minAllowedPrice: 330000,
      discountPercent: 10,
      rationale: 'baja rotacion: descuento moderado dentro de margen',
      status: 'accepted',
      expiresInMinutes: 180
    },
    order: {
      quantity: 1,
      unitPrice: 351000,
      status: 'pending_payment',
      paymentLink: {
        externalId: 'seed_pay_waiting_payment_coffee',
        url: 'https://payments.example.test/pay/seed_pay_waiting_payment_coffee',
        status: 'pending',
        expiresInMinutes: 120
      }
    }
  },
  {
    key: 'paid-delivery-backpack',
    leadPhone: '+573145552222',
    productSku: 'MOCH-URB-004',
    status: 'delivery_scheduled',
    lastMessageMinutesAgo: 5,
    messages: [
      {
        direction: 'inbound',
        body: 'Confirmo el morral urbano. Necesito dos unidades para envio a Bogota.',
        metadata: { requestedDiscountPercent: 16, quantity: 2 }
      },
      {
        direction: 'outbound',
        body: 'Pago confirmado. Coordinamos entrega hoy en la direccion indicada.',
        metadata: { stage: 'paid' }
      },
      {
        direction: 'system',
        body: 'Entrega programada y stock actualizado para el pedido demo.',
        metadata: { stage: 'delivery_scheduled' }
      }
    ],
    negotiation: {
      quantity: 2,
      initialPrice: 155000,
      proposedPrice: 130200,
      minAllowedPrice: 120000,
      discountPercent: 16,
      rationale: 'baja rotacion: descuento maximo permitido',
      status: 'accepted',
      expiresInMinutes: 300
    },
    order: {
      quantity: 2,
      unitPrice: 130200,
      status: 'paid',
      paymentLink: {
        externalId: 'seed_pay_paid_delivery_backpack',
        url: 'https://payments.example.test/pay/seed_pay_paid_delivery_backpack',
        status: 'paid',
        expiresInMinutes: 240
      },
      paymentEvent: {
        status: 'paid',
        payload: { provider: 'seed', reference: 'seed-order-paid-delivery-backpack' }
      },
      delivery: {
        deliveryType: 'home',
        addressText: 'Cra 11 #82-01, Bogota',
        latitude: 4.6685,
        longitude: -74.052,
        status: 'scheduled',
        scheduledInMinutes: 1440
      }
    }
  },
  {
    key: 'low-stock-gamer',
    leadPhone: '+573185553333',
    productSku: 'KIT-GAM-005',
    status: 'open',
    lastMessageMinutesAgo: 8,
    messages: [
      {
        direction: 'inbound',
        body: 'Tienes disponible el kit gamer? Si me das buen precio compro dos.',
        metadata: { requestedDiscountPercent: 15, quantity: 2 }
      },
      {
        direction: 'system',
        body: 'Producto con stock bajo. El motor restringe descuento automatico.',
        metadata: { stage: 'low_stock' }
      }
    ],
    negotiation: {
      quantity: 2,
      initialPrice: 260000,
      proposedPrice: 247000,
      minAllowedPrice: 210000,
      discountPercent: 5,
      rationale: 'stock bajo: descuento restringido',
      status: 'proposed',
      expiresInMinutes: 60
    }
  }
];

export const seedTableNames = [
  'stores',
  'products',
  'pricing_rules',
  'inventory_movements',
  'leads',
  'conversations',
  'messages',
  'negotiations',
  'orders',
  'payment_links',
  'payment_events',
  'deliveries'
] as const;

export type SeedTableName = typeof seedTableNames[number];
export type SeedSummary = Record<SeedTableName, number>;

export function minutesFromNow(minutes: number, now = new Date()) {
  return new Date(now.getTime() + minutes * 60 * 1000).toISOString();
}

export function minutesAgo(minutes: number, now = new Date()) {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
}

export function formatSeedSummary(summary: SeedSummary) {
  return seedTableNames.map((table) => `${table}=${summary[table]}`).join(', ');
}
