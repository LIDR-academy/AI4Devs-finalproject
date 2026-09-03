import { AssetType } from '@prisma/client';

export const MVP_ASSET_TYPES: readonly AssetType[] = [
  AssetType.BUSINESS_SUMMARY,
  AssetType.WEBSITE_CONTENT,
  AssetType.GOOGLE_BUSINESS_DESCRIPTION,
  AssetType.SOCIAL_MEDIA_BIO,
  AssetType.FAQ,
] as const;

export interface BusinessProfileContext {
  businessName: string;
  category: string;
  services: string[];
  products: string[];
  targetAudience: string;
  tone: string;
  style: string | null;
  location: string;
  phone: string | null;
  website: string | null;
  gdprConsent: boolean;
}

export interface LlmRequest {
  assetType: AssetType;
  prompt: string;
  context: BusinessProfileContext;
}

export interface LlmResponse {
  title: string;
  content: string;
  tokensUsed: number;
}

export interface LLMGateway {
  complete(request: LlmRequest): Promise<LlmResponse>;
}

export const LLM_GATEWAY = Symbol('LLM_GATEWAY');
