import { randomUUID } from 'crypto';
import { ICommentRepository } from '@/domain/repositories/comment.repository';
import { IPinRepository } from '@/domain/repositories/pin.repository';
import { AddCommentDto, validateAddCommentDto } from '@/domain/dtos/add-comment.dto';
import { Comment } from '@/domain/entities/comment.entity';
import { InvalidCommentContentError } from '@/domain/errors/comment.errors';
import { PinNotFoundError } from '@/domain/errors/pin.errors';

export interface AddCommentContext {
  pinId: string;
  userId: string | null;
  guestName: string | null;
}

export class AddCommentUseCase {
  constructor(
    private commentRepository: ICommentRepository,
    private pinRepository: IPinRepository
  ) {}

  async execute(context: AddCommentContext, dto: AddCommentDto): Promise<Comment> {
    // 1. Validate DTO
    const validation = validateAddCommentDto(dto);
    if (!validation.valid) {
      throw new InvalidCommentContentError(validation.errors.join(', '));
    }

    // 2. Verify Pin Exists
    const pin = await this.pinRepository.findById(context.pinId);
    if (!pin || pin.isDeleted()) {
      throw new PinNotFoundError(context.pinId);
    }

    // 3. Create Comment
    const commentId = randomUUID();
    const now = new Date();
    
    const comment = new Comment(
      commentId,
      context.pinId,
      dto.content.trim(),
      context.userId,
      context.guestName,
      now,
      now,
      null
    );

    await this.commentRepository.save(comment);

    return comment;
  }
}
