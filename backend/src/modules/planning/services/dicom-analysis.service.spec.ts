import { Test, TestingModule } from '@nestjs/testing';
import { DicomAnalysisService } from './dicom-analysis.service';
import { OrthancService } from '../../integration/services/orthanc.service';

describe('DicomAnalysisService', () => {
  let service: DicomAnalysisService;
  let orthancService: OrthancService;

  const mockSeries = {
    MainDicomTags: {
      Modality: 'CT',
      SeriesDate: '2025-01-15',
      SeriesDescription: 'Abdomen',
    },
  };

  const mockInstances = [
    { ID: 'inst-1', Type: 'Instance' },
    { ID: 'inst-2', Type: 'Instance' },
  ];

  beforeEach(async () => {
    const mockOrthancService = {
      getSeries: jest.fn(),
      getSeriesInstances: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DicomAnalysisService,
        { provide: OrthancService, useValue: mockOrthancService },
      ],
    }).compile();

    service = module.get<DicomAnalysisService>(DicomAnalysisService);
    orthancService = module.get<OrthancService>(OrthancService);
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeDicomSeries', () => {
    it('debería devolver análisis con mediciones y metadatos cuando Orthanc responde', async () => {
      (orthancService.getSeries as jest.Mock).mockResolvedValue(mockSeries);
      (orthancService.getSeriesInstances as jest.Mock).mockResolvedValue(mockInstances);

      const result = await service.analyzeDicomSeries('series-123');

      expect(result.metadata.modality).toBe('CT');
      expect(result.metadata.studyDate).toBe('2025-01-15');
      expect(result.measurements.instanceCount).toBe(2);
      expect(result.measurements.estimatedVolume).toBeDefined();
      expect(result.structures).toBeDefined();
      expect(Array.isArray(result.structures)).toBe(true);
      expect(result.findings).toBeDefined();
      expect(Array.isArray(result.findings)).toBe(true);
    });

    it('debería devolver análisis con datos por defecto cuando Orthanc falla', async () => {
      (orthancService.getSeries as jest.Mock).mockRejectedValue(new Error('Orthanc no disponible'));
      (orthancService.getSeriesInstances as jest.Mock).mockRejectedValue(new Error('Orthanc no disponible'));

      const result = await service.analyzeDicomSeries('series-456');

      expect(result.metadata.modality).toBe('UNKNOWN');
      expect(result.measurements.instanceCount).toBe(0);
      expect(result.structures).toEqual([]);
      expect(result.findings).toEqual([]);
    });
  });

  describe('generate3DReconstructionData', () => {
    it('debería devolver vértices, caras, normales y metadata', async () => {
      (orthancService.getSeries as jest.Mock).mockResolvedValue(mockSeries);
      (orthancService.getSeriesInstances as jest.Mock).mockResolvedValue(mockInstances);

      const result = await service.generate3DReconstructionData('series-789');

      expect(result.vertices).toBeDefined();
      expect(Array.isArray(result.vertices)).toBe(true);
      expect(result.faces).toBeDefined();
      expect(result.normals).toBeDefined();
      expect(result.metadata.bounds).toBeDefined();
      expect(result.metadata.center).toBeDefined();
      expect(result.metadata.scale).toBe(1);
    });
  });

  describe('calculateDistance', () => {
    it('debería calcular distancia euclidiana entre dos puntos', () => {
      const d = service.calculateDistance([0, 0, 0], [3, 4, 0]);
      expect(d).toBe(5);
    });
  });

  describe('identifyRiskZones', () => {
    it('debería filtrar estructuras críticas o con nombre arteria', () => {
      const structures = [
        { name: 'Arteria femoral', coordinates: [[0, 0, 0]], type: 'vessel' },
        { name: 'Nervio', coordinates: [[1, 1, 1]], type: 'critical' },
        { name: 'Hueso', coordinates: [[2, 2, 2]], type: 'bone' },
      ];
      const zones = service.identifyRiskZones(structures as any);
      expect(zones).toHaveLength(2);
      expect(zones[0].name).toContain('Arteria femoral');
      expect(zones[1].riskLevel).toBe('critical');
    });
  });
});
