import { Test, TestingModule } from '@nestjs/testing';
import { ClbncService } from './service';
import { ClbncDBRepository } from '../repository/repository';
import { ClbncUseCase } from '../../application/usecase';
import { ClbncEntity, ClbncParams } from '../../domain/entity';
// Los tipos ApiResponse y ApiResponses se validan implícitamente en la estructura de la respuesta

// Mock de la configuración del entorno para evitar errores en tests
jest.mock('src/common/config/environment/env.config', () => ({
  envs: {
    appPort: 8000,
    nodeEnv: 'test',
    msNatsServer: ['nats://localhost:4222'],
    dbHost: 'localhost',
    dbPort: 5432,
    dbUser: 'test',
    dbPassword: 'test',
    dbName: 'test',
    dbSsl: false,
    dbConnTimeoutMs: 5000,
    dbIdleTimeoutMs: 30000,
    dbMaxPool: 10,
    dbStatementTimeoutMs: 30000,
    dbPoolSize: 10,
    dbConnectionTimeout: 5000,
    dbIdleTimeout: 30000,
    dbMaxUses: 7500,
    jwtAccessSecret: 'test-secret',
    jwtAccessExpiresIn: '1h',
    jwtRefreshSecret: 'test-refresh-secret',
    jwtRefreshExpiresIn: '7d',
    logLevel: 'info',
    logFormat: 'json',
  },
}));

jest.mock('src/common/database/pg.config', () => ({
  PgService: jest.fn(),
}));

