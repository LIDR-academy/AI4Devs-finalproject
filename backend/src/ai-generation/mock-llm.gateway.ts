import { Injectable } from '@nestjs/common';
import { AssetType } from '@prisma/client';
import { LlmRequest, LlmResponse, LLMGateway } from './asset-types';

@Injectable()
export class MockLlmGateway implements LLMGateway {
  async complete(request: LlmRequest): Promise<LlmResponse> {
    const { context } = request;
    const offer = [...context.services, ...context.products].join(', ');
    const location = context.location ? ` in ${context.location}` : '';
    const tone = context.tone ? ` Tone: ${context.tone}.` : '';
    const base = `${context.businessName} is a ${context.category}${location}. ` +
      `It offers ${offer || 'the listed business offering'} for ${context.targetAudience}.${tone}`;

    const contentByType: Record<AssetType, string> = {
      BUSINESS_SUMMARY: base,
      WEBSITE_CONTENT: `${context.businessName}\n\n${base}${context.style ? ` Style: ${context.style}.` : ''}`,
      GOOGLE_BUSINESS_DESCRIPTION: base,
      SOCIAL_MEDIA_BIO: `${context.businessName} | ${context.category}${location}. ${offer || 'Business services'} for ${context.targetAudience}.`,
      FAQ: `Q: What does ${context.businessName} offer?\nA: ${offer || 'Please contact the business for current offerings.'}\n\nQ: Who is it for?\nA: ${context.targetAudience}.`,
    };

    const content = contentByType[request.assetType];
    return {
      title: request.assetType.replaceAll('_', ' '),
      content,
      tokensUsed: content.split(/\s+/).length,
    };
  }
}
