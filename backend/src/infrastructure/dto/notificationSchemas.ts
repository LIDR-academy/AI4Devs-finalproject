import { z } from "zod";

export const deviceTokenSchema = z
  .object({
    token: z.string().min(32).max(4096),
    platform: z.enum(["WEB"]).default("WEB"),
  })
  .strict();
