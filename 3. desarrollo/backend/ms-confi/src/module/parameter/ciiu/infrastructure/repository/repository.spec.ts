import { Test, TestingModule } from '@nestjs/testing';
import { CiiuDBRepository } from './repository';
import { PgService } from 'src/common/database/pg.config';
import {
  SeccionEntity,
  ActividadEntity,
  ActividadCompletaEntity,
  ArbolCiiuEntity,
} from '../../domain/entity';
import { CiiuEnum } from '../enum/enum';

describe('CiiuDBRepository', () => {
  let repository: CiiuDBRepository;
  let mockPgService: jest.Mocked<PgService>;

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
    mockPgService = {
      queryList: jest.fn(),
      queryGet: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CiiuDBRepository,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    repository = module.get<CiiuDBRepository>(CiiuDBRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Secciones', () => {
    describe('findAllSecciones', () => {
      it('debe retornar todas las secciones activas', async () => {
        const secciones = [mockSeccion];
        mockPgService.queryList.mockResolvedValue(secciones);

        const result = await repository.findAllSecciones();

        expect(result).toHaveLength(1);
        expect(result[0].cisec_abr_cisec).toBe('A');
        expect(mockPgService.queryList).toHaveBeenCalled();
      });

      it('debe retornar todas las secciones sin filtro', async () => {
        mockPgService.queryList.mockResolvedValue([mockSeccion]);

        const result = await repository.findAllSecciones();

        expect(result).toHaveLength(1);
        expect(mockPgService.queryList).toHaveBeenCalled();
      });
    });

    describe('findSeccionById', () => {
      it('debe retornar una sección por ID', async () => {
        mockPgService.queryGet.mockResolvedValue(mockSeccion);

        const result = await repository.findSeccionById(1);

        expect(result).not.toBeNull();
        expect(result?.cisec_cod_cisec).toBe(1);
        expect(mockPgService.queryGet).toHaveBeenCalled();
      });

      it('debe retornar null si no encuentra la sección', async () => {
        mockPgService.queryGet.mockResolvedValue(null);

        const result = await repository.findSeccionById(999);

        expect(result).toBeNull();
      });
    });

    describe('createSeccion', () => {
      it('debe crear una sección correctamente', async () => {
        const newSeccion: SeccionEntity = {
          cisec_abr_cisec: 'A',
          cisec_des_cisec: 'Agricultura',
        };

        mockPgService.create.mockResolvedValue(mockSeccion);

        const result = await repository.createSeccion(newSeccion);

        expect(result).not.toBeNull();
        expect(mockPgService.create).toHaveBeenCalledWith(
          CiiuEnum.table.cisec,
          expect.objectContaining({
            cisec_abr_cisec: 'A',
            cisec_des_cisec: 'Agricultura',
          })
        );
      });
    });
  });

  describe('Búsqueda de Actividades', () => {
    describe('searchActividades', () => {
      it('debe buscar actividades por query', async () => {
        const actividades = [mockActividadCompleta];
        mockPgService.queryList.mockResolvedValue(actividades);

        const result = await repository.searchActividades('maiz', 20);

        expect(result).toHaveLength(1);
        expect(result[0].ciact_des_ciact).toContain('maíz');
        expect(mockPgService.queryList).toHaveBeenCalled();
      });

      it('debe retornar array vacío si no hay resultados', async () => {
        mockPgService.queryList.mockResolvedValue([]);

        const result = await repository.searchActividades('xyz123', 20);

        expect(result).toEqual([]);
      });
    });

    describe('findActividadCompleta', () => {
      it('debe retornar actividad completa con jerarquía', async () => {
        mockPgService.queryGet.mockResolvedValue(mockActividadCompleta);

        const result = await repository.findActividadCompleta(1);

        expect(result).not.toBeNull();
        expect(result?.ciact_cod_ciact).toBe(1);
        expect(result?.cisec_abr_cisec).toBe('A');
        expect(mockPgService.queryGet).toHaveBeenCalled();
      });
    });
  });

  describe('Árbol', () => {
    describe('findArbolCompleto', () => {
      it('debe retornar el árbol completo', async () => {
        const arbolData: any[] = [
          {
            id_pk: 1,
            code: 'A',
            name: 'Agricultura',
            level: 1,
            parent_id_pk: null,
          },
        ];
        mockPgService.queryList.mockResolvedValue(arbolData);

        const result = await repository.findArbolCompleto();

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(mockPgService.queryList).toHaveBeenCalledWith(
          expect.stringContaining('vw_ciiu_arbol'),
          []
        );
      });
    });
  });
});

