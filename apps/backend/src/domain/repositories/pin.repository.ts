import { Pin } from '../entities/pin.entity';
import { Comment } from '../entities/comment.entity';

export interface IPinRepository {
  save(pin: Pin): Promise<void>;
  findById(id: string): Promise<Pin | null>;
  findByLayerId(layerId: string, includeDeleted?: boolean): Promise<Pin[]>;
  findByLayerIdWithStatus(layerId: string, status: 'OPEN' | 'RESOLVED'): Promise<Pin[]>;
  update(pin: Pin): Promise<void>;
  softDelete(id: string): Promise<void>;
  getCommentsForPin(pinId: string): Promise<Comment[]>;
}
