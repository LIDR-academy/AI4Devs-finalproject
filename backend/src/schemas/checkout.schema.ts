import { z } from 'zod';

// Same regexes as validateShippingForm (frontend/src/components/checkout/shipping-form.tsx) —
// defense in depth, never trust client-side validation alone.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[0-9\s\-().]{7,20}$/;
const POSTAL_CODE_REGEX = /^\d{4,10}$/;

export const CheckoutSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().regex(EMAIL_REGEX),
    phone: z.union([z.string().regex(PHONE_REGEX), z.literal('')]).optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().regex(POSTAL_CODE_REGEX),
    country: z.string().min(1),
  })
  .strict();

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
