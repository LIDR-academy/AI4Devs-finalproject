import { Test, TestingModule } from '@nestjs/testing';
import { ClbncController } from './controller';
import { ClbncService } from '../../infrastructure/service/service';
import { ClbncEntity } from '../../domain/entity';
import { ApiResponse, ApiResponses } from 'src/shared/util';
import { InformationMessage } from 'src/shared/util';

describe('ClbncController', () => {
  let controller: ClbncController;
  let mockService: jest.Mocked<ClbncService>;

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
    mockService = {
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
      controllers: [ClbncController],
      providers: [
        {
          provide: ClbncService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ClbncController>(ClbncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ========== CRUD ==========

  describe('findAll', () => {
    it('debe retornar ApiResponses con formato correcto', async () => {
      const mockResponse: ApiResponses<ClbncEntity> = {
        data: [mockClbnc],
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'list',
            resource: 'Usuario Banca Digital',
            method: 'findAll',
          }),
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            pageCount: 1,
          },
          error: null,
        },
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ page: 1, pageSize: 20 });

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
      });
      expect(result.meta.status).toBe(200);
    });
  });

  describe('findById', () => {
    it('debe retornar ApiResponse con formato correcto', async () => {
      const mockResponse: ApiResponse<ClbncEntity> = {
        data: mockClbnc,
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'get',
            resource: 'Usuario Banca Digital',
            method: 'findById',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.findById.mockResolvedValue(mockResponse);

      const result = await controller.findById(1);

      expect(mockService.findById).toHaveBeenCalledWith(1);
      expect(result.meta.status).toBe(200);
    });
  });

  describe('create', () => {
    it('debe retornar ApiResponse con código 201', async () => {
      const mockResponse: ApiResponse<ClbncEntity> = {
        data: mockClbnc,
        meta: {
          status: 201,
          information: InformationMessage.success({
            action: 'create',
            resource: 'Usuario Banca Digital',
            method: 'create',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(mockClbnc as any);

      expect(mockService.create).toHaveBeenCalled();
      expect(result.meta.status).toBe(201);
    });
  });

  // ========== AUTENTICACIÓN (APP MÓVIL) ==========

  describe('login', () => {
    it('debe retornar ApiResponse con token de sesión', async () => {
      const mockResponse: ApiResponse<any> = {
        data: {
          usuario: mockClbnc,
          tokenSesion: 'token123',
          clienteId: 1,
        },
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'validator',
            resource: 'Usuario Banca Digital',
            method: 'login',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.login.mockResolvedValue(mockResponse);

      const result = await controller.login({
        username: 'usuario@email.com',
        password: 'password123',
      } as any);

      expect(mockService.login).toHaveBeenCalled();
      expect(result.meta.status).toBe(200);
      expect(result.data.tokenSesion).toBeDefined();
    });
  });

  describe('changePassword', () => {
    it('debe retornar ApiResponse con código 200', async () => {
      const mockResponse: ApiResponse<ClbncEntity> = {
        data: mockClbnc,
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'update',
            resource: 'Usuario Banca Digital',
            method: 'changePassword',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.changePassword.mockResolvedValue(mockResponse);

      const result = await controller.changePassword(1, {
        passwordActual: 'oldPassword',
        passwordNuevo: 'newPassword',
      } as any);

      expect(mockService.changePassword).toHaveBeenCalled();
      expect(result.meta.status).toBe(200);
    });
  });

  describe('iniciarRecuperacionPassword', () => {
    it('debe retornar ApiResponse con código de verificación', async () => {
      const mockResponse: ApiResponse<any> = {
        data: {
          codigoVerificacion: 'ABC123',
          expiraEn: new Date(),
        },
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'validator',
            resource: 'Usuario Banca Digital',
            method: 'iniciarRecuperacionPassword',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.iniciarRecuperacionPassword.mockResolvedValue(mockResponse);

      const result = await controller.iniciarRecuperacionPassword({
        username: 'usuario@email.com',
      } as any);

      expect(mockService.iniciarRecuperacionPassword).toHaveBeenCalled();
      expect(result.meta.status).toBe(200);
      expect(result.data.codigoVerificacion).toBeDefined();
    });
  });
});

