import { IInvitationRepository } from '@/domain/repositories/invitation.repository';
import { IProjectRepository } from '@/domain/repositories/project.repository';
import { Invitation } from '@/domain/entities/invitation.entity';
import { CreateInvitationDto } from '@/domain/dtos/invitation.dto';
import { prisma } from '@/infrastructure/database/prisma';
import { v4 as uuid } from 'uuid';

const DEFAULT_GUEST_EMAIL = 'guest@system';

export class CreateProjectInvitationUseCase {
  constructor(
    private invitationRepository: IInvitationRepository,
    private projectRepository: IProjectRepository
  ) {}

  async execute(dto: CreateInvitationDto, userId: string): Promise<Invitation> {
    // 1. Verificar que el proyecto existe
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // 2. Verificar permisos (Owner o Editor)
    const hasPermission = await this.checkPermissions(userId, dto.projectId);
    if (!hasPermission) {
      throw new Error('Forbidden: Only Owner or Editor can create invitations');
    }

    // 3. Generar token único y crear invitación
    const token = uuid();
    const email = dto.email || DEFAULT_GUEST_EMAIL;
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 año

    const invitation = new Invitation(
      uuid(),
      dto.projectId,
      email,
      token,
      expiresAt,
      'PENDING',
      new Date(),
      new Date()
    );

    return await this.invitationRepository.create(invitation);
  }

  private async checkPermissions(userId: string, projectId: string): Promise<boolean> {
    // Verificar si el usuario es Owner del proyecto
    const project = await this.projectRepository.findById(projectId);
    if (!project) return false;
    
    if (project.architectId === userId) return true;

    // Verificar si es OWNER o EDITOR en ProjectMember
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
