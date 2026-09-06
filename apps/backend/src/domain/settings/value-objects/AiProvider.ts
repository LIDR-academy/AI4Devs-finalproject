export type AiProviderType = 'GEMINI' | 'OPENAI_COMPATIBLE' | 'HEURISTIC';

export const VALID_AI_PROVIDERS: readonly AiProviderType[] = ['GEMINI', 'OPENAI_COMPATIBLE', 'HEURISTIC'] as const;

export function isValidAiProvider(provider: string): provider is AiProviderType {
  return VALID_AI_PROVIDERS.includes(provider as AiProviderType);
}
