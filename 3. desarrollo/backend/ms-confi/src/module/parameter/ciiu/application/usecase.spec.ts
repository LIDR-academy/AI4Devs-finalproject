import { Test, TestingModule } from '@nestjs/testing';
import { CiiuUseCase } from './usecase';
import { CIIU_REPOSITORY } from '../domain/port';
import {
  SeccionEntity,
  DivisionEntity,
  GrupoEntity,
  ClaseEntity,
  SubclaseEntity,
  ActividadEntity,
  ActividadCompletaEntity,
  ArbolCiiuEntity,
} from '../domain/entity';
import { CiiuPort } from '../domain/port';

describe('CiiuUseCase', () => {
  let useCase: CiiuUseCase;
  let mockRepository: jest.Mocked<CiiuPort>;

  const mockSeccion: SeccionEntity = {
    cisec_cod_cisec: 1,
    cisec_abr_cisec: 'A',
    cisec_des_cisec: 'Agricultura, ganadería, silvicultura y pesca',
  };

  const mockDivision: DivisionEntity = {
    cidiv_cod_cidiv: 1,
    cidiv_cod_cisec: 1,
    cidiv_abr_cidiv: 'A01',
    cidiv_des_cidiv: 'Cultivo de productos no perennes',
  };

  const mockActividad: ActividadEntity = {
    ciact_cod_ciact: 1,
    ciact_cod_cisub: 1,
    ciact_cod_semaf: 0,
    ciact_abr_ciact: 'A011112',
    ciact_des_ciact: 'Cultivo de maíz',
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
    // Crear mock del repositorio
    mockRepository = {
      // Secciones
      findAllSecciones: jest.fn(),
      findSeccionById: jest.fn(),
      findSeccionByAbr: jest.fn(),
      createSeccion: jest.fn(),
      updateSeccion: jest.fn(),
      deleteSeccion: jest.fn(),
      // Divisiones
      findAllDivisiones: jest.fn(),
      findDivisionesBySeccion: jest.fn(),
      findDivisionById: jest.fn(),
      createDivision: jest.fn(),
      updateDivision: jest.fn(),
      deleteDivision: jest.fn(),
      // Grupos
      findAllGrupos: jest.fn(),
      findGruposByDivision: jest.fn(),
      findGrupoById: jest.fn(),
      createGrupo: jest.fn(),
      updateGrupo: jest.fn(),
      deleteGrupo: jest.fn(),
      // Clases
      findAllClases: jest.fn(),
      findClasesByGrupo: jest.fn(),
      findClaseById: jest.fn(),
      createClase: jest.fn(),
      updateClase: jest.fn(),
      deleteClase: jest.fn(),
      // Subclases
      findAllSubclases: jest.fn(),
      findSubclasesByClase: jest.fn(),
      findSubclaseById: jest.fn(),
      createSubclase: jest.fn(),
      updateSubclase: jest.fn(),
      deleteSubclase: jest.fn(),
      // Actividades
      findAllActividades: jest.fn(),
      findActividadesBySubclase: jest.fn(),
      findActividadById: jest.fn(),
      createActividad: jest.fn(),
      updateActividad: jest.fn(),
      deleteActividad: jest.fn(),
      // Búsqueda
      searchActividades: jest.fn(),
      findActividadCompleta: jest.fn(),
      findActividadCompletaByAbr: jest.fn(),
      // Árbol
      findArbolCompleto: jest.fn(),
      findHijosByNivel: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CiiuUseCase,
        {
          provide: CIIU_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CiiuUseCase>(CiiuUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('Secciones', () => {
    describe('createSeccion', () => {
      it('debe crear una sección correctamente', async () => {
        const newSeccion: SeccionEntity = {
          cisec_abr_cisec: 'A',
          cisec_des_cisec: 'Agricultura',
        };

        mockRepository.createSeccion.mockResolvedValue(mockSeccion);

        const result = await useCase.createSeccion(newSeccion);

        expect(result).toEqual(mockSeccion);
        expect(mockRepository.createSeccion).toHaveBeenCalledWith(
          expect.objectContaining({
            cisec_abr_cisec: 'A',
            cisec_des_cisec: 'Agricultura',
          })
        );
      });

      it('debe normalizar los datos antes de crear', async () => {
        const newSeccion: SeccionEntity = {
          cisec_abr_cisec: '  a  ',
          cisec_des_cisec: '  Agricultura  ',
        };

        mockRepository.createSeccion.mockResolvedValue(mockSeccion);

        await useCase.createSeccion(newSeccion);

        expect(mockRepository.createSeccion).toHaveBeenCalledWith(
          expect.objectContaining({
            cisec_abr_cisec: 'A', // Trim y toUpperCase aplicado
            cisec_des_cisec: 'Agricultura', // Trim aplicado
          })
        );
      });
    });

    describe('findAllSecciones', () => {
      it('debe retornar todas las secciones', async () => {
        const secciones = [mockSeccion];
        mockRepository.findAllSecciones.mockResolvedValue(secciones);

        const result = await useCase.findAllSecciones();

        expect(result).toEqual(secciones);
        expect(mockRepository.findAllSecciones).toHaveBeenCalled();
      });
    });

    describe('findSeccionById', () => {
      it('debe retornar una sección por ID', async () => {
        mockRepository.findSeccionById.mockResolvedValue(mockSeccion);

        const result = await useCase.findSeccionById(1);

        expect(result).toEqual(mockSeccion);
        expect(mockRepository.findSeccionById).toHaveBeenCalledWith(1);
      });

      it('debe retornar null si no encuentra la sección', async () => {
        mockRepository.findSeccionById.mockResolvedValue(null);

        const result = await useCase.findSeccionById(999);

        expect(result).toBeNull();
      });
    });
  });

  describe('Actividades', () => {
    describe('searchActividades', () => {
      it('debe buscar actividades por query', async () => {
        const actividades = [mockActividadCompleta];
        mockRepository.searchActividades.mockResolvedValue(actividades);

        const result = await useCase.searchActividades('maiz', 20);

        expect(result).toEqual(actividades);
        expect(mockRepository.searchActividades).toHaveBeenCalledWith('maiz', 20);
      });

      it('debe retornar array vacío si query está vacío', async () => {
        const result = await useCase.searchActividades('', 20);

        expect(result).toEqual([]);
        expect(mockRepository.searchActividades).not.toHaveBeenCalled();
      });

      it('debe buscar actividades si query tiene al menos 1 carácter', async () => {
        const actividades = [mockActividadCompleta];
        mockRepository.searchActividades.mockResolvedValue(actividades);

        const result = await useCase.searchActividades('ab', 20);

        expect(result).toEqual(actividades);
        expect(mockRepository.searchActividades).toHaveBeenCalledWith('ab', 20);
      });

      it('debe limitar el número de resultados a 50', async () => {
        mockRepository.searchActividades.mockResolvedValue([]);

        await useCase.searchActividades('maiz', 100);

        expect(mockRepository.searchActividades).toHaveBeenCalledWith('maiz', 50);
      });
    });

    describe('findActividadCompleta', () => {
      it('debe retornar actividad completa por ID', async () => {
        mockRepository.findActividadCompleta.mockResolvedValue(mockActividadCompleta);

        const result = await useCase.findActividadCompleta(1);

        expect(result).toEqual(mockActividadCompleta);
        expect(mockRepository.findActividadCompleta).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Árbol', () => {
    describe('findArbolCompleto', () => {
      it('debe retornar el árbol completo', async () => {
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

        const result = await useCase.findArbolCompleto();

        expect(result).toEqual(arbol);
        expect(mockRepository.findArbolCompleto).toHaveBeenCalled();
      });
    });
  });
});

