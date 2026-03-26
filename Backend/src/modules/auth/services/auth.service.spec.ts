import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'user-id-123',
    nombre: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const createUsersServiceMock = (): jest.Mocked<UsersService> =>
    ({
      create: jest.fn(),
      findByEmail: jest.fn(),
    }) as unknown as jest.Mocked<UsersService>;

  const createJwtServiceMock = (): jest.Mocked<JwtService> =>
    ({
      signAsync: jest.fn(),
    }) as unknown as jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: createUsersServiceMock(),
        },
        {
          provide: JwtService,
          useValue: createJwtServiceMock(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      nombre: 'Test User',
      email: 'test@example.com',
      contraseña: 'Password123',
    };

    it('should register user and return user with access token when data is valid', async () => {
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith({
        nombre: registerDto.nombre,
        email: registerDto.email,
        contraseña: registerDto.contraseña,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'jwt-token-123',
      });
    });

    it('should propagate error from UsersService.create (e.g. ConflictException)', async () => {
      const conflictError = new Error('El email ya está registrado');
      usersService.create.mockRejectedValue(conflictError);

      await expect(service.register(registerDto)).rejects.toBe(conflictError);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      contraseña: 'Password123',
    };

    it('should return user and access token when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-456');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.contraseña,
        mockUser.passwordHash,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'jwt-token-456',
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
