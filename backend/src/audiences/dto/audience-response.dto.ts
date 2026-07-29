import { Audience } from '../entities/audience.entity';

export interface AudienceResponseDto {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function toAudienceResponse(audience: Audience): AudienceResponseDto {
  return {
    id: audience.id,
    name: audience.name,
    is_default: audience.isDefault,
    created_at: audience.createdAt.toISOString(),
    updated_at: audience.updatedAt.toISOString(),
  };
}
