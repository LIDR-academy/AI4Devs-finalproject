import { z } from "zod";

export const deviceTokenSchema = z
  .object({
    token: z.string().min(32).max(4096),
    platform: z.enum(["WEB"]).default("WEB"),
  })
  .strict();

export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  unread_only: z.coerce.boolean().default(false),
  today_only: z.coerce.boolean().default(false),
});
