import { Comment } from '../entities/comment.entity';

export interface ICommentRepository {
  save(comment: Comment): Promise<void>;
  findById(id: string): Promise<Comment | null>;
  findByPinId(pinId: string): Promise<Comment[]>;
  softDelete(id: string): Promise<void>;
}
