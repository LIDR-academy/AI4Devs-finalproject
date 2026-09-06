import { z } from 'zod';
import { VALID_AI_PROVIDERS } from '../../../../domain/settings/value-objects/AiProvider.js';

export const updateAiConfigSchema = z.object({
  provider: z.enum(VALID_AI_PROVIDERS as [string, ...string[]]),
  modelName: z.string().min(1, 'El nombre del modelo es obligatorio.'),
  apiKey: z.string().nullable().optional(),
  endpointUrl: z.string().url('La URL del endpoint debe ser válida.').nullable().optional().or(z.literal('')),
  temperature: z.number().min(0.0).max(0.2, 'La temperatura máxima permitida es 0.2 para garantizar determinismo (Guard 9).'),
  replenishmentOn: z.boolean().optional(),
  rescueRecipesOn: z.boolean().optional(),
  anomalyAuditOn: z.boolean().optional(),
});
