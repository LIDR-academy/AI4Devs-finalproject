import { Test, TestingModule } from '@nestjs/testing';
import { ClbncUseCase } from './usecase';
import { ClbncPort, CLBNC_REPOSITORY } from '../domain/port';
import { ClbncEntity, ClbncParams } from '../domain/entity';

describe('ClbncUseCase', () => {
  let useCase: ClbncUseCase;
  let mockRepository: jest.Mocked<ClbncPort>;

  // Mock data para Usuario Banca Digital
  const mockClbnc: ClbncEntity = {
    clbnc_cod_clbnc: 1,
    clbnc_cod_clien: 1,
    clbnc_usr_banca: 'usuario@email.com',
    clbnc_pwd_banca: '$2b$12$hashedpassword',
    clbnc_fec_regis: new Date('2025-01-01'),
    clbnc_fec_ultin: null,
    clbnc_tok_sesio: null,
    clbnc_tok_notif: null,
    clbnc_imei_disp: null,
    clbnc_nom_dispo: null,
    clbnc_det_dispo: null,
    clbnc_ipa_ultin: null,
    clbnc_lat_ultin: null,
    clbnc_lon_ultin: null,
    clbnc_geo_ultin: null,
    clbnc_msj_bienv: null,
    clbnc_ctr_activ: true,
    clbnc_ctr_termi: true,
    clbnc_lim_diario: 1000.00,
    clbnc_lim_mensu: 15000.00,
    created_by: 1,
    updated_by: 1,
  };

  beforeEach(async () => {
    // Crear mock del repositorio con todos los métodos
    mockRepository = {
      // CRUD básico
      findAll: jest.fn(),
      findById: jest.fn(),
      findByClienId: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      // Autenticación
      login: jest.fn(),
      changePassword: jest.fn(),
      iniciarRecuperacionPassword: jest.fn(),
      completarRecuperacionPassword: jest.fn(),
      bloquear: jest.fn(),
      desbloquear: jest.fn(),
      verificarTokenSesion: jest.fn(),
    } as any;

    // ClbncUseCase recibe el repositorio directamente en el constructor (no usa @Inject)
    useCase = new ClbncUseCase(mockRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // ========== CRUD BÁSICO ==========

  describe('findById', () => {
    it('debe retornar un usuario cuando existe', async () => {
      mockRepository.findById.mockResolvedValue(mockClbnc);

      const result = await useCase.findById(1);

      expect(result).toEqual(mockClbnc);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('debe retornar null cuando no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.findById(999);

      expect(result).toBeNull();
    });

    it('debe retornar null cuando el ID es inválido', async () => {
      const result = await useCase.findById(0);
      expect(result).toBeNull();
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('debe retornar null cuando el ID es negativo', async () => {
      const result = await useCase.findById(-1);
      expect(result).toBeNull();
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('findByClienId', () => {
    it('debe retornar un usuario cuando existe', async () => {
      mockRepository.findByClienId.mockResolvedValue(mockClbnc);

      const result = await useCase.findByClienId(1);

      expect(result).toEqual(mockClbnc);
      expect(mockRepository.findByClienId).toHaveBeenCalledWith(1);
    });

    it('debe retornar null cuando el clienteId es inválido', async () => {
      const result = await useCase.findByClienId(0);
      expect(result).toBeNull();
      expect(mockRepository.findByClienId).not.toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('debe retornar un usuario cuando existe', async () => {
      mockRepository.findByUsername.mockResolvedValue(mockClbnc);

      const result = await useCase.findByUsername('usuario@email.com');

      expect(result).toEqual(mockClbnc);
      expect(mockRepository.findByUsername).toHaveBeenCalledWith('usuario@email.com');
    });

    it('debe retornar null cuando el username está vacío', async () => {
      const result = await useCase.findByUsername('');
      expect(result).toBeNull();
      expect(mockRepository.findByUsername).not.toHaveBeenCalled();
    });

    it('debe retornar null cuando el username es solo espacios', async () => {
      const result = await useCase.findByUsername('   ');
      expect(result).toBeNull();
      expect(mockRepository.findByUsername).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear un usuario correctamente', async () => {
      const newClbnc: ClbncEntity = {
        ...mockClbnc,
        clbnc_cod_clbnc: undefined,
      };

      mockRepository.findByClienId.mockResolvedValue(null);
      mockRepository.findByUsername.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockClbnc);

      const result = await useCase.create(newClbnc);

      expect(result).toEqual(mockClbnc);
      expect(mockRepository.findByClienId).toHaveBeenCalledWith(newClbnc.clbnc_cod_clien);
      expect(mockRepository.findByUsername).toHaveBeenCalledWith(newClbnc.clbnc_usr_banca);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('debe lanzar error si el cliente ya tiene un usuario de banca digital', async () => {
      const newClbnc: ClbncEntity = {
        ...mockClbnc,
        clbnc_cod_clbnc: undefined,
      };

      mockRepository.findByClienId.mockResolvedValue(mockClbnc);

      await expect(useCase.create(newClbnc)).rejects.toThrow(
        'Este cliente ya tiene un usuario de banca digital registrado'
      );
    });

    it('debe lanzar error si el username ya está en uso', async () => {
      const newClbnc: ClbncEntity = {
        ...mockClbnc,
        clbnc_cod_clbnc: undefined,
      };

      mockRepository.findByClienId.mockResolvedValue(null);
      mockRepository.findByUsername.mockResolvedValue(mockClbnc);

      await expect(useCase.create(newClbnc)).rejects.toThrow(
        'El username ya está en uso'
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un usuario cuando existe', async () => {
      const updatedClbnc: ClbncEntity = {
        ...mockClbnc,
        clbnc_nom_dispo: 'iPhone 13 Pro',
      };

      mockRepository.findById.mockResolvedValue(mockClbnc);
      mockRepository.findByClienId.mockResolvedValue(null);
      mockRepository.findByUsername.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updatedClbnc);

      const result = await useCase.update(1, updatedClbnc);

      expect(result).toEqual(updatedClbnc);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('debe retornar null cuando el ID es inválido', async () => {
      const result = await useCase.update(0, mockClbnc);
      expect(result).toBeNull();
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('debe eliminar un usuario cuando existe', async () => {
      mockRepository.findById.mockResolvedValue(mockClbnc);
      mockRepository.delete.mockResolvedValue(mockClbnc);

      const result = await useCase.delete(1);

      expect(result).toEqual(mockClbnc);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debe retornar null cuando el ID es inválido', async () => {
      const result = await useCase.delete(0);
      expect(result).toBeNull();
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  // ========== AUTENTICACIÓN Y SEGURIDAD (APP MÓVIL) ==========

  describe('login', () => {
    const deviceInfo = {
      imei: '123456789012345',
      nombreDispositivo: 'iPhone 13 Pro',
      detallesDispositivo: 'iOS 15.0',
      ip: '192.168.1.100',
      latitud: -0.180653,
      longitud: -78.467834,
      geocoder: 'Quito, Ecuador',
    };

    it('debe autenticar usuario correctamente con credenciales válidas', async () => {
      const mockLoginResult = {
        usuario: mockClbnc,
        tokenSesion: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
      };

      mockRepository.login.mockResolvedValue(mockLoginResult);

      const result = await useCase.login('usuario@email.com', 'password123', deviceInfo);

      expect(result).toEqual(mockLoginResult);
      expect(mockRepository.login).toHaveBeenCalledWith(
        'usuario@email.com',
        'password123',
        deviceInfo
      );
    });

    it('debe lanzar error cuando el username está vacío', async () => {
      await expect(useCase.login('', 'password123', deviceInfo)).rejects.toThrow(
        'Username es requerido'
      );
      expect(mockRepository.login).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el username es solo espacios', async () => {
      await expect(useCase.login('   ', 'password123', deviceInfo)).rejects.toThrow(
        'Username es requerido'
      );
      expect(mockRepository.login).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el password está vacío', async () => {
      await expect(useCase.login('usuario@email.com', '', deviceInfo)).rejects.toThrow(
        'Password es requerido'
      );
      expect(mockRepository.login).not.toHaveBeenCalled();
    });

    it('debe retornar null cuando las credenciales son inválidas', async () => {
      mockRepository.login.mockResolvedValue(null);

      const result = await useCase.login('usuario@email.com', 'wrongpassword', deviceInfo);

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('debe cambiar password correctamente cuando el password actual es válido', async () => {
      const updatedClbnc: ClbncEntity = {
        ...mockClbnc,
        clbnc_pwd_banca: '$2b$12$newhashedpassword',
      };

      mockRepository.changePassword.mockResolvedValue(updatedClbnc);

      const result = await useCase.changePassword(1, 'passwordActual', 'nuevoPassword123');

      expect(result).toEqual(updatedClbnc);
      expect(mockRepository.changePassword).toHaveBeenCalledWith(
        1,
        'passwordActual',
        'nuevoPassword123'
      );
    });

    it('debe lanzar error cuando el ID es inválido', async () => {
      await expect(useCase.changePassword(0, 'passwordActual', 'nuevoPassword123')).rejects.toThrow(
        'ID inválido'
      );
      expect(mockRepository.changePassword).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el password actual está vacío', async () => {
      await expect(useCase.changePassword(1, '', 'nuevoPassword123')).rejects.toThrow(
        'Password actual es requerido'
      );
      expect(mockRepository.changePassword).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el nuevo password tiene menos de 8 caracteres', async () => {
      await expect(useCase.changePassword(1, 'passwordActual', '1234567')).rejects.toThrow(
        'El nuevo password debe tener al menos 8 caracteres'
      );
      expect(mockRepository.changePassword).not.toHaveBeenCalled();
    });

    it('debe retornar null cuando el password actual es incorrecto', async () => {
      mockRepository.changePassword.mockResolvedValue(null);

      const result = await useCase.changePassword(1, 'wrongPassword', 'nuevoPassword123');

      expect(result).toBeNull();
    });
  });

  describe('iniciarRecuperacionPassword', () => {
    it('debe iniciar recuperación de password correctamente', async () => {
      const mockResult = {
        codigoVerificacion: '123456',
        expiraEn: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      };

      mockRepository.iniciarRecuperacionPassword.mockResolvedValue(mockResult);

      const result = await useCase.iniciarRecuperacionPassword('usuario@email.com');

      expect(result).toEqual(mockResult);
      expect(mockRepository.iniciarRecuperacionPassword).toHaveBeenCalledWith('usuario@email.com');
    });

    it('debe lanzar error cuando el username está vacío', async () => {
      await expect(useCase.iniciarRecuperacionPassword('')).rejects.toThrow(
        'Username es requerido'
      );
      expect(mockRepository.iniciarRecuperacionPassword).not.toHaveBeenCalled();
    });

    it('debe retornar null cuando el usuario no existe (por seguridad)', async () => {
      mockRepository.iniciarRecuperacionPassword.mockResolvedValue(null);

      const result = await useCase.iniciarRecuperacionPassword('noexiste@email.com');

      expect(result).toBeNull();
    });
  });

  describe('completarRecuperacionPassword', () => {
    it('debe completar recuperación de password correctamente', async () => {
      const updatedClbnc: ClbncEntity = {
        ...mockClbnc,
        clbnc_pwd_banca: '$2b$12$newhashedpassword',
        clbnc_tok_sesio: null,
        clbnc_fec_ultin: null,
      };

      mockRepository.completarRecuperacionPassword.mockResolvedValue(updatedClbnc);

      const result = await useCase.completarRecuperacionPassword(
        'usuario@email.com',
        '123456',
        'nuevoPassword123'
      );

      expect(result).toEqual(updatedClbnc);
      expect(mockRepository.completarRecuperacionPassword).toHaveBeenCalledWith(
        'usuario@email.com',
        '123456',
        'nuevoPassword123'
      );
    });

    it('debe lanzar error cuando el username está vacío', async () => {
      await expect(
        useCase.completarRecuperacionPassword('', '123456', 'nuevoPassword123')
      ).rejects.toThrow('Username es requerido');
      expect(mockRepository.completarRecuperacionPassword).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el código de verificación no tiene 6 dígitos', async () => {
      await expect(
        useCase.completarRecuperacionPassword('usuario@email.com', '12345', 'nuevoPassword123')
      ).rejects.toThrow('Código de verificación inválido');
      expect(mockRepository.completarRecuperacionPassword).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el código de verificación tiene más de 6 dígitos', async () => {
      await expect(
        useCase.completarRecuperacionPassword('usuario@email.com', '1234567', 'nuevoPassword123')
      ).rejects.toThrow('Código de verificación inválido');
      expect(mockRepository.completarRecuperacionPassword).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el nuevo password tiene menos de 8 caracteres', async () => {
      await expect(
        useCase.completarRecuperacionPassword('usuario@email.com', '123456', '1234567')
      ).rejects.toThrow('El nuevo password debe tener al menos 8 caracteres');
      expect(mockRepository.completarRecuperacionPassword).not.toHaveBeenCalled();
    });

    it('debe retornar null cuando el código es inválido o expiró', async () => {
      mockRepository.completarRecuperacionPassword.mockResolvedValue(null);

      const result = await useCase.completarRecuperacionPassword(
        'usuario@email.com',
        '999999',
        'nuevoPassword123'
      );

      expect(result).toBeNull();
    });
  });

  describe('bloquear', () => {
    it('debe bloquear usuario correctamente', async () => {
      const blockedClbnc: ClbncEntity = {
        ...mockClbnc,
        clbnc_ctr_activ: false,
        clbnc_tok_sesio: null,
      };

      mockRepository.bloquear.mockResolvedValue(blockedClbnc);

      const result = await useCase.bloquear(1, 'Por intentos fallidos');

      expect(result).toEqual(blockedClbnc);
      expect(mockRepository.bloquear).toHaveBeenCalledWith(1, 'Por intentos fallidos');
    });

    it('debe lanzar error cuando el ID es inválido', async () => {
      await expect(useCase.bloquear(0, 'Motivo')).rejects.toThrow('ID inválido');
      expect(mockRepository.bloquear).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el motivo está vacío', async () => {
      await expect(useCase.bloquear(1, '')).rejects.toThrow('Motivo del bloqueo es requerido');
      expect(mockRepository.bloquear).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el motivo es solo espacios', async () => {
      await expect(useCase.bloquear(1, '   ')).rejects.toThrow('Motivo del bloqueo es requerido');
      expect(mockRepository.bloquear).not.toHaveBeenCalled();
    });
  });

  describe('desbloquear', () => {
    it('debe desbloquear usuario correctamente', async () => {
      const unblockedClbnc: ClbncEntity = {
        ...mockClbnc,
        clbnc_ctr_activ: true,
      };

      mockRepository.desbloquear.mockResolvedValue(unblockedClbnc);

      const result = await useCase.desbloquear(1);

      expect(result).toEqual(unblockedClbnc);
      expect(mockRepository.desbloquear).toHaveBeenCalledWith(1);
    });

    it('debe lanzar error cuando el ID es inválido', async () => {
      await expect(useCase.desbloquear(0)).rejects.toThrow('ID inválido');
      expect(mockRepository.desbloquear).not.toHaveBeenCalled();
    });
  });

  describe('verificarTokenSesion', () => {
    it('debe retornar usuario cuando el token es válido', async () => {
      const clbncConToken: ClbncEntity = {
        ...mockClbnc,
        clbnc_tok_sesio: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
      };

      mockRepository.verificarTokenSesion.mockResolvedValue(clbncConToken);

      const result = await useCase.verificarTokenSesion('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6');

      expect(result).toEqual(clbncConToken);
      expect(mockRepository.verificarTokenSesion).toHaveBeenCalledWith(
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
      );
    });

    it('debe retornar null cuando el token está vacío', async () => {
      const result = await useCase.verificarTokenSesion('');
      expect(result).toBeNull();
      expect(mockRepository.verificarTokenSesion).not.toHaveBeenCalled();
    });

    it('debe retornar null cuando el token es solo espacios', async () => {
      const result = await useCase.verificarTokenSesion('   ');
      expect(result).toBeNull();
      expect(mockRepository.verificarTokenSesion).not.toHaveBeenCalled();
    });

    it('debe retornar null cuando el token es inválido', async () => {
      mockRepository.verificarTokenSesion.mockResolvedValue(null);

      const result = await useCase.verificarTokenSesion('tokeninvalido');

      expect(result).toBeNull();
    });
  });
});
