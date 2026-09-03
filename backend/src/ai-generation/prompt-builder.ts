import { AssetType } from '@prisma/client';
import { BusinessProfileContext } from './asset-types';

export const PROMPT_VERSION = 'v1';
export const CONTEXT_VERSION = 'v1';

export class PromptBuilder {
  build(assetType: AssetType, context: BusinessProfileContext): string {
    return [
      `Prompt version: ${PROMPT_VERSION}`,
      `Asset type: ${assetType}`,
      'Use only the supplied canonical business profile.',
      'Do not invent prices, locations, certifications, customers, metrics, services, or features.',
      'If a fact is unavailable, omit it rather than presenting it as true.',
      `Canonical business profile: ${JSON.stringify(context)}`,
    ].join('\n');
  }
}
