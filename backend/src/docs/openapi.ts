import { z } from 'zod';
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// ─── Shared schemas ───────────────────────────────────────────────────────────

const ErrorSchema = registry.register(
  'Error',
  z.object({ error: z.string() }).openapi('Error'),
);

// ─── Product schemas ──────────────────────────────────────────────────────────

const ProductSchema = registry.register(
  'Product',
  z
    .object({
      id: z.string().openapi({ example: 'clx1z2a3b4c5d6e7f8g9h0' }),
      name: z.string().openapi({ example: 'Nike Pegasus 41' }),
      brand: z.string().openapi({ example: 'Nike' }),
      price: z.number().openapi({ example: 129.99 }),
      image: z.string().openapi({ example: '/images/pegasus-41.jpg' }),
      category: z.string().openapi({ example: 'zapatillas' }),
      subcategory: z.string().openapi({ example: 'neutras' }),
      description: z.string().openapi({ example: 'Zapatilla de running versátil para asfalto.' }),
      features: z.array(z.string()).openapi({ example: ['Amortiguación React', 'Upper transpirable'] }),
      distance: z.array(z.enum(['5K', '10K', 'half-marathon', 'marathon', 'ultra'])),
      surface: z.array(z.enum(['road', 'trail', 'track', 'mixed'])),
      level: z.array(z.enum(['beginner', 'intermediate', 'advanced'])),
      objective: z.array(z.enum(['training', 'competition', 'recovery', 'daily'])),
      sizes: z.array(z.string()).openapi({ example: ['38', '39', '40', '41', '42'] }),
      colors: z.array(z.string()).openapi({ example: ['negro', 'blanco'] }),
      stock: z.number().int().openapi({ example: 25 }),
    })
    .openapi('Product'),
);

// ─── Cart schemas ─────────────────────────────────────────────────────────────

const AddToCartInputSchema = registry.register(
  'AddToCartInput',
  z
    .object({
      productId: z.string().min(1).openapi({ example: 'clx1z2a3b4c5d6e7f8g9h0' }),
      quantity: z.number().int().min(1).openapi({ example: 2 }),
      size: z.string().optional().openapi({ example: '42' }),
      color: z.string().optional().openapi({ example: 'negro' }),
    })
    .openapi('AddToCartInput'),
);

const CartItemResponseSchema = registry.register(
  'CartItemResponse',
  z
    .object({
      productId: z.string().openapi({ example: 'clx1z2a3b4c5d6e7f8g9h0' }),
      productName: z.string().openapi({ example: 'Nike Pegasus 41' }),
      productBrand: z.string().openapi({ example: 'Nike' }),
      productPrice: z.number().openapi({ example: 129.99 }),
      image: z.string().openapi({ example: '/images/pegasus-41.jpg' }),
      stock: z.number().int().openapi({ example: 10, description: 'Stock disponible del producto (límite del stepper)' }),
      quantity: z.number().int().openapi({ example: 2 }),
      size: z.string().optional().openapi({ example: '42' }),
      color: z.string().optional().openapi({ example: 'negro' }),
    })
    .openapi('CartItemResponse'),
);

const UpdateCartItemInputSchema = registry.register(
  'UpdateCartItemInput',
  z
    .object({
      quantity: z.number().int().min(1).openapi({ example: 3 }),
      size: z.string().optional().openapi({ example: '42' }),
      color: z.string().optional().openapi({ example: 'negro' }),
    })
    .openapi('UpdateCartItemInput'),
);

const CartResponseSchema = registry.register(
  'CartResponse',
  z
    .object({
      sessionId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
      items: z.array(CartItemResponseSchema),
      subtotal: z.number().openapi({ example: 259.98 }),
      shipping: z.number().openapi({ example: 0 }),
      total: z.number().openapi({ example: 259.98 }),
    })
    .openapi('CartResponse'),
);

// ─── Checkout & Order schemas ─────────────────────────────────────────────────

