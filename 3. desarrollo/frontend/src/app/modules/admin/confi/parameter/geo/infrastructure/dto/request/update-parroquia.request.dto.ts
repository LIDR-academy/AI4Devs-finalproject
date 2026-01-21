import { CreateParroquiaRequestDto } from './create-parroquia.request.dto';

/**
 * DTO para actualizar una parroquia
 */
export interface UpdateParroquiaRequestDto extends Partial<CreateParroquiaRequestDto> {}

