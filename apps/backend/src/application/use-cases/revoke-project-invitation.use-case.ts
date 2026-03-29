import { IInvitationRepository } from '@/domain/repositories/invitation.repository';
import { IProjectRepository } from '@/domain/repositories/project.repository';
import { prisma } from '@/infrastructure/database/prisma';

export class RevokeProjectInvitationUseCase {
  constructor(
    private invitationRepository: IInvitationRepository,
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectId: string, token: string, userId: string): Promise<void> {
    // 1. Verificar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // 2. Verificar permisos (Owner o Editor)
    const hasPermission = await this.checkPermissions(projectId, userId);
    if (!hasPermission) {
      throw new Error('Forbidden: Only Owner or Editor can revoke invitations');
    }

    // 3. Buscar la invitación por token
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // 4. Verificar que la invitación pertenece al proyecto
    if (invitation.projectId !== projectId) {
      throw new Error('Invitation does not belong to this project');
    }

    // 5. Revocar la invitación (cambiar status a EXPIRED)
    await this.invitationRepository.revokeByToken(token);
  }

  private async checkPermissions(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) return false;
    
    if (project.architectId === userId) return true;
    
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!membership) return false;
    
    return membership.role === 'OWNER' || membership.role === 'EDITOR';
  }
}