const OrderStatusSchema = z.enum(['processing', 'shipped', 'delivered', 'cancelled']);

const CheckoutInputSchema = registry.register(
  'CheckoutInput',
  z
    .object({
      name: z.string().min(1).openapi({ example: 'Ana García' }),
      email: z.string().openapi({ example: 'ana.garcia@example.com' }),
      phone: z.string().optional().openapi({ example: '+34 600 123 456' }),
      address: z.string().min(1).openapi({ example: 'Calle Mayor 10, 2ºB' }),
      city: z.string().min(1).openapi({ example: 'Madrid' }),
      postalCode: z.string().openapi({ example: '28013' }),
      country: z.string().min(1).openapi({ example: 'España' }),
    })
    .openapi('CheckoutInput'),
);

const OrderItemResponseSchema = registry.register(
  'OrderItemResponse',
  z
    .object({
      productId: z.string().openapi({ example: 'clx1z2a3b4c5d6e7f8g9h0' }),
      productName: z.string().openapi({ example: 'Nike Pegasus 41' }),
      productBrand: z.string().openapi({ example: 'Nike' }),
      productPrice: z
        .number()
        .openapi({ example: 129.99, description: 'Precio leído del producto en BD en el momento del checkout, nunca del cliente' }),
      quantity: z.number().int().openapi({ example: 2 }),
      size: z.string().optional().openapi({ example: '42' }),
      color: z.string().optional().openapi({ example: 'negro' }),
    })
    .openapi('OrderItemResponse'),
);

const OrderResponseSchema = registry.register(
  'OrderResponse',
  z
    .object({
      id: z.string().openapi({ example: 'ORD-1750000000000' }),
      status: OrderStatusSchema.openapi({ example: 'processing' }),
      date: z.string().openapi({ example: '2026-06-21T10:00:00.000Z' }),
      subtotal: z.number().openapi({ example: 259.98 }),
      shipping: z.number().openapi({ example: 0 }),
      total: z.number().openapi({ example: 259.98 }),
      shippingName: z.string().openapi({ example: 'Ana García' }),
      shippingEmail: z.string().openapi({ example: 'ana.garcia@example.com' }),
      shippingPhone: z.string().optional().openapi({ example: '+34 600 123 456' }),
      shippingAddress: z.string().openapi({ example: 'Calle Mayor 10, 2ºB' }),
      shippingCity: z.string().openapi({ example: 'Madrid' }),
      shippingPostalCode: z.string().openapi({ example: '28013' }),
      shippingCountry: z.string().openapi({ example: 'España' }),
      items: z.array(OrderItemResponseSchema),
    })
    .openapi('OrderResponse'),
);

const OrderListItemResponseSchema = registry.register(
  'OrderListItemResponse',
  z
    .object({
      productId: z.string().openapi({ example: 'clx1z2a3b4c5d6e7f8g9h0' }),
      productName: z.string().openapi({ example: 'Nike Pegasus 41' }),
      productBrand: z.string().openapi({ example: 'Nike' }),
      productPrice: z.number().openapi({ example: 129.99 }),
      quantity: z.number().int().openapi({ example: 2 }),
      size: z.string().optional().openapi({ example: '42' }),
      color: z.string().optional().openapi({ example: 'negro' }),
      image: z.string().openapi({ example: '/images/pegasus-41.jpg' }),
    })
    .openapi('OrderListItemResponse'),
);

