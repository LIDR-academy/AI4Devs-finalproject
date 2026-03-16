import { Test, TestingModule } from '@nestjs/testing';
import { ClbncDBRepository } from './repository';
import { PgService } from 'src/common/database/pg.config';
import { ClbncEntity } from '../../domain/entity';
import { PoolClient } from 'pg';

// Mock de la configuración del entorno
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

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

// Mock de crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

describe('ClbncDBRepository', () => {
  let repository: ClbncDBRepository;
  let mockPgService: jest.Mocked<PgService>;
  let mockPoolClient: jest.Mocked<PoolClient>;

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
    // Mock de PoolClient para transacciones
    mockPoolClient = {
      query: jest.fn(),
    } as any;

    // Mock de PgService
    mockPgService = {
      queryList: jest.fn(),
      queryGet: jest.fn(),
      query: jest.fn(),
      transaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClbncDBRepository,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    repository = module.get<ClbncDBRepository>(ClbncDBRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // ========== CRUD ==========

  describe('findAll', () => {
    it('debe ejecutar query SQL con filtro de soft delete', async () => {
      const usuarios = [mockClbnc];
      mockPgService.queryList.mockResolvedValue(usuarios);
      mockPgService.queryGet.mockResolvedValue({ total: 1 });

      const result = await repository.findAll();

      expect(mockPgService.queryList).toHaveBeenCalled();
      const callArgs = mockPgService.queryList.mock.calls[0];
      expect(callArgs[0]).toContain('deleted_at IS NULL');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe aplicar filtros de búsqueda correctamente', async () => {
      const usuarios = [mockClbnc];
      mockPgService.queryList.mockResolvedValue(usuarios);
      mockPgService.queryGet.mockResolvedValue({ total: 1 });

      const params = {
        clienteId: 1,
        username: 'usuario@email.com',
        activo: true,
        page: 1,
        pageSize: 20,
      };

      await repository.findAll(params);

      const callArgs = mockPgService.queryList.mock.calls[0];
      const sql = callArgs[0];
      expect(sql).toContain('clbnc_cod_clien = $');
      expect(sql).toContain('LOWER(clbnc_usr_banca) = LOWER($');
      expect(sql).toContain('clbnc_ctr_activ = $');
      expect(callArgs[1]).toContain(1); // clienteId
      expect(callArgs[1]).toContain('usuario@email.com'); // username
      expect(callArgs[1]).toContain(true); // activo
    });

    it('debe aplicar paginación correctamente', async () => {
      mockPgService.queryList.mockResolvedValue([]);
      mockPgService.queryGet.mockResolvedValue({ total: 0 });

      const params = {
        page: 2,
        pageSize: 10,
      };

      await repository.findAll(params);

      const callArgs = mockPgService.queryList.mock.calls[0];
      const sql = callArgs[0];
      expect(sql).toContain('LIMIT');
      expect(sql).toContain('OFFSET');
      expect(callArgs[1]).toContain(10); // pageSize
      expect(callArgs[1]).toContain(10); // offset = (2-1) * 10
    });
  });

  describe('findById', () => {
    it('debe ejecutar query SQL con prepared statement', async () => {
      mockPgService.queryGet.mockResolvedValue(mockClbnc);

      const result = await repository.findById(1);

      expect(mockPgService.queryGet).toHaveBeenCalled();
      const callArgs = mockPgService.queryGet.mock.calls[0];
      expect(callArgs[0]).toContain('clbnc_cod_clbnc = $1');
      expect(callArgs[0]).toContain('deleted_at IS NULL');
      expect(callArgs[1]).toEqual([1]);
      expect(result).toBeDefined();
    });

    it('debe retornar null si no encuentra el usuario', async () => {
      mockPgService.queryGet.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByClienId', () => {
    it('debe ejecutar query SQL con prepared statement', async () => {
      mockPgService.queryGet.mockResolvedValue(mockClbnc);

      const result = await repository.findByClienId(1);

      expect(mockPgService.queryGet).toHaveBeenCalled();
      const callArgs = mockPgService.queryGet.mock.calls[0];
      expect(callArgs[0]).toContain('clbnc_cod_clien = $1');
      expect(callArgs[0]).toContain('deleted_at IS NULL');
      expect(callArgs[1]).toEqual([1]);
      expect(result).toBeDefined();
    });
  });

  describe('findByUsername', () => {
    it('debe normalizar username a lowercase en la query', async () => {
      mockPgService.queryGet.mockResolvedValue(mockClbnc);

      await repository.findByUsername('Usuario@Email.com');

      const callArgs = mockPgService.queryGet.mock.calls[0];
      expect(callArgs[0]).toContain('LOWER(clbnc_usr_banca) = LOWER($1)');
      expect(callArgs[1]).toEqual(['Usuario@Email.com']);
    });
  });

  describe('create', () => {
    it('debe ejecutar INSERT con prepared statements', async () => {
      const createdClbnc = { ...mockClbnc, clbnc_cod_clbnc: 1 };
      mockPgService.queryGet.mockResolvedValue(createdClbnc);

      const result = await repository.create(mockClbnc);

      expect(mockPgService.queryGet).toHaveBeenCalled();
      const callArgs = mockPgService.queryGet.mock.calls[0];
      expect(callArgs[0]).toContain('INSERT INTO');
      expect(callArgs[0]).toContain('RETURNING *');
      expect(Array.isArray(callArgs[1])).toBe(true);
    });
  });

  describe('update', () => {
    it('debe ejecutar UPDATE con prepared statements', async () => {
      const updatedClbnc = { ...mockClbnc, clbnc_ctr_activ: false };
      mockPgService.queryGet.mockResolvedValue(updatedClbnc);

      const result = await repository.update(1, updatedClbnc);

      expect(mockPgService.queryGet).toHaveBeenCalled();
      const callArgs = mockPgService.queryGet.mock.calls[0];
      expect(callArgs[0]).toContain('UPDATE');
      expect(callArgs[0]).toContain('WHERE clbnc_cod_clbnc = $');
      expect(callArgs[1]).toContain(1); // ID
    });
  });

  describe('delete', () => {
    it('debe ejecutar soft delete (UPDATE deleted_at)', async () => {
      mockPgService.queryGet.mockResolvedValue(mockClbnc);

      const result = await repository.delete(1);

      expect(mockPgService.queryGet).toHaveBeenCalled();
      const callArgs = mockPgService.queryGet.mock.calls[0];
      expect(callArgs[0]).toContain('UPDATE');
      expect(callArgs[0]).toContain('deleted_at = CURRENT_TIMESTAMP');
      expect(callArgs[0]).not.toContain('DELETE FROM'); // No debe ser DELETE físico
    });
  });

  // ========== AUTENTICACIÓN Y SEGURIDAD ==========

  describe('login', () => {
    it('debe ejecutar query para buscar usuario por username', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      mockPgService.queryGet.mockResolvedValue(mockClbnc);
      (mockPgService.query as jest.Mock).mockResolvedValue({
        rows: [{ clbnc_cod_clbnc: 1 }],
      });

      const result = await repository.login('usuario@email.com', 'password123', {});

      expect(mockPgService.queryGet).toHaveBeenCalled();
      const callArgs = mockPgService.queryGet.mock.calls[0];
      expect(callArgs[0]).toContain('LOWER(clbnc_usr_banca) = LOWER($1)');
      expect(callArgs[0]).toContain('deleted_at IS NULL');
      expect(callArgs[0]).toContain('clbnc_ctr_activ = true');
    });

    it('debe verificar password usando bcrypt.compare', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      mockPgService.queryGet.mockResolvedValue(mockClbnc);
      (mockPgService.query as jest.Mock).mockResolvedValue({
        rows: [{ clbnc_cod_clbnc: 1 }],
      });

      await repository.login('usuario@email.com', 'password123', {});

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockClbnc.clbnc_pwd_banca);
    });

    it('debe actualizar información de dispositivo y último ingreso', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      mockPgService.queryGet.mockResolvedValue(mockClbnc);
      (mockPgService.query as jest.Mock).mockResolvedValue({
        rows: [{ clbnc_cod_clbnc: 1 }],
      });

      const deviceInfo = {
        imei: '123456789012345',
        nombreDispositivo: 'iPhone 13',
        detallesDispositivo: 'iOS 15.0',
        ip: '192.168.1.100',
        latitud: -0.180653,
        longitud: -78.467834,
        geocoder: 'Quito, Ecuador',
      };

      await repository.login('usuario@email.com', 'password123', deviceInfo);

      // Debe actualizar información del dispositivo
      expect(mockPgService.query).toHaveBeenCalled();
      const updateCall = mockPgService.query.mock.calls.find(call => 
        call[0].includes('UPDATE') && call[0].includes('clbnc_fec_ultin')
      );
      expect(updateCall).toBeDefined();
    });
  });

  describe('changePassword', () => {
    it('debe verificar password actual antes de cambiar', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('$2b$12$newhash');

      mockPgService.queryGet
        .mockResolvedValueOnce(mockClbnc) // findById
        .mockResolvedValueOnce({ ...mockClbnc, clbnc_pwd_banca: '$2b$12$newhash' }); // update

      const result = await repository.changePassword(1, 'oldPassword', 'newPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', mockClbnc.clbnc_pwd_banca);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', expect.any(Number));
      expect(result).toBeDefined();
    });

    it('debe lanzar error si password actual es incorrecto', async () => {
      const bcrypt = require('bcrypt');
      // Resetear mocks antes del test
      jest.clearAllMocks();
      bcrypt.compare.mockResolvedValue(false);

      mockPgService.queryGet.mockResolvedValue(mockClbnc);

      await expect(
        repository.changePassword(1, 'wrongPassword', 'newPassword')
      ).rejects.toThrow();
      
      // Verificar que compare fue llamado pero hash no
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', mockClbnc.clbnc_pwd_banca);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('iniciarRecuperacionPassword', () => {
    it('debe generar código de verificación y guardarlo', async () => {
      const crypto = require('crypto');
      crypto.randomBytes.mockReturnValue(Buffer.from('ABC123'));

      mockPgService.queryGet.mockResolvedValue(mockClbnc);
      (mockPgService.query as jest.Mock).mockResolvedValue({
        rows: [{ clbnc_cod_clbnc: 1 }],
      });

      const result = await repository.iniciarRecuperacionPassword('usuario@email.com');

      expect(crypto.randomBytes).toHaveBeenCalled();
      expect(mockPgService.queryGet).toHaveBeenCalled();
      const updateCall = mockPgService.queryGet.mock.calls.find(call => 
        call[0].includes('UPDATE') && call[0].includes('clbnc_tok_sesio')
      );
      expect(updateCall).toBeDefined();
      expect(result).toBeDefined();
      expect(result?.codigoVerificacion).toBeDefined();
      expect(result?.expiraEn).toBeInstanceOf(Date);
    });
  });

  describe('completarRecuperacionPassword', () => {
    it('debe verificar código y actualizar password', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('$2b$12$newhash');

      // El código se almacena hasheado en clbnc_tok_sesio y la expiración en clbnc_fec_ultin
      const usuarioConCodigo = {
        ...mockClbnc,
        clbnc_tok_sesio: '$2b$10$hashedcode', // Hash del código
        clbnc_fec_ultin: new Date(Date.now() + 14 * 60 * 1000), // Expira en 14 minutos (válido)
      };

      mockPgService.queryGet
        .mockResolvedValueOnce(usuarioConCodigo) // findByUsername
        .mockResolvedValueOnce({ ...usuarioConCodigo, clbnc_pwd_banca: '$2b$12$newhash' }); // update

      const result = await repository.completarRecuperacionPassword(
        'usuario@email.com',
        'ABC123',
        'newPassword'
      );

      expect(bcrypt.compare).toHaveBeenCalledWith('ABC123', usuarioConCodigo.clbnc_tok_sesio);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', expect.any(Number));
      expect(result).toBeDefined();
    });

    it('debe lanzar error si código es inválido', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(false);

      const usuarioConCodigo = {
        ...mockClbnc,
        clbnc_tok_sesio: '$2b$10$hashedcode',
        clbnc_fec_ultin: new Date(Date.now() + 14 * 60 * 1000),
      };

      mockPgService.queryGet.mockResolvedValue(usuarioConCodigo);

      await expect(
        repository.completarRecuperacionPassword(
          'usuario@email.com',
          'ABC123', // Código incorrecto
          'newPassword'
        )
      ).rejects.toThrow();
    });

    it('debe lanzar error si código expiró', async () => {
      const usuarioConCodigo = {
        ...mockClbnc,
        clbnc_tok_sesio: '$2b$10$hashedcode',
        clbnc_fec_ultin: new Date(Date.now() - 16 * 60 * 1000), // Hace 16 minutos (expirado)
      };

      mockPgService.queryGet.mockResolvedValue(usuarioConCodigo);

      await expect(
        repository.completarRecuperacionPassword(
          'usuario@email.com',
          'ABC123',
          'newPassword'
        )
      ).rejects.toThrow();
    });
  });

  describe('bloquear', () => {
    it('debe ejecutar UPDATE para bloquear usuario', async () => {
      const usuarioBloqueado = { ...mockClbnc, clbnc_ctr_activ: false };
      mockPgService.queryGet.mockResolvedValue(usuarioBloqueado);

      const result = await repository.bloquear(1, 'Motivo de bloqueo');

      expect(mockPgService.queryGet).toHaveBeenCalledTimes(1);
      const updateCall = mockPgService.queryGet.mock.calls[0];
      expect(updateCall[0]).toContain('UPDATE');
      expect(updateCall[0]).toContain('clbnc_ctr_activ = false');
      expect(updateCall[1]).toEqual([1]);
      expect(result).toBeDefined();
    });
  });

  describe('desbloquear', () => {
    it('debe ejecutar UPDATE para desbloquear usuario', async () => {
      const usuarioDesbloqueado = { ...mockClbnc, clbnc_ctr_activ: true };
      mockPgService.queryGet.mockResolvedValue(usuarioDesbloqueado);

      const result = await repository.desbloquear(1);

      expect(mockPgService.queryGet).toHaveBeenCalledTimes(1);
      const updateCall = mockPgService.queryGet.mock.calls[0];
      expect(updateCall[0]).toContain('UPDATE');
      expect(updateCall[0]).toContain('clbnc_ctr_activ = true');
      expect(updateCall[1]).toEqual([1]);
      expect(result).toBeDefined();
    });
  });

  describe('verificarTokenSesion', () => {
    it('debe ejecutar query para buscar usuario por token de sesión', async () => {
      const usuarioConToken = {
        ...mockClbnc,
        clbnc_tok_sesio: 'validToken123',
      };

      mockPgService.queryGet.mockResolvedValue(usuarioConToken);

      const result = await repository.verificarTokenSesion('validToken123');

      expect(mockPgService.queryGet).toHaveBeenCalled();
      const callArgs = mockPgService.queryGet.mock.calls[0];
      expect(callArgs[0]).toContain('clbnc_tok_sesio = $1');
      expect(callArgs[0]).toContain('deleted_at IS NULL');
      expect(callArgs[0]).toContain('clbnc_ctr_activ = true');
      expect(callArgs[1]).toEqual(['validToken123']);
      expect(result).toBeDefined();
    });

    it('debe retornar null si token no es válido', async () => {
      mockPgService.queryGet.mockResolvedValue(null);

      const result = await repository.verificarTokenSesion('invalidToken');

      expect(result).toBeNull();
    });
  });
});

