import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { IRoleRepository } from '../../../domain/security/repositories/IRoleRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InvalidPinException } from '../../../domain/auth/errors/InvalidPinException.js';
import { UserBlockedException } from '../../../domain/auth/errors/UserBlockedException.js';

export interface AuthenticateByPinDTO {
  userId: string;
  pin: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  user: {
    id: string;
    name: string;
    role: string;
    mustChangePin: boolean;
  };
}

export class AuthenticateByPinUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtSecret: string,
    /**
     * US-015 Escenario 2 / TK-121: opcional a propósito — sin él el token se emite
     * como siempre, sin `permissions`. La ausencia del campo NUNCA significa "sin
     * permisos" (ver la mitigación de riesgos del ticket): la autorización real la
     * resuelve `authorizePermissions` en vivo contra este mismo repositorio, en cada
     * petición, para que revocar un permiso surta efecto sin esperar a que expire el
     * token. Los permisos del JWT son solo para que la UI no ofrezca lo que fallaría.
     */
    private readonly roleRepository?: IRoleRepository
  ) {}

  private async resolvePermissions(roleName: string): Promise<string[] | undefined> {
    if (!this.roleRepository) return undefined;
    const role = await this.roleRepository.findRoleByName(roleName);
    // Rol huérfano (existe en el usuario pero no en el catálogo): lista vacía, nunca
    // una excepción — un catálogo incompleto no puede impedir iniciar sesión.
    return role ? role.permissions.map((p) => p.code) : [];
  }

  public async execute(dto: AuthenticateByPinDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuario', dto.userId);
    }

    if (user.isBlocked()) {
      throw new UserBlockedException(user.name);
    }

    const isValid = user.validatePin(dto.pin);
    await this.userRepository.save(user);

    if (!isValid) {
      throw new InvalidPinException('PIN de acceso invalido o incorrecto.');
    }

    const permissions = await this.resolvePermissions(user.role);
    const payload = {
      sub: user.id,
      name: user.name,
      role: user.role,
      ...(permissions !== undefined ? { permissions } : {}),
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '12h',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        mustChangePin: user.mustChangePin,
      },
    };
  }
}