describe('ClbncService', () => {
  let service: ClbncService;
  let mockRepository: jest.Mocked<ClbncDBRepository>;

  const mockClbnc: ClbncEntity = {
    clbnc_cod_clbnc: 1,
    clbnc_cod_clien: 1,
    clbnc_usr_banca: 'usuario@email.com',
    clbnc_pwd_banca: '$2b$12$hashedpassword',
    clbnc_fec_regis: new Date('2025-01-01'),
    clbnc_ctr_activ: true,
    clbnc_ctr_termi: true,
    clbnc_lim_diario: 1000.00,
    clbnc_lim_mensu: 15000.00,
    created_by: 1,
    updated_by: 1,
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByClienId: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      login: jest.fn(),
      changePassword: jest.fn(),
      iniciarRecuperacionPassword: jest.fn(),
      completarRecuperacionPassword: jest.fn(),
      bloquear: jest.fn(),
      desbloquear: jest.fn(),
      verificarTokenSesion: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClbncService,
        {
          provide: ClbncDBRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClbncService>(ClbncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.usecase).toBeDefined();
  });

  // ========== CRUD ==========

  describe('findAll', () => {
    it('debe retornar ApiResponses con formato correcto cuando hay datos', async () => {
      const usuarios = [mockClbnc];
      mockRepository.findAll.mockResolvedValue({ data: usuarios, total: 1 });

      const result = await service.findAll();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(usuarios);
      expect(result.meta.pagination).not.toBeNull();
      expect(result.meta.pagination?.total).toBe(1);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.type).toBe('successful');
      expect(result.meta.information.action).toBe('list');
    });

    it('debe retornar 404 cuando no hay datos', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [], total: 0 });

      await expect(service.findAll()).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('debe retornar ApiResponse con formato correcto cuando encuentra el usuario', async () => {
      mockRepository.findById.mockResolvedValue(mockClbnc);

      const result = await service.findById(1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(mockClbnc);
      expect(result.meta.pagination).toBeNull();
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.type).toBe('successful');
      expect(result.meta.information.action).toBe('get');
    });

    it('debe retornar 404 cuando no encuentra el usuario', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('debe retornar ApiResponse con formato correcto cuando crea exitosamente', async () => {
      mockRepository.create.mockResolvedValue(mockClbnc);

      const result = await service.create(mockClbnc);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockClbnc);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.type).toBe('successful');
      expect(result.meta.information.action).toBe('create');
    });

    it('debe retornar 500 cuando falla la creación', async () => {
      mockRepository.create.mockResolvedValue(null);

      await expect(service.create(mockClbnc)).rejects.toThrow();
    });
  });

  // ========== AUTENTICACIÓN Y SEGURIDAD ==========

  describe('login', () => {
    it('debe retornar ApiResponse con formato correcto cuando el login es exitoso', async () => {
      const loginResult = {
        usuario: mockClbnc,
        tokenSesion: 'token123',
      };
      mockRepository.login.mockResolvedValue(loginResult);

      const result = await service.login('usuario@email.com', 'password123', {});

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('usuario');
      expect(result.data).toHaveProperty('tokenSesion');
      expect(result.data).toHaveProperty('clienteId');
      expect(result.data.usuario).toEqual(mockClbnc);
      expect(result.data.tokenSesion).toBe('token123');
      expect(result.data.clienteId).toBe(1);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('validator');
    });

    it('debe retornar 401 cuando las credenciales son inválidas', async () => {
      mockRepository.login.mockResolvedValue(null);

      await expect(service.login('usuario@email.com', 'wrongpassword', {})).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    it('debe retornar ApiResponse con formato correcto cuando cambia la contraseña exitosamente', async () => {
      mockRepository.changePassword.mockResolvedValue(mockClbnc);

      const result = await service.changePassword(1, 'oldPassword', 'newPassword');

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockClbnc);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('update');
    });

    it('debe retornar 400 cuando el password actual es incorrecto', async () => {
      mockRepository.changePassword.mockResolvedValue(null);

      await expect(service.changePassword(1, 'wrongPassword', 'newPassword')).rejects.toThrow();
    });
  });

  describe('iniciarRecuperacionPassword', () => {
    it('debe retornar ApiResponse con formato correcto cuando inicia la recuperación', async () => {
      const recoveryResult = {
        codigoVerificacion: 'ABC123',
        expiraEn: new Date(),
      };
      mockRepository.iniciarRecuperacionPassword.mockResolvedValue(recoveryResult);

      const result = await service.iniciarRecuperacionPassword('usuario@email.com');

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('codigoVerificacion');
      expect(result.data).toHaveProperty('expiraEn');
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('validator');
    });

    it('debe lanzar excepción con status 200 cuando el usuario no existe (seguridad)', async () => {
      mockRepository.iniciarRecuperacionPassword.mockResolvedValue(null);

      // El servicio lanza una excepción con status 200 cuando el usuario no existe
      // Esto es por seguridad para no revelar si el usuario existe o no
      await expect(service.iniciarRecuperacionPassword('nonexistent@email.com')).rejects.toThrow();
      
      // Verificar que se llamó al método del repositorio
      expect(mockRepository.iniciarRecuperacionPassword).toHaveBeenCalledWith('nonexistent@email.com');
    });
  });

  describe('completarRecuperacionPassword', () => {
    it('debe retornar ApiResponse con formato correcto cuando completa la recuperación', async () => {
      mockRepository.completarRecuperacionPassword.mockResolvedValue(mockClbnc);

      const result = await service.completarRecuperacionPassword(
        'usuario@email.com',
        'ABC123',
        'newPassword'
      );

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockClbnc);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('update');
    });

    it('debe retornar 400 cuando el código es inválido o expiró', async () => {
      mockRepository.completarRecuperacionPassword.mockResolvedValue(null);

      await expect(
        service.completarRecuperacionPassword('usuario@email.com', 'INVALID', 'newPassword')
      ).rejects.toThrow();
    });
  });

  describe('bloquear', () => {
    it('debe retornar ApiResponse con formato correcto cuando bloquea exitosamente', async () => {
      const blockedUser = { ...mockClbnc, clbnc_ctr_activ: false };
      mockRepository.bloquear.mockResolvedValue(blockedUser);

      const result = await service.bloquear(1, 'Motivo de bloqueo');

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(blockedUser);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('update');
    });

    it('debe retornar 404 cuando no encuentra el usuario', async () => {
      mockRepository.bloquear.mockResolvedValue(null);

      await expect(service.bloquear(999, 'Motivo')).rejects.toThrow();
    });
  });

  describe('desbloquear', () => {
    it('debe retornar ApiResponse con formato correcto cuando desbloquea exitosamente', async () => {
      const unblockedUser = { ...mockClbnc, clbnc_ctr_activ: true };
      mockRepository.desbloquear.mockResolvedValue(unblockedUser);

      const result = await service.desbloquear(1);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(unblockedUser);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('update');
    });

    it('debe retornar 404 cuando no encuentra el usuario', async () => {
      mockRepository.desbloquear.mockResolvedValue(null);

      await expect(service.desbloquear(999)).rejects.toThrow();
    });
  });

  describe('verificarTokenSesion', () => {
    it('debe retornar ApiResponse con formato correcto cuando el token es válido', async () => {
      mockRepository.verificarTokenSesion.mockResolvedValue(mockClbnc);

      const result = await service.verificarTokenSesion('validToken123');

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockClbnc);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('validator');
    });

    it('debe retornar 401 cuando el token es inválido o expiró', async () => {
      mockRepository.verificarTokenSesion.mockResolvedValue(null);

      await expect(service.verificarTokenSesion('invalidToken')).rejects.toThrow();
    });
  });

  // ========== ESTRUCTURA DE RESPUESTAS ==========

  describe('Estructura de ApiResponse', () => {
    it('debe tener la estructura correcta de ApiResponse', async () => {
      mockRepository.findById.mockResolvedValue(mockClbnc);

      const result = await service.findById(1);

      // Verificar estructura completa
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('information');
      expect(result.meta).toHaveProperty('pagination');
      expect(result.meta).toHaveProperty('status');
      expect(result.meta).toHaveProperty('error');
      expect(result.meta.information).toHaveProperty('type');
      expect(result.meta.information).toHaveProperty('action');
      expect(result.meta.information).toHaveProperty('message');
      expect(result.meta.information).toHaveProperty('resource');
      expect(result.meta.information).toHaveProperty('method');
    });
  });

  describe('Estructura de ApiResponses', () => {
    it('debe tener la estructura correcta de ApiResponses con paginación', async () => {
      const usuarios = [mockClbnc];
      mockRepository.findAll.mockResolvedValue({ data: usuarios, total: 1 });

      const result = await service.findAll();

      // Verificar estructura completa
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('information');
      expect(result.meta).toHaveProperty('pagination');
      expect(result.meta).toHaveProperty('status');
      expect(result.meta).toHaveProperty('error');
      expect(result.meta.pagination).not.toBeNull();
      expect(result.meta.pagination).toHaveProperty('page');
      expect(result.meta.pagination).toHaveProperty('pageSize');
      expect(result.meta.pagination).toHaveProperty('pageCount');
      expect(result.meta.pagination).toHaveProperty('total');
    });
  });
});
