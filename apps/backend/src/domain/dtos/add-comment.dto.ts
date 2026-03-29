export interface AddCommentDto {
  content: string;   // 1-300 chars
}

export function validateAddCommentDto(dto: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (dto.content === undefined || dto.content === null || typeof dto.content !== 'string') {
    errors.push('content is required and must be a string');
  } else if (dto.content.trim().length < 1) {
    errors.push('content must contain at least 1 character');
  } else if (dto.content.length > 300) {
    errors.push('content must not exceed 300 characters');
  }
  
  return { valid: errors.length === 0, errors };
}
