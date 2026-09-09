import { apiRequest } from '../../../shared/http/apiClient.js';

export type AiProviderType = 'GEMINI' | 'OPENAI_COMPATIBLE' | 'HEURISTIC';

export interface AiConfigDto {
  provider: AiProviderType;
  modelName: string;
  endpointUrl: string | null;
  temperature: number;
  apiKeyConfigured: boolean;
  apiKeyMasked: string | null;
  rescueRecipesOn: boolean;
}

export interface UpdateAiConfigDto {
  provider?: AiProviderType;
  modelName?: string;
  endpointUrl?: string | null;
  temperature?: number;
  apiKey?: string;
  rescueRecipesOn?: boolean;
}

export interface TestAiConnectionDto {
  provider?: AiProviderType;
  apiKey?: string;
  endpointUrl?: string | null;
  modelName?: string;
}

export interface TestAiConnectionResponse {
  success: boolean;
  latencyMs: number;
  message: string;
}

export const AiSettingsService = {
  async fetchConfig(): Promise<AiConfigDto> {
    return apiRequest<AiConfigDto>('/settings/ai');
  },

  async updateConfig(data: UpdateAiConfigDto): Promise<AiConfigDto> {
    return apiRequest<AiConfigDto>('/settings/ai', {
      method: 'PUT',
      body: data,
    });
  },

  async testConnection(data?: TestAiConnectionDto): Promise<TestAiConnectionResponse> {
    return apiRequest<TestAiConnectionResponse>('/settings/ai/test', {
      method: 'POST',
      body: data ?? {},
    });
  },
};
