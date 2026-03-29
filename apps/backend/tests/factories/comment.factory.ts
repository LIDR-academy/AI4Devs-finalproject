import { Comment } from '@/domain/entities/comment.entity';

export class CommentFactory {
  static create(overrides: Partial<Comment> = {}): Comment {
    return new Comment(
      overrides.id || 'comment-test-id',
      overrides.pinId || 'pin-test-id',
      overrides.content || 'Test comment',
      overrides.authorId || 'user-test-id',
      overrides.guestName || null,
      overrides.createdAt || new Date(),
      overrides.updatedAt || new Date(),
      overrides.deletedAt || null
    );
  }

  static createGuest(overrides: Partial<Comment> = {}): Comment {
    return CommentFactory.create({
      ...overrides,
      authorId: null,
      guestName: 'Test Guest',
    });
  }
}
