import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth-repository.port';
import { TokenPayload } from '../../infrastructure/services/jwt-token.service';
import { UserProfileResponseDto } from '../../infrastructure/dto/response/user-profile.response.dto';

/**
 * Use Case para obtener perfil de usuario
 */
@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  /**
   * Ejecuta la obtención del perfil
   */
  async execute(user: TokenPayload): Promise<UserProfileResponseDto> {
    const usuario = await this.authRepository.findById(user.sub);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      uuid: usuario.uuid,
      username: usuario.username,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email || undefined,
      empresaId: usuario.empresaId,
      oficinaId: usuario.oficinaId,
      perfilId: usuario.perfilId,
      tipoUsuario: usuario.tipoUsuario,
      esAdmin: usuario.esAdmin,
      accesoGlobal: usuario.accesoGlobal,
      mfaActivado: usuario.mfaActivado,
    };
  }
}

