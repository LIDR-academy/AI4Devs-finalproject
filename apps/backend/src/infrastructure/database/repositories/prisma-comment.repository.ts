import { PrismaClient } from '@prisma/client';
import { ICommentRepository } from '@/domain/repositories/comment.repository';
import { Comment } from '@/domain/entities/comment.entity';

export class PrismaCommentRepository implements ICommentRepository {
  constructor(private prisma: PrismaClient) {}

  async save(comment: Comment): Promise<void> {
    await this.prisma.comment.create({
      data: {
        id: comment.id,
        pinId: comment.pinId,
        content: comment.content,
        ...(comment.authorId ? { authorId: comment.authorId } : {}),
        guestName: comment.guestName,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Comment | null> {
    const dbComment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!dbComment) return null;

    return new Comment(
      dbComment.id,
      dbComment.pinId,
      dbComment.content,
      dbComment.authorId,
      dbComment.guestName,
      dbComment.createdAt,
      dbComment.updatedAt,
      dbComment.deletedAt
    );
  }

  async findByPinId(pinId: string): Promise<Comment[]> {
    const dbComments = await this.prisma.comment.findMany({
      where: {
        pinId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    return dbComments.map(
      (c) =>
        new Comment(
          c.id,
          c.pinId,
          c.content,
          c.authorId,
          c.guestName,
          c.createdAt,
          c.updatedAt,
          c.deletedAt
        )
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
