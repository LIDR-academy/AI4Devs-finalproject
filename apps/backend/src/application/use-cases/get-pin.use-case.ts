import { IPinRepository } from '@/domain/repositories/pin.repository';
import { ICommentRepository } from '@/domain/repositories/comment.repository';
import { Pin } from '@/domain/entities/pin.entity';
import { Comment } from '@/domain/entities/comment.entity';
import { PinNotFoundError } from '@/domain/errors/pin.errors';

export class GetPinUseCase {
  constructor(
    private pinRepository: IPinRepository,
    private commentRepository: ICommentRepository
  ) {}

  async execute(pinId: string): Promise<{ pin: Pin; comments: Comment[] }> {
    const pin = await this.pinRepository.findById(pinId);
    
    if (!pin || pin.isDeleted()) {
      throw new PinNotFoundError(pinId);
    }

    const comments = await this.commentRepository.findByPinId(pinId);
    const activeComments = comments.filter(c => !c.isDeleted());

    return { pin, comments: activeComments };
  }
}
