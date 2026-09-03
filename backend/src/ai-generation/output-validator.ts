import { AssetType } from '@prisma/client';
import { LlmResponse } from './asset-types';

export function validateGenerationOutput(assetType: AssetType, response: LlmResponse): void {
  if (!isLlmResponse(response) || !response.title.trim() || !response.content.trim()) {
    throw new Error('AI response must include a title and content');
  }
  if (!Number.isInteger(response.tokensUsed) || response.tokensUsed < 0) {
    throw new Error('AI response token metadata is invalid');
  }
  if (assetType === AssetType.FAQ && (!response.content.includes('Q:') || !response.content.includes('A:'))) {
    throw new Error('FAQ response must contain question and answer entries');
  }
}

function isLlmResponse(value: unknown): value is LlmResponse {
  return typeof value === 'object' && value !== null
    && 'title' in value && typeof value.title === 'string'
    && 'content' in value && typeof value.content === 'string'
    && 'tokensUsed' in value && typeof value.tokensUsed === 'number';
}
