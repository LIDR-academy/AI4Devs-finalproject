import { Test, TestingModule } from '@nestjs/testing';
import { CiiuService } from './service';
import { CiiuDBRepository } from '../repository/repository';
import { CiiuUseCase } from '../../application/usecase';
import {
  SeccionEntity,
  ActividadEntity,
  ActividadCompletaEntity,
  ArbolCiiuEntity,
} from '../../domain/entity';

describe('CiiuService', () => {
  let service: CiiuService;
  let mockRepository: jest.Mocked<CiiuDBRepository>;

  const mockSeccion: SeccionEntity = {
    cisec_cod_cisec: 1,
    cisec_abr_cisec: 'A',
    cisec_des_cisec: 'Agricultura',
  };

  const mockActividadCompleta: ActividadCompletaEntity = {
    ciact_cod_ciact: 1,
    ciact_abr_ciact: 'A011112',
    ciact_des_ciact: 'Cultivo de maíz',
    ciact_cod_semaf: 0,
    semaf_des_semaf: 'Bajo',
    semaf_ico_semaf: 'check',
    semaf_col_semaf: 'blue',
    cisub_cod_cisub: 1,
    cisub_abr_cisub: 'A01111',
    cisub_des_cisub: 'Cultivo de cereales',
    cicla_cod_cicla: 1,
    cicla_abr_cicla: 'A0111',
    cicla_des_cicla: 'Cultivo de cereales',
    cigru_cod_cigru: 1,
    cigru_abr_cigru: 'A011',
    cigru_des_cigru: 'Cultivo de cereales',
    cidiv_cod_cidiv: 1,
    cidiv_abr_cidiv: 'A01',
    cidiv_des_cidiv: 'Cultivo de productos no perennes',
    cisec_cod_cisec: 1,
    cisec_abr_cisec: 'A',
    cisec_des_cisec: 'Agricultura',
  };

  beforeEach(async () => {
    mockRepository = {
      findAllSecciones: jest.fn(),
      findSeccionById: jest.fn(),
      createSeccion: jest.fn(),
      updateSeccion: jest.fn(),
      deleteSeccion: jest.fn(),
      searchActividades: jest.fn(),
      findActividadCompleta: jest.fn(),
      findActividadCompletaByAbr: jest.fn(),
      findArbolCompleto: jest.fn(),
      findHijosByNivel: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CiiuService,
        {
          provide: CiiuDBRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CiiuService>(CiiuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.usecase).toBeDefined();
  });

  describe('Secciones', () => {
    describe('findAllSecciones', () => {
      it('debe retornar ApiResponses con secciones', async () => {
        const secciones = [mockSeccion];
        mockRepository.findAllSecciones.mockResolvedValue(secciones);

        const result = await service.findAllSecciones();

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('meta');
        expect(result.data).toEqual(secciones);
        expect(result.meta.pagination?.total).toBe(1);
      });
    });

    describe('createSeccion', () => {
      it('debe crear una sección y retornar ApiResponse', async () => {
        mockRepository.createSeccion.mockResolvedValue(mockSeccion);

        const result = await service.createSeccion(mockSeccion);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('meta');
        expect(result.data).toEqual(mockSeccion);
      });

      it('debe lanzar excepción si la creación falla', async () => {
        mockRepository.createSeccion.mockResolvedValue(null);

        await expect(service.createSeccion(mockSeccion)).rejects.toThrow();
      });
    });
  });

  describe('Búsqueda de Actividades', () => {
    describe('searchActividades', () => {
      it('debe retornar ApiResponses con actividades', async () => {
        const actividades = [mockActividadCompleta];
        mockRepository.searchActividades.mockResolvedValue(actividades);

        const result = await service.searchActividades('maiz', 20);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('meta');
        expect(result.data).toEqual(actividades);
        expect(result.meta.pagination?.total).toBe(1);
      });
    });

    describe('findActividadCompleta', () => {
      it('debe retornar ApiResponse con actividad completa', async () => {
        mockRepository.findActividadCompleta.mockResolvedValue(mockActividadCompleta);

        const result = await service.findActividadCompleta(1);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('meta');
        expect(result.data).toEqual(mockActividadCompleta);
      });

      it('debe lanzar excepción si no encuentra la actividad', async () => {
        mockRepository.findActividadCompleta.mockResolvedValue(null);

        await expect(service.findActividadCompleta(999)).rejects.toThrow();
      });
    });
  });

  describe('Árbol', () => {
    describe('findArbolCompleto', () => {
      it('debe retornar ApiResponses con árbol', async () => {
        const arbol: ArbolCiiuEntity[] = [
          {
            id: 1,
            nivel: 1,
            parent_id: null,
            codigo: 'A',
            descripcion: 'Agricultura',
            tipo: 'seccion',
          },
        ];
        mockRepository.findArbolCompleto.mockResolvedValue(arbol);

        const result = await service.findArbolCompleto();

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('meta');
        expect(result.data).toEqual(arbol);
      });
    });
  });
});

