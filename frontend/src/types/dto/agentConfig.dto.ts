export interface AgentConfig {
  id: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  model: string;
  prompt: string;
  updatedAt: string;
}

export interface UpdateAgentConfigDto {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  model?: string;
  prompt?: string;
}

export const AI_MODELS = [
  "openai/gpt-4o-mini",  
  "gpt-4-turbo",                  // GPT-4 Turbo, good balance
  "gpt-4o",                       // Latest version of GPT-4, faster
  "claude-3-opus",                // Maximum quality (expensive)
  "claude-3-sonnet",              // Good balance between quality and cost
  "gemini-pro",                   // Google's model
  "mistral-large"                 // Modello premium di Mistral AI
];

export const ECONOMICAL_AI_MODELS = [
  "openai/gpt-4o-mini",           // Nuovo, potente ed economico, ottima alternativa a GPT-3.5
  "openai/gpt-3.5-turbo",         // Classic, good balance between cost and quality
  "anthropic/claude-instant-1",   // Rapido ed economico, buono per chatbot
  "mistralai/mistral-7b",         // Open-source, excellent if self-hosted
  "google/gemma-7b-it",           // Ottimizzato per l'italiano, efficiente
  "meta/llama-3-8b",               // Ultimo modello open-source, valido e accessibile
  "claude-3-haiku",               // Fast and economical
  "gemini-pro-vision",            // With vision capabilities
  "openai/gpt-4",                 // High quality
  "anthropic/claude-3-sonnet"    // Via OpenRouter
]; 