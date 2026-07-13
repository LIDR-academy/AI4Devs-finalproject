import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().min(2),
  basePrice: z.number().positive(),
  minPrice: z.number().positive(),
  stock: z.number().int().nonnegative()
});

export const productUpdateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().min(2),
  basePrice: z.number().positive(),
  minPrice: z.number().positive(),
  status: z.enum(['active', 'inactive']).default('active')
});

export const pricingRuleSchema = z.object({
  maxDiscountPercent: z.number().min(0).max(80),
  lowRotationDays: z.number().int().positive(),
  lowStockThreshold: z.number().int().nonnegative(),
  approvalDiscountThreshold: z.number().min(0).max(80),
  offerExpiresInMinutes: z.number().int().positive(),
  active: z.boolean().optional()
});

export const whatsappWebhookSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  productSku: z.string().min(2).optional(),
  message: z.string().min(2),
  quantity: z.number().int().positive().default(1),
  requestedDiscountPercent: z.number().min(0).max(80).optional()
});

export const suggestReplySchema = z.object({
  requestedDiscountPercent: z.number().min(0).max(80).optional(),
  quantity: z.number().int().positive().default(1)
});

export const advisorTakeoverSchema = z.object({
  advisorName: z.string().min(2).max(120).optional()
});

export const advisorReplySchema = z.object({
  message: z.string().min(2).max(2000),
  advisorName: z.string().min(2).max(120).optional()
});

export const advisorManualOfferSchema = z.object({
  discountPercent: z.number().min(0).max(80),
  quantity: z.number().int().positive().default(1),
  advisorName: z.string().min(2).max(120).optional()
});

export const negotiationAcceptSchema = z.object({
  actor: z.enum(['gpt', 'advisor']).optional(),
  advisorName: z.string().min(2).max(120).optional()
});

export const paymentWebhookSchema = z.object({
  externalId: z.string().min(3),
  orderId: z.number().int().positive(),
  status: z.enum(['paid', 'failed'])
});

export const mockCheckoutConfirmSchema = z.object({
  payerName: z.string().min(2).max(120).optional(),
  status: z.enum(['paid']).default('paid')
});

export const deliverySchema = z.object({
  deliveryType: z.enum(['meetup', 'home']).default('meetup'),
  addressText: z.string().min(5),
  latitude: z.number(),
  longitude: z.number(),
  scheduledAt: z.string().datetime()
});
