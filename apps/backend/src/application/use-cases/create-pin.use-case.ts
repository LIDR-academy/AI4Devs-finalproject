import { randomUUID } from 'crypto';
import { IPinRepository } from '@/domain/repositories/pin.repository';
import { ICommentRepository } from '@/domain/repositories/comment.repository';
import { CreatePinDto, validateCreatePinDto } from '@/domain/dtos/create-pin.dto';
import { Pin } from '@/domain/entities/pin.entity';
import { Comment } from '@/domain/entities/comment.entity';
import { InvalidPinCoordinatesError } from '@/domain/errors/pin.errors';

export interface CreatePinContext {
  layerId: string;
  userId: string | null;
  guestName: string | null;
}

export class CreatePinUseCase {
  constructor(
    private pinRepository: IPinRepository,
    private commentRepository: ICommentRepository
  ) {}

  async execute(context: CreatePinContext, dto: CreatePinDto): Promise<{ pin: Pin; comment: Comment }> {
    // 1. Validate DTO
    const validation = validateCreatePinDto(dto);
    if (!validation.valid) {
      throw new InvalidPinCoordinatesError(validation.errors.join(', '));
    }

    // 2. Create Pin
    const pinId = randomUUID();
    const now = new Date();
    
    const pin = new Pin(
      pinId,
      context.layerId,
      dto.xCoord,
      dto.yCoord,
      'OPEN',
      context.userId,
      context.guestName,
      now,
      now,
      null
    );

    await this.pinRepository.save(pin);

    // 3. Create Initial Comment
    const commentId = randomUUID();
    const comment = new Comment(
      commentId,
      pinId,
      dto.content.trim(),
      context.userId,
      context.guestName,
      now,
      now,
      null
    );

    await this.commentRepository.save(comment);

    return { pin, comment };
  }
}
