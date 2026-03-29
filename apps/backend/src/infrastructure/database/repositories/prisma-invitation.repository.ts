import { IInvitationRepository } from '@/domain/repositories/invitation.repository';
import { Invitation } from '@/domain/entities/invitation.entity';
import { prisma } from '../prisma';

export class PrismaInvitationRepository implements IInvitationRepository {
  async create(invitation: Invitation): Promise<Invitation> {
    const created = await prisma.invitation.create({
      data: {
        id: invitation.id,
        projectId: invitation.projectId,
        email: invitation.email,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      },
    });

    return new Invitation(
      created.id,
      created.projectId,
      created.email,
      created.token,
      created.expiresAt,
      created.status,
      created.createdAt,
      created.updatedAt
    );
  }

  async save(invitation: Invitation): Promise<void> {
    await prisma.invitation.create({
      data: {
        id: invitation.id,
        projectId: invitation.projectId,
        email: invitation.email,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Invitation | null> {
    const inv = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!inv) return null;

    return new Invitation(
      inv.id,
      inv.projectId,
      inv.email,
      inv.token,
      inv.expiresAt,
      inv.status,
      inv.createdAt,
      inv.updatedAt
    );
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) return null;

    return new Invitation(
      invitation.id,
      invitation.projectId,
      invitation.email,
      invitation.token,
      invitation.expiresAt,
      invitation.status,
      invitation.createdAt,
      invitation.updatedAt
    );
  }

  async findByProjectId(projectId: string): Promise<Invitation[]> {
    const invitations = await prisma.invitation.findMany({
      where: {
        projectId,
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations.map(
      (inv) =>
        new Invitation(
          inv.id,
          inv.projectId,
          inv.email,
          inv.token,
          inv.expiresAt,
          inv.status,
          inv.createdAt,
          inv.updatedAt
        )
    );
  }

  async update(invitation: Invitation): Promise<Invitation> {
    const updated = await prisma.invitation.update({
      where: { token: invitation.token },
      data: {
        status: invitation.status,
        updatedAt: invitation.updatedAt,
      },
    });

    return new Invitation(
      updated.id,
      updated.projectId,
      updated.email,
      updated.token,
      updated.expiresAt,
      updated.status,
      updated.createdAt,
      updated.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.invitation.delete({
      where: { id },
    });
  }

  async revokeByToken(token: string): Promise<void> {
    await prisma.invitation.update({
      where: { token },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date(),
      },
    });
  }
}
