export class CommentNotFoundError extends Error {
  constructor(commentId?: string) {
    super(commentId ? `Comment with id ${commentId} not found` : 'Comment not found');
    this.name = 'CommentNotFoundError';
  }
}

export class InvalidCommentContentError extends Error {
  constructor(message: string = 'Comment content must be between 1 and 300 characters') {
    super(message);
    this.name = 'InvalidCommentContentError';
  }
}

export class CommentDeletionForbiddenError extends Error {
  constructor() {
    super('Only the creator can delete this comment');
    this.name = 'CommentDeletionForbiddenError';
  }
}
