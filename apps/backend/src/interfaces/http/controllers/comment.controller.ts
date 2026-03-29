import { Request, Response } from 'express';
import { AddCommentUseCase } from '@/application/use-cases/add-comment.use-case';
import { DeleteCommentUseCase } from '@/application/use-cases/delete-comment.use-case';
import {
  CommentNotFoundError,
  InvalidCommentContentError,
  CommentDeletionForbiddenError,
} from '@/domain/errors/comment.errors';
import { PinNotFoundError } from '@/domain/errors/pin.errors';

export class CommentController {
  constructor(
    private addCommentUseCase: AddCommentUseCase,
    private deleteCommentUseCase: DeleteCommentUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { pinId } = req.params;
      const { content } = req.body;
      const user = (req as any).user;

      const context = {
        pinId,
        userId: user?.userId || null,
        guestName: user?.guestName || null,
      };

      const comment = await this.addCommentUseCase.execute(context, { content });

      return res.status(201).json({
        id: comment.id,
        pinId: comment.pinId,
        content: comment.content,
        authorId: comment.authorId,
        guestName: comment.guestName,
        createdAt: comment.createdAt,
      });
    } catch (error) {
      if (error instanceof InvalidCommentContentError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof PinNotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      console.error('Create comment error:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const user = (req as any).user;

      const context = {
        userId: user?.userId || null,
        guestName: user?.guestName || null,
      };

      await this.deleteCommentUseCase.execute(commentId, context);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof CommentDeletionForbiddenError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof CommentNotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      console.error('Delete comment error:', error);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}