const OrderListResponseSchema = registry.register(
  'OrderListResponse',
  z
    .object({
      id: z.string().openapi({ example: 'ORD-1750000000000' }),
      status: OrderStatusSchema.openapi({ example: 'processing' }),
      date: z.string().openapi({ example: '2026-06-21T10:00:00.000Z' }),
      subtotal: z.number().openapi({ example: 259.98 }),
      shipping: z.number().openapi({ example: 0 }),
      total: z.number().openapi({ example: 259.98 }),
      shippingName: z.string().openapi({ example: 'Ana García' }),
      shippingEmail: z.string().openapi({ example: 'ana.garcia@example.com' }),
      shippingPhone: z.string().optional().openapi({ example: '+34 600 123 456' }),
      shippingAddress: z.string().openapi({ example: 'Calle Mayor 10, 2ºB' }),
      shippingCity: z.string().openapi({ example: 'Madrid' }),
      shippingPostalCode: z.string().openapi({ example: '28013' }),
      shippingCountry: z.string().openapi({ example: 'España' }),
      items: z.array(OrderListItemResponseSchema),
    })
    .openapi('OrderListResponse'),
);

// ─── Health schema ────────────────────────────────────────────────────────────

const HealthResponseSchema = registry.register(
  'HealthResponse',
  z
    .object({
      status: z.literal('ok').openapi({ example: 'ok' }),
      timestamp: z.string().openapi({ example: '2026-06-14T08:00:00.000Z' }),
    })
    .openapi('HealthResponse'),
);

