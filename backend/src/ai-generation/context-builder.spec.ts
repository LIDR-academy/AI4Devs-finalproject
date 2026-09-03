import { BusinessProfile, BusinessProfileStatus } from '@prisma/client';
import { ContextBuilder } from './context-builder';

function profile(): BusinessProfile {
  return {
    id: 'profile-id',
    businessId: 'business-id',
    businessName: 'Canonical Cafe',
    category: 'Cafe',
    services: ['Coffee'],
    products: ['Pastries'],
    targetAudience: 'People nearby',
    tone: 'Friendly',
    style: 'Direct',
    location: 'Madrid',
    phone: null,
    website: null,
    gdprConsent: true,
    status: BusinessProfileStatus.APPROVED,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

describe('ContextBuilder', () => {
  it('uses canonical profile values and has no discovery response input', () => {
    const context = new ContextBuilder().build(profile());
    expect(context).toEqual({
      businessName: 'Canonical Cafe',
      category: 'Cafe',
      services: ['Coffee'],
      products: ['Pastries'],
      targetAudience: 'People nearby',
      tone: 'Friendly',
      style: 'Direct',
      location: 'Madrid',
      phone: null,
      website: null,
      gdprConsent: true,
    });
    expect(JSON.stringify(context)).not.toContain('raw discovery');
  });
});
