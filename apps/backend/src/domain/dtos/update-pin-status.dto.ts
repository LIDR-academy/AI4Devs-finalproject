export interface UpdatePinStatusDto {
  status: 'OPEN' | 'RESOLVED';
}

export function validateUpdatePinStatusDto(dto: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!dto.status || !['OPEN', 'RESOLVED'].includes(dto.status)) {
    errors.push('status must be either "OPEN" or "RESOLVED"');
  }
  
  return { valid: errors.length === 0, errors };
}
