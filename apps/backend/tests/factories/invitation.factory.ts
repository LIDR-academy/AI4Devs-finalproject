import { Invitation } from '@/domain/entities/invitation.entity';
import { v4 as uuid } from 'uuid';

export const createInvitation = (overrides?: Partial<Invitation>): Invitation => {
  const defaults = {
    id: uuid(),
    projectId: 'project-123',
    email: 'guest@example.com',
    token: uuid(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
    status: 'PENDING' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return new Invitation(
    overrides?.id ?? defaults.id,
    overrides?.projectId ?? defaults.projectId,
    overrides?.email ?? defaults.email,
    overrides?.token ?? defaults.token,
    overrides?.expiresAt ?? defaults.expiresAt,
    overrides?.status ?? defaults.status,
    overrides?.createdAt ?? defaults.createdAt,
    overrides?.updatedAt ?? defaults.updatedAt
  );
};

export const createInvitationDto = (overrides?: any) => ({
  email: 'guest@example.com',
  ...overrides,
});

export const createGuestLoginDto = (overrides?: any) => ({
  token: uuid(),
  ...overrides,
});
