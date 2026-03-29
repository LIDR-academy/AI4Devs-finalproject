import { IInvitationRepository } from '@/domain/repositories/invitation.repository';
import { IProjectRepository } from '@/domain/repositories/project.repository';
import { GuestLoginDto, GuestLoginResponseDto } from '@/domain/dtos/invitation.dto';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export class GuestLoginUseCase {
  constructor(
    private invitationRepository: IInvitationRepository,
    private projectRepository: IProjectRepository
  ) {}

  async execute(dto: GuestLoginDto): Promise<GuestLoginResponseDto> {
    // 1. Buscar invitación por token
    const invitation = await this.invitationRepository.findByToken(dto.token);
    if (!invitation) {
      throw new Error('Invalid token');
    }

    // 2. Validar que el token pueda ser usado
    if (!invitation.canBeUsed()) {
      throw new Error('Token has expired or been revoked');
    }

    // 3. Validar que el proyecto esté activo
    const project = await this.projectRepository.findById(invitation.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.status !== 'ACTIVE') {
      throw new Error('Project is not active');
    }

    // 4. Si status es PENDING, actualizar a ACCEPTED (tracking)
    if (invitation.status === 'PENDING') {
      const updatedInvitation = invitation.markAsAccepted();
      await this.invitationRepository.update(updatedInvitation);
    }

    // 5. Generar JWT con payload de invitado
    const accessToken = jwt.sign(
      {
        sub: `guest-${project.id}`,
        role: 'GUEST',
        projectId: project.id,
        guestName: invitation.email,
        permissions: ['READ_PROJECT', 'READ_PLANS', 'READ_LAYERS'],
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      accessToken,
      project: {
        id: project.id,
        title: project.title,
      },
    };
  }
}