// ─── Paths ────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/api/health',
  tags: ['Health'],
  summary: 'Estado del servidor',
  responses: {
    200: {
      description: 'Servidor operativo',
      content: { 'application/json': { schema: HealthResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/products',
  tags: ['Productos'],
  summary: 'Listado de productos con filtros opcionales',
  request: {
    query: z.object({
      distance: z
        .array(z.enum(['5K', '10K', 'half-marathon', 'marathon', 'ultra']))
        .optional()
        .openapi({
          description: 'Filtrar por distancia objetivo. Admite múltiples valores (?distance=5K&distance=marathon).',
          param: { style: 'form', explode: true },
        }),
      surface: z
        .array(z.enum(['road', 'trail', 'track', 'mixed']))
        .optional()
        .openapi({
          description: 'Filtrar por tipo de superficie. Admite múltiples valores.',
          param: { style: 'form', explode: true },
        }),
      level: z
        .array(z.enum(['beginner', 'intermediate', 'advanced']))
        .optional()
        .openapi({
          description: 'Filtrar por nivel del corredor. Admite múltiples valores.',
          param: { style: 'form', explode: true },
        }),
      objective: z
        .array(z.enum(['training', 'competition', 'recovery', 'daily']))
        .optional()
        .openapi({
          description: 'Filtrar por objetivo de entrenamiento. Admite múltiples valores.',
          param: { style: 'form', explode: true },
        }),
    }),
  },
  responses: {
    200: {
      description: 'Lista de productos',
      content: { 'application/json': { schema: z.array(ProductSchema) } },
    },
    400: {
      description: 'Parámetros de filtro inválidos',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/products/{id}',
  tags: ['Productos'],
  summary: 'Detalle de un producto',
  request: {
    params: z.object({
      id: z.string().min(1).max(200).openapi({ example: 'clx1z2a3b4c5d6e7f8g9h0' }),
    }),
  },
  responses: {
    200: {
      description: 'Producto encontrado',
      content: { 'application/json': { schema: ProductSchema } },
    },
    400: {
      description: 'ID de producto inválido',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Producto no encontrado',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/cart',
  tags: ['Carrito'],
  summary: 'Obtener el carrito de la sesión activa',
  description: 'Devuelve el carrito asociado al `sessionId` de la cookie. Si no existe sesión, devuelve un carrito vacío.',
  responses: {
    200: {
      description: 'Carrito de la sesión (puede estar vacío)',
      content: { 'application/json': { schema: CartResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/cart',
  tags: ['Carrito'],
  summary: 'Añadir un producto al carrito',
  description:
    'El `sessionId` se gestiona mediante cookie HTTP-only (`sessionId=…; HttpOnly; SameSite=Strict`). ' +
    'Si no existe sesión activa se crea automáticamente y la cookie se emite en la respuesta (`Set-Cookie`).',
  request: {
    body: {
      content: { 'application/json': { schema: AddToCartInputSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Carrito actualizado',
      content: { 'application/json': { schema: CartResponseSchema } },
    },
    400: {
      description: 'Datos de entrada inválidos',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Producto no encontrado',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Stock insuficiente',
      content: {
        'application/json': {
          schema: z
            .object({ error: z.string(), available: z.number().int() })
            .openapi({ example: { error: 'Stock insuficiente', available: 3 } }),
        },
      },
    },
    429: {
      description: 'Demasiadas peticiones',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/cart/{productId}',
  tags: ['Carrito'],
  summary: 'Actualizar la cantidad de un ítem del carrito',
  request: {
    params: z.object({
      productId: z.string().min(1).openapi({ example: 'clx1z2a3b4c5d6e7f8g9h0' }),
    }),
    body: {
      content: { 'application/json': { schema: UpdateCartItemInputSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Carrito actualizado',
      content: { 'application/json': { schema: CartResponseSchema } },
    },
    400: {
      description: 'Datos de entrada inválidos',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Ítem no encontrado en el carrito',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Stock insuficiente',
      content: {
        'application/json': {
          schema: z
            .object({ error: z.string(), available: z.number().int() })
            .openapi({ example: { error: 'Stock insuficiente', available: 3 } }),
        },
      },
    },
    429: {
      description: 'Demasiadas peticiones',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/cart/{productId}',
  tags: ['Carrito'],
  summary: 'Eliminar un ítem del carrito',
  request: {
    params: z.object({
      productId: z.string().min(1).openapi({ example: 'clx1z2a3b4c5d6e7f8g9h0' }),
    }),
    query: z.object({
      size: z.string().optional().openapi({ example: '42', description: 'Talla del ítem a eliminar' }),
      color: z.string().optional().openapi({ example: 'negro', description: 'Color del ítem a eliminar' }),
    }),
  },
  responses: {
    200: {
      description: 'Carrito actualizado tras eliminar el ítem',
      content: { 'application/json': { schema: CartResponseSchema } },
    },
    404: {
      description: 'Ítem no encontrado en el carrito',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    429: {
      description: 'Demasiadas peticiones',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/checkout',
  tags: ['Checkout'],
  summary: 'Confirmar pedido (checkout simulado)',
  description:
    'Crea un pedido a partir del carrito de la sesión activa. Revalida el stock de todos los ítems dentro de una ' +
    'transacción Prisma antes de crear el pedido y descuenta el stock atómicamente. El precio de cada ítem se lee ' +
    'siempre del producto en BD; cualquier campo de precio/total enviado por el cliente se ignora.',
  request: {
    body: {
      content: { 'application/json': { schema: CheckoutInputSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Pedido creado',
      content: { 'application/json': { schema: OrderResponseSchema } },
    },
    400: {
      description: 'Datos de envío inválidos o carrito vacío',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Algún producto del carrito ya no existe',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Stock insuficiente para algún ítem del carrito',
      content: {
        'application/json': {
          schema: z
            .object({ error: z.string(), available: z.number().int() })
            .openapi({ example: { error: 'Stock insuficiente', available: 3 } }),
        },
      },
    },
    429: {
      description: 'Demasiadas peticiones',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/orders',
  tags: ['Pedidos'],
  summary: 'Historial de pedidos de la sesión activa',
  description: 'Devuelve los pedidos asociados al `sessionId` de la cookie, de más reciente a más antiguo.',
  responses: {
    200: {
      description: 'Lista de pedidos de la sesión (puede estar vacía)',
      content: { 'application/json': { schema: z.array(OrderListResponseSchema) } },
    },
  },
});

// ─── Document builder ─────────────────────────────────────────────────────────

export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'RunMarket API',
      version: '1.0.0',
      description:
        'API REST del ecommerce RunMarket. Gestiona catálogo de productos deportivos y carrito de compra con sesión anónima.',
    },
    servers: [{ url: 'http://localhost:4000', description: 'Desarrollo local' }],
  });
}
