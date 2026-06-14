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
      quantity: z.number().int().openapi({ example: 2 }),
      size: z.string().optional().openapi({ example: '42' }),
      color: z.string().optional().openapi({ example: 'negro' }),
    })
    .openapi('CartItemResponse'),
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
        .enum(['5K', '10K', 'half-marathon', 'marathon', 'ultra'])
        .optional()
        .openapi({ description: 'Filtrar por distancia objetivo (admite múltiples valores)' }),
      surface: z
        .enum(['road', 'trail', 'track', 'mixed'])
        .optional()
        .openapi({ description: 'Filtrar por tipo de superficie' }),
      level: z
        .enum(['beginner', 'intermediate', 'advanced'])
        .optional()
        .openapi({ description: 'Filtrar por nivel del corredor' }),
      objective: z
        .enum(['training', 'competition', 'recovery', 'daily'])
        .optional()
        .openapi({ description: 'Filtrar por objetivo de entrenamiento' }),
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
  method: 'post',
  path: '/api/cart',
  tags: ['Carrito'],
  summary: 'Añadir un producto al carrito',
  description:
    'El `sessionId` se gestiona mediante cookie HTTP-only. Si no existe sesión activa se crea automáticamente.',
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
    servers: [{ url: 'http://localhost:3001', description: 'Desarrollo local' }],
  });
}
