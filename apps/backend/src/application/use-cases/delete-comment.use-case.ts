import { ICommentRepository } from '@/domain/repositories/comment.repository';
import { CommentNotFoundError, CommentDeletionForbiddenError } from '@/domain/errors/comment.errors';

export interface DeleteCommentContext {
  userId: string | null;
  guestName: string | null;
}

export class DeleteCommentUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(commentId: string, context: DeleteCommentContext): Promise<void> {
    // 1. Find Comment
    const comment = await this.commentRepository.findById(commentId);
    if (!comment || comment.isDeleted()) {
      throw new CommentNotFoundError(commentId);
    }

    // 2. Check Ownership
    if (!comment.isOwnedBy(context.userId, context.guestName)) {
      throw new CommentDeletionForbiddenError();
    }

    // 3. Soft Delete
    await this.commentRepository.softDelete(commentId);
  }
}
