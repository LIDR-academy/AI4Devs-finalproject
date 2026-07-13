import OpenAI from 'openai';
import { config } from '../config.js';

export type AiCommercialAction =
  | 'show_catalog'
  | 'show_inventory'
  | 'propose_offer'
  | 'accept_offer'
  | 'confirm_payment'
  | 'schedule_delivery'
  | 'help'
  | 'handoff';

export type AiCommercialDecision = {
  action: AiCommercialAction;
  productSku: string | null;
  quantity: number;
  requestedDiscountPercent: number | null;
  addressText: string | null;
  customerReply: string;
  rationale: string;
};

export type AiProductContext = {
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  minPrice: number;
  stock: number;
  maxDiscountPercent: number;
  approvalDiscountThreshold: number;
};

export type AiConversationContext = {
  id: number;
  status: string;
  leadName: string;
  leadPhone: string;
  currentProductSku: string;
  currentProductName: string;
  latestNegotiation?: {
    id: number;
    status: string;
    quantity: number;
    proposedPrice: number;
    discountPercent: number;
  } | null;
  latestOrder?: {
    id: number;
    status: string;
    totalAmount: number;
    hasPaymentLink: boolean;
    hasDelivery: boolean;
  } | null;
  recentMessages: Array<{
    direction: string;
    body: string;
  }>;
};

export type AiCommercialAgentInput = {
  incomingMessage: string;
  conversation: AiConversationContext;
  products: AiProductContext[];
};

let client: OpenAI | null = null;

export async function decideCommercialAction(input: AiCommercialAgentInput): Promise<AiCommercialDecision | null> {
  if (!config.openaiApiKey) return null;

  client ??= new OpenAI({ apiKey: config.openaiApiKey });

  const response = await client.responses.create({
    model: config.openaiModel,
    instructions: commercialAgentInstructions(),
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify({
              available_backend_endpoints: backendEndpointContract(),
              conversation: input.conversation,
              products: input.products,
              incoming_message: input.incomingMessage
            })
          }
        ]
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'commercial_decision',
        strict: true,
        schema: commercialDecisionSchema()
      },
      verbosity: 'low'
    }
  });

  return normalizeDecision(JSON.parse(response.output_text) as AiCommercialDecision, input);
}

function commercialAgentInstructions() {
  return [
    'Eres ComercIA, un asesor comercial de WhatsApp para un marketplace colombiano.',
    'Tu trabajo es decidir la siguiente accion backend y redactar una respuesta breve, natural y util en espanol.',
    'No inventes stock, precios, descuentos, links de pago, estados de pago ni entregas. Usa solo el contexto recibido.',
    'No prometas pagos reales: el entorno actual es sandbox y el link de pago es simulado.',
    'Si el cliente quiere comprar, usa propose_offer salvo que ya exista una oferta activa.',
    'Si el cliente acepta una oferta u orden, usa accept_offer.',
    'Si el cliente dice que pago, usa confirm_payment.',
    'Si el cliente pide entrega o manda direccion, usa schedule_delivery.',
    'Si pide catalogo o inventario, usa show_catalog o show_inventory.',
    'Si falta informacion critica, usa help y pregunta solo lo necesario.',
    'Si pide algo fuera del flujo comercial, usa handoff.'
  ].join('\n');
}

function backendEndpointContract() {
  return [
    {
      action: 'show_catalog',
      endpoint: 'GET /products',
      effect: 'Lista productos activos con SKU, precio y stock.'
    },
    {
      action: 'show_inventory',
      endpoint: 'GET /products',
      effect: 'Consulta disponibilidad de un SKU o resumen de stock.'
    },
    {
      action: 'propose_offer',
      endpoint: 'POST /conversations/:id/suggest-reply',
      required_args: ['quantity'],
      optional_args: ['requestedDiscountPercent'],
      effect: 'Calcula oferta con reglas de precio y crea negociacion.'
    },
    {
      action: 'accept_offer',
      endpoint: 'POST /negotiations/:id/accept + POST /orders/:id/payment-link',
      effect: 'Acepta negociacion, crea orden pendiente y genera link de pago simulado.'
    },
    {
      action: 'confirm_payment',
      endpoint: 'POST /webhooks/payments',
      effect: 'Confirma pago sandbox, descuenta inventario y marca orden como pagada.'
    },
    {
      action: 'schedule_delivery',
      endpoint: 'POST /orders/:id/delivery',
      required_args: ['addressText'],
      effect: 'Programa entrega y genera enlace de Google Maps.'
    },
    {
      action: 'help',
      endpoint: 'N/A',
      effect: 'Explica comandos o pide informacion faltante.'
    },
    {
      action: 'handoff',
      endpoint: 'N/A',
      effect: 'Deriva a revision humana.'
    }
  ];
}

function commercialDecisionSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: [
      'action',
      'productSku',
      'quantity',
      'requestedDiscountPercent',
      'addressText',
      'customerReply',
      'rationale'
    ],
    properties: {
      action: {
        type: 'string',
        enum: [
          'show_catalog',
          'show_inventory',
          'propose_offer',
          'accept_offer',
          'confirm_payment',
          'schedule_delivery',
          'help',
          'handoff'
        ]
      },
      productSku: {
        type: ['string', 'null']
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 20
      },
      requestedDiscountPercent: {
        type: ['number', 'null'],
        minimum: 0,
        maximum: 80
      },
      addressText: {
        type: ['string', 'null']
      },
      customerReply: {
        type: 'string',
        minLength: 1,
        maxLength: 900
      },
      rationale: {
        type: 'string',
        minLength: 1,
        maxLength: 500
      }
    }
  };
}

function normalizeDecision(decision: AiCommercialDecision, input: AiCommercialAgentInput): AiCommercialDecision {
  const productSku = decision.productSku && input.products.some((product) => product.sku === decision.productSku)
    ? decision.productSku
    : input.conversation.currentProductSku;

  return {
    action: decision.action,
    productSku,
    quantity: Math.max(1, Math.min(20, Math.round(decision.quantity || 1))),
    requestedDiscountPercent: decision.requestedDiscountPercent === null
      ? null
      : Math.max(0, Math.min(80, Number(decision.requestedDiscountPercent))),
    addressText: decision.addressText?.trim() || null,
    customerReply: decision.customerReply.trim(),
    rationale: decision.rationale.trim()
  };
}
