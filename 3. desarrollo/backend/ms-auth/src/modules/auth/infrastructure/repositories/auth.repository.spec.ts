import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthRepository } from './auth.repository';
import { UsuarioModel } from '../models/usuario.model';
import { HistorialPasswordModel } from '../models/historial-password.model';
import { UsuarioMapper } from '../mappers/usuario.mapper';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let usuarioRepo: Repository<UsuarioModel>;
  let historialRepo: Repository<HistorialPasswordModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: getRepositoryToken(UsuarioModel),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(HistorialPasswordModel),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    usuarioRepo = module.get<Repository<UsuarioModel>>(
      getRepositoryToken(UsuarioModel),
    );
    historialRepo = module.get<Repository<HistorialPasswordModel>>(
      getRepositoryToken(HistorialPasswordModel),
    );
  });

  describe('findByUsername', () => {
    it('debe retornar null si el usuario no existe', async () => {
      (usuarioRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByUsername('noexiste');

      expect(result).toBeNull();
      expect(usuarioRepo.findOne).toHaveBeenCalledWith({
        where: {
          username: 'noexiste',
          activo: true,
          fechaEliminacion: null,
        },
        relations: ['perfil'],
      });
    });

    it('debe retornar UsuarioEntity si el usuario existe', async () => {
      const mockModel = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        username: 'jperez',
        nombreCompleto: 'Juan Pérez',
        email: 'jperez@ejemplo.com',
        passwordHash: '$2b$12$hash',
        empresaId: 1,
        oficinaId: 1,
        perfilId: 1,
        empleadoId: null,
        tipoUsuario: 'EMPLEADO',
        esAdmin: false,
        accesoGlobal: false,
        fechaUltimoPassword: new Date(),
        forzarCambioPassword: false,
        passwordNuncaExpira: false,
        intentosFallidos: 0,
        fechaPrimerIntentoFallido: null,
        bloqueadoHasta: null,
        motivoBloqueo: null,
        fechaUltimoLogin: null,
        ultimaIpLogin: null,
        mfaActivado: false,
        totpSecret: null,
        activo: true,
        esSistema: false,
        fechaEliminacion: null,
      } as UsuarioModel;

      (usuarioRepo.findOne as jest.Mock).mockResolvedValue(mockModel);

      const result = await repository.findByUsername('jperez');

      expect(result).toBeDefined();
      expect(result?.username).toBe('jperez');
    });
  });

  describe('incrementFailedAttempts', () => {
    it('debe incrementar intentos fallidos', async () => {
      const mockUsuario = {
        id: 1,
        intentosFallidos: 2,
        fechaPrimerIntentoFallido: new Date(),
      } as UsuarioModel;

      (usuarioRepo.findOne as jest.Mock).mockResolvedValue(mockUsuario);
      (usuarioRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.incrementFailedAttempts(1);

      expect(result).toBe(3);
      expect(usuarioRepo.update).toHaveBeenCalledWith(1, {
        intentosFallidos: 3,
      });
    });

    it('debe establecer fechaPrimerIntentoFallido en el primer intento', async () => {
      const mockUsuario = {
        id: 1,
        intentosFallidos: 0,
        fechaPrimerIntentoFallido: null,
      } as UsuarioModel;

      (usuarioRepo.findOne as jest.Mock).mockResolvedValue(mockUsuario);
      (usuarioRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.incrementFailedAttempts(1);

      expect(result).toBe(1);
      expect(usuarioRepo.update).toHaveBeenCalledWith(1, {
        intentosFallidos: 1,
        fechaPrimerIntentoFallido: expect.any(Date),
      });
    });
  });
});

