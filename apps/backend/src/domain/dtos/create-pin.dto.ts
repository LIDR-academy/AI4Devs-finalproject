export interface CreatePinDto {
  xCoord: number;    // 0-1 range
  yCoord: number;    // 0-1 range
  content: string;   // 1-300 chars (initial comment)
}

export function validateCreatePinDto(dto: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof dto.xCoord !== 'number' || dto.xCoord < 0 || dto.xCoord > 1) {
    errors.push('xCoord must be a number between 0 and 1');
  }
  
  if (typeof dto.yCoord !== 'number' || dto.yCoord < 0 || dto.yCoord > 1) {
    errors.push('yCoord must be a number between 0 and 1');
  }
  
  if (!dto.content || typeof dto.content !== 'string') {
    errors.push('content is required and must be a string');
  } else if (dto.content.trim().length < 1) {
    errors.push('content must be at least 1 character');
  } else if (dto.content.length > 300) {
    errors.push('content must not exceed 300 characters');
  }
  
  return { valid: errors.length === 0, errors };
}
