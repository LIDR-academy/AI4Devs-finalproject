import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNull } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Juan Perez',
    email: 'juan@example.com',
    passwordHash: 'hashedPassword123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const createMockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  });

  beforeEach(async () => {
    const mockRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      nombre: 'Juan Perez',
      email: 'juan@example.com',
      contraseña: 'miPassword123',
    };

    it('should create user when email does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email, deletedAt: IsNull() },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.contraseña, 10);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'El email ya está registrado',
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all active users when users exist', async () => {
      const users = [mockUser];
      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
      });
    });

    it('should return empty array when no users exist', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id, deletedAt: IsNull() },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Usuario no encontrado',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email, deletedAt: IsNull() },
      });
    });

    it('should return null when email does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      nombre: 'Juan Actualizado',
      email: 'juan.nuevo@example.com',
    };

    it('should throw ConflictException when new email is already in use', async () => {
      const otherUser = {
        ...mockUser,
        id: 'other-id',
        email: 'juan.nuevo@example.com',
      };
      userRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(otherUser);

      await expect(
        service.update(mockUser.id, { email: 'juan.nuevo@example.com' }),
      ).rejects.toThrow(ConflictException);

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should update user when user exists and email is not duplicated', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      userRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow('Usuario no encontrado');

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should allow update when email is unchanged', async () => {
      const dtoWithSameEmail = { nombre: 'Nuevo Nombre', email: mockUser.email };
      const updatedUser = { ...mockUser, nombre: 'Nuevo Nombre' };
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, dtoWithSameEmail);

      expect(result).toEqual(updatedUser);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when password is empty string', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.update(mockUser.id, { contraseña: '' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockUser.id, { contraseña: '' }),
      ).rejects.toThrow(
        'La contraseña no puede estar vacía. Debe tener al menos 8 caracteres.',
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is shorter than 8 characters', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.update(mockUser.id, { contraseña: 'short' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockUser.id, { contraseña: 'short' }),
      ).rejects.toThrow('La contraseña debe tener al menos 8 caracteres');

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should hash and update password when valid password provided', async () => {
      const newPassword = 'newPassword123';
      const updatedUser = {
        ...mockUser,
        passwordHash: 'newHashedPassword',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, {
        contraseña: newPassword,
      });

      expect(result).toEqual(updatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete user when user exists', async () => {
      userRepository.softDelete.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      await service.remove(mockUser.id);

      expect(userRepository.softDelete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.softDelete.mockResolvedValue({
        affected: 0,
        raw: [],
        generatedMaps: [],
      });

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Usuario no encontrado',
      );
    });
  });
});
