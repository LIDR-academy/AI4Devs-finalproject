import { IInvitationRepository } from '@/domain/repositories/invitation.repository';
import { IProjectRepository } from '@/domain/repositories/project.repository';
import { Invitation } from '@/domain/entities/invitation.entity';
import { prisma } from '@/infrastructure/database/prisma';

export class GetProjectInvitationsUseCase {
  constructor(
    private invitationRepository: IInvitationRepository,
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectId: string, userId: string): Promise<Invitation[]> {
    // 1. Verificar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // 2. Verificar permisos (Owner o Editor)
    const hasPermission = await this.checkPermissions(projectId, userId);
    if (!hasPermission) {
      throw new Error('Forbidden: Only Owner or Editor can view invitations');
    }

    // 3. Retornar invitaciones activas (PENDING y ACCEPTED)
    return await this.invitationRepository.findByProjectId(projectId);
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
