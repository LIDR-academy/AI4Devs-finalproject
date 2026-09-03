import { BusinessProfile } from '@prisma/client';
import { BusinessProfileContext } from './asset-types';

export class ContextBuilder {
  build(profile: BusinessProfile): BusinessProfileContext {
    return {
      businessName: profile.businessName,
      category: profile.category,
      services: this.asStringArray(profile.services),
      products: this.asStringArray(profile.products),
      targetAudience: profile.targetAudience,
      tone: profile.tone,
      style: profile.style,
      location: profile.location,
      phone: profile.phone,
      website: profile.website,
      gdprConsent: profile.gdprConsent,
    };
  }

  private asStringArray(value: unknown): string[] {
    return Array.isArray(value) && value.every((item): item is string => typeof item === 'string')
      ? value
      : [];
  }
}
