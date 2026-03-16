import { Test, TestingModule } from '@nestjs/testing';
import { ClienController } from './controller';
import { ClienService } from '../../infrastructure/service/service';
import { ClienEntity, PersoEntity } from '../../domain/entity';
import { ApiResponse, ApiResponses } from 'src/shared/util';
import { InformationMessage } from 'src/shared/util';

describe('ClienController', () => {
  let controller: ClienController;
  let mockService: jest.Mocked<ClienService>;

  const mockPersona: PersoEntity = {
    perso_cod_perso: 1,
    perso_cod_tpers: 1,
    perso_cod_tiden: 1,
    perso_ide_perso: '1712345678',
    perso_nom_perso: 'JUAN PEREZ',
    perso_fec_inici: new Date('1990-01-15'),
    perso_cod_sexos: 1,
    perso_cod_nacio: 1,
    perso_cod_instr: 1,
    created_by: 1,
    updated_by: 1,
  };

  const mockCliente: ClienEntity = {
    clien_cod_clien: 1,
    clien_cod_perso: 1,
    clien_cod_ofici: 1,
    clien_ctr_socio: false,
    clien_fec_ingin: new Date('2025-01-01'),
    created_by: 1,
    updated_by: 1,
  };

  beforeEach(async () => {
    mockService = {
      findAllPersonas: jest.fn(),
      findPersonaById: jest.fn(),
      findPersonaByIdentificacion: jest.fn(),
      createPersona: jest.fn(),
      updatePersona: jest.fn(),
      deletePersona: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPersonaId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      registrarClienteCompleto: jest.fn(),
      findClienteCompletoById: jest.fn(),
      actualizarClienteCompleto: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienController],
      providers: [
        {
          provide: ClienService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ClienController>(ClienController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ========== PERSONA ==========

  describe('findAllPersonas', () => {
    it('debe retornar ApiResponses con formato correcto', async () => {
      const mockResponse: ApiResponses<PersoEntity> = {
        data: [mockPersona],
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'list',
            resource: 'Persona',
            method: 'findAllPersonas',
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

      mockService.findAllPersonas.mockResolvedValue(mockResponse);

      const result = await controller.findAllPersonas({ page: 1, pageSize: 20 });

      expect(mockService.findAllPersonas).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
      });
      expect(result).toEqual(mockResponse);
      expect(result.meta.status).toBe(200);
    });
  });

  describe('findPersonaById', () => {
    it('debe retornar ApiResponse con formato correcto', async () => {
      const mockResponse: ApiResponse<PersoEntity> = {
        data: mockPersona,
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'get',
            resource: 'Persona',
            method: 'findPersonaById',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.findPersonaById.mockResolvedValue(mockResponse);

      const result = await controller.findPersonaById(1);

      expect(mockService.findPersonaById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
      expect(result.meta.status).toBe(200);
    });
  });

  describe('createPersona', () => {
    it('debe retornar ApiResponse con código 201', async () => {
      const mockResponse: ApiResponse<PersoEntity> = {
        data: mockPersona,
        meta: {
          status: 201,
          information: InformationMessage.success({
            action: 'create',
            resource: 'Persona',
            method: 'createPersona',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.createPersona.mockResolvedValue(mockResponse);

      const result = await controller.createPersona(mockPersona as any);

      expect(mockService.createPersona).toHaveBeenCalled();
      expect(result.meta.status).toBe(201);
    });
  });

  // ========== CLIENTE ==========

  describe('findAll', () => {
    it('debe retornar ApiResponses con formato correcto', async () => {
      const mockResponse: ApiResponses<ClienEntity> = {
        data: [mockCliente],
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'list',
            resource: 'Cliente',
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

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result.meta.status).toBe(200);
    });
  });

  describe('findById', () => {
    it('debe retornar ApiResponse con formato correcto', async () => {
      const mockResponse: ApiResponse<ClienEntity> = {
        data: mockCliente,
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'get',
            resource: 'Cliente',
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
      const mockResponse: ApiResponse<ClienEntity> = {
        data: mockCliente,
        meta: {
          status: 201,
          information: InformationMessage.success({
            action: 'create',
            resource: 'Cliente',
            method: 'create',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(mockCliente as any);

      expect(mockService.create).toHaveBeenCalled();
      expect(result.meta.status).toBe(201);
    });
  });

  // ========== TRANSACCIONES UNIFICADAS ==========

  describe('registrarClienteCompleto', () => {
    it('debe retornar ApiResponse con código 201', async () => {
      const mockResponse: ApiResponse<any> = {
        data: {
          persona: mockPersona,
          cliente: mockCliente,
        },
        meta: {
          status: 201,
          information: InformationMessage.success({
            action: 'create',
            resource: 'Cliente Completo',
            method: 'registrarClienteCompleto',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.registrarClienteCompleto.mockResolvedValue(mockResponse);

      const result = await controller.registrarClienteCompleto({} as any);

      expect(mockService.registrarClienteCompleto).toHaveBeenCalled();
      expect(result.meta.status).toBe(201);
    });
  });

  describe('findClienteCompletoById', () => {
    it('debe retornar ApiResponse con formato correcto', async () => {
      const mockResponse: ApiResponse<any> = {
        data: {
          persona: mockPersona,
          cliente: mockCliente,
        },
        meta: {
          status: 200,
          information: InformationMessage.success({
            action: 'get',
            resource: 'Cliente Completo',
            method: 'findClienteCompletoById',
          }),
          pagination: null,
          error: null,
        },
      };

      mockService.findClienteCompletoById.mockResolvedValue(mockResponse);

      const result = await controller.findClienteCompletoById(1);

      expect(mockService.findClienteCompletoById).toHaveBeenCalledWith(1);
      expect(result.meta.status).toBe(200);
    });
  });
});

