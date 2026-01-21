import { Test, TestingModule } from '@nestjs/testing';
import { ClienService } from './service';
import { ClienDBRepository } from '../repository/repository';
import { ClienUseCase } from '../../application/usecase';
import { ClienEntity, PersoEntity, ClienParams, PersoParams } from '../../domain/entity';
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

describe('ClienService', () => {
  let service: ClienService;
  let mockRepository: jest.Mocked<ClienDBRepository>;

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
    mockRepository = {
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
      providers: [
        ClienService,
        {
          provide: ClienDBRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClienService>(ClienService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.usecase).toBeDefined();
  });

  // ========== PERSONA ==========

  describe('findAllPersonas', () => {
    it('debe retornar ApiResponses con formato correcto cuando hay datos', async () => {
      const personas = [mockPersona];
      mockRepository.findAllPersonas.mockResolvedValue({ data: personas, total: 1 });

      const result = await service.findAllPersonas();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(personas);
      expect(result.meta.pagination).not.toBeNull();
      expect(result.meta.pagination?.total).toBe(1);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.type).toBe('successful');
      expect(result.meta.information.action).toBe('list');
      expect(result.meta.information.resource).toBe('Persona');
    });

    it('debe retornar 404 cuando no hay datos', async () => {
      mockRepository.findAllPersonas.mockResolvedValue({ data: [], total: 0 });

      await expect(service.findAllPersonas()).rejects.toThrow();
    });
  });

  describe('findPersonaById', () => {
    it('debe retornar ApiResponse con formato correcto cuando encuentra la persona', async () => {
      mockRepository.findPersonaById.mockResolvedValue(mockPersona);

      const result = await service.findPersonaById(1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(mockPersona);
      expect(result.meta.pagination).toBeNull();
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.type).toBe('successful');
      expect(result.meta.information.action).toBe('get');
      expect(result.meta.information.resource).toBe('Persona');
    });

    it('debe retornar 404 cuando no encuentra la persona', async () => {
      mockRepository.findPersonaById.mockResolvedValue(null);

      await expect(service.findPersonaById(999)).rejects.toThrow();
    });
  });

  describe('createPersona', () => {
    it('debe retornar ApiResponse con formato correcto cuando crea exitosamente', async () => {
      mockRepository.createPersona.mockResolvedValue(mockPersona);

      const result = await service.createPersona(mockPersona);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(mockPersona);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.type).toBe('successful');
      expect(result.meta.information.action).toBe('create');
      expect(result.meta.information.resource).toBe('Persona');
    });

    it('debe retornar 500 cuando falla la creación', async () => {
      mockRepository.createPersona.mockResolvedValue(null);

      await expect(service.createPersona(mockPersona)).rejects.toThrow();
    });
  });

  describe('updatePersona', () => {
    it('debe retornar ApiResponse con formato correcto cuando actualiza exitosamente', async () => {
      const updatedPersona = { ...mockPersona, perso_nom_perso: 'JUAN CARLOS PEREZ' };
      // El usecase primero verifica que la persona existe
      mockRepository.findPersonaById.mockResolvedValue(mockPersona);
      // Luego actualiza
      mockRepository.updatePersona.mockResolvedValue(updatedPersona);

      const result = await service.updatePersona(1, updatedPersona);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(updatedPersona);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('update');
    });

    it('debe retornar 404 cuando no encuentra la persona', async () => {
      mockRepository.updatePersona.mockResolvedValue(null);

      await expect(service.updatePersona(999, mockPersona)).rejects.toThrow();
    });
  });

  describe('deletePersona', () => {
    it('debe retornar ApiResponse con formato correcto cuando elimina exitosamente', async () => {
      // El usecase primero verifica que la persona existe
      mockRepository.findPersonaById.mockResolvedValue(mockPersona);
      // Luego elimina
      mockRepository.deletePersona.mockResolvedValue(mockPersona);

      const result = await service.deletePersona(1);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockPersona);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('delete');
    });

    it('debe retornar 404 cuando no encuentra la persona', async () => {
      mockRepository.deletePersona.mockResolvedValue(null);

      await expect(service.deletePersona(999)).rejects.toThrow();
    });
  });

  // ========== CLIENTE ==========

  describe('findAll', () => {
    it('debe retornar ApiResponses con formato correcto cuando hay datos', async () => {
      const clientes = [mockCliente];
      mockRepository.findAll.mockResolvedValue({ data: clientes, total: 1 });

      const result = await service.findAll();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(clientes);
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
    it('debe retornar ApiResponse con formato correcto cuando encuentra el cliente', async () => {
      mockRepository.findById.mockResolvedValue(mockCliente);

      const result = await service.findById(1);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockCliente);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('get');
    });

    it('debe retornar 404 cuando no encuentra el cliente', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('debe retornar ApiResponse con formato correcto cuando crea exitosamente', async () => {
      mockRepository.create.mockResolvedValue(mockCliente);

      const result = await service.create(mockCliente);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockCliente);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('create');
    });

    it('debe retornar 500 cuando falla la creación', async () => {
      mockRepository.create.mockResolvedValue(null);

      await expect(service.create(mockCliente)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('debe retornar ApiResponse con formato correcto cuando actualiza exitosamente', async () => {
      const updatedCliente = { ...mockCliente, clien_ctr_socio: true };
      // El usecase primero verifica que el cliente existe
      mockRepository.findById.mockResolvedValue(mockCliente);
      // Luego actualiza
      mockRepository.update.mockResolvedValue(updatedCliente);

      const result = await service.update(1, updatedCliente);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(updatedCliente);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('update');
    });

    it('debe retornar 404 cuando no encuentra el cliente', async () => {
      mockRepository.update.mockResolvedValue(null);

      await expect(service.update(999, mockCliente)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('debe retornar ApiResponse con formato correcto cuando elimina exitosamente', async () => {
      // El usecase primero verifica que el cliente existe
      mockRepository.findById.mockResolvedValue(mockCliente);
      // Luego elimina
      mockRepository.delete.mockResolvedValue(mockCliente);

      const result = await service.delete(1);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockCliente);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('delete');
    });

    it('debe retornar 404 cuando no encuentra el cliente', async () => {
      mockRepository.delete.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow();
    });
  });

  // ========== TRANSACCIONES UNIFICADAS ==========

  describe('registrarClienteCompleto', () => {
    it('debe retornar ApiResponse con formato correcto cuando registra exitosamente', async () => {
      const mockResult = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: {} as any,
        actividadEconomica: {} as any,
      };
      mockRepository.registrarClienteCompleto.mockResolvedValue(mockResult);

      const result = await service.registrarClienteCompleto(
        mockPersona,
        mockCliente,
        {} as any,
        {} as any
      );

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockResult);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('create');
      expect(result.meta.information.resource).toBe('Cliente Completo');
    });
  });

  describe('findClienteCompletoById', () => {
    it('debe retornar ApiResponse con formato correcto cuando encuentra el cliente completo', async () => {
      const mockResult = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: null,
        actividadEconomica: null,
        representante: null,
        conyuge: null,
        informacionLaboral: null,
        referencias: [],
        informacionFinanciera: [],
        usuarioBancaDigital: null,
        beneficiarios: [],
        residenciaFiscal: null,
        asamblea: null,
        calculosFinancieros: {
          capacidadPago: 0,
          patrimonio: 0,
          totalIngresos: 0,
          totalGastos: 0,
          totalActivos: 0,
          totalPasivos: 0,
        },
      };
      mockRepository.findClienteCompletoById.mockResolvedValue(mockResult);

      const result = await service.findClienteCompletoById(1);

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockResult);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('get');
      expect(result.meta.information.resource).toBe('Cliente Completo');
    });

    it('debe retornar 404 cuando no encuentra el cliente', async () => {
      mockRepository.findClienteCompletoById.mockResolvedValue(null);

      await expect(service.findClienteCompletoById(999)).rejects.toThrow();
    });
  });

  describe('actualizarClienteCompleto', () => {
    it('debe retornar ApiResponse con formato correcto cuando actualiza exitosamente', async () => {
      const mockResult = {
        persona: mockPersona,
        cliente: mockCliente,
        domicilio: {} as any,
        actividadEconomica: {} as any,
      };
      // El usecase primero verifica que el cliente existe
      mockRepository.findById.mockResolvedValue(mockCliente);
      // Luego verifica que la persona existe
      mockRepository.findPersonaById.mockResolvedValue(mockPersona);
      // Finalmente actualiza
      mockRepository.actualizarClienteCompleto.mockResolvedValue(mockResult);

      const result = await service.actualizarClienteCompleto(
        1,
        mockPersona,
        mockCliente,
        {} as any,
        {} as any
      );

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockResult);
      expect(result.meta.status).toBe(200);
      expect(result.meta.information.action).toBe('update');
      expect(result.meta.information.resource).toBe('Cliente Completo');
    });
  });

  // ========== ESTRUCTURA DE RESPUESTAS ==========

  describe('Estructura de ApiResponse', () => {
    it('debe tener la estructura correcta de ApiResponse', async () => {
      mockRepository.findPersonaById.mockResolvedValue(mockPersona);

      const result = await service.findPersonaById(1);

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
      const personas = [mockPersona];
      mockRepository.findAllPersonas.mockResolvedValue({ data: personas, total: 1 });

      const result = await service.findAllPersonas();

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
