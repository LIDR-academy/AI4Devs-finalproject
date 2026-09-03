import { AssetType } from '@prisma/client';
import { validateGenerationOutput } from './output-validator';

describe('validateGenerationOutput', () => {
  const valid = { title: 'Summary', content: 'Useful content', tokensUsed: 2 };

  it('accepts a valid standard asset response', () => {
    expect(() => validateGenerationOutput(AssetType.BUSINESS_SUMMARY, valid)).not.toThrow();
  });

  it('requires both question and answer markers for FAQs', () => {
    expect(() => validateGenerationOutput(AssetType.FAQ, valid)).toThrow('FAQ response');
  });

  it('rejects malformed provider payloads before persistence', () => {
    expect(() => validateGenerationOutput(AssetType.BUSINESS_SUMMARY, { title: undefined, content: 'content' } as never)).toThrow('title and content');
    expect(() => validateGenerationOutput(AssetType.BUSINESS_SUMMARY, { title: 'Title', content: 'content', tokensUsed: '2' } as never)).toThrow('title and content');
  });

  it('rejects empty content and invalid token metadata', () => {
    expect(() => validateGenerationOutput(AssetType.WEBSITE_CONTENT, { ...valid, content: '' })).toThrow('title and content');
    expect(() => validateGenerationOutput(AssetType.WEBSITE_CONTENT, { ...valid, tokensUsed: -1 })).toThrow('token metadata');
  });
});
