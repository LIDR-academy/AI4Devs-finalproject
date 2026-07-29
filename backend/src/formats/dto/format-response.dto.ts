import { Format } from '../entities/format.entity';

export interface FormatResponseDto {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function toFormatResponse(format: Format): FormatResponseDto {
  return {
    id: format.id,
    name: format.name,
    is_default: format.isDefault,
    created_at: format.createdAt.toISOString(),
    updated_at: format.updatedAt.toISOString(),
  };
}
