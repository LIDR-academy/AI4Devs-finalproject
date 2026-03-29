import { Invitation } from '../entities/invitation.entity';

export interface IInvitationRepository {
  create(invitation: Invitation): Promise<Invitation>;
  save(invitation: Invitation): Promise<void>;
  findById(id: string): Promise<Invitation | null>;
  findByToken(token: string): Promise<Invitation | null>;
  findByProjectId(projectId: string): Promise<Invitation[]>;
  update(invitation: Invitation): Promise<Invitation>;
  delete(id: string): Promise<void>;
  revokeByToken(token: string): Promise<void>;
}
