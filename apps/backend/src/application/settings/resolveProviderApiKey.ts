import { AiProviderType } from '../../domain/settings/value-objects/AiProvider.js';

/**
 * Clave API de fallback desde variable de entorno, por proveedor (AUDIT-DEV-012 L-4).
 * Unifica el nombre de variable que el módulo `settings` usaba (`AI_API_KEY`, inconsistente)
 * con el del resolver de recetas (`GEMINI_API_KEY` / `OPENAI_API_KEY`). Único punto que
 * lee estas variables en el módulo settings.
 */
export function resolveProviderApiKey(provider: AiProviderType): string | null {
  const value = provider === 'GEMINI' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY;
  return value && value.trim().length > 0 ? value.trim() : null;
}
