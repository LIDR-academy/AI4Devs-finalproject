import { Injectable, Logger } from '@nestjs/common';
import { OrthancService } from '../../integration/services/orthanc.service';

export interface DicomAnalysisResult {
  measurements: {
    distance?: number;
    volume?: number;
    area?: number;
    [key: string]: any;
  };
  structures: {
    name: string;
    coordinates: number[][];
    type: string;
    properties?: {
      density?: number;
      size?: number;
    };
  }[];
  findings: string[];
  metadata: {
    modality: string;
    studyDate: string;
    seriesDescription?: string;
    patientPosition?: string;
  };
}

@Injectable()
export class DicomAnalysisService {
  private readonly logger = new Logger(DicomAnalysisService.name);

  constructor(private readonly orthancService: OrthancService) {}

  /**
   * Analiza una serie DICOM y extrae información relevante
   */
  async analyzeDicomSeries(seriesId: string): Promise<DicomAnalysisResult> {
    try {
      this.logger.log(`Analizando serie DICOM: ${seriesId}`);

      // Obtener información de la serie desde Orthanc
      let series;
      let instances: any[] = [];
      
      try {
        series = await this.orthancService.getSeries(seriesId);
        instances = await this.orthancService.getSeriesInstances(seriesId);
      } catch (error: any) {
        this.logger.warn(`No se pudo obtener serie ${seriesId} de Orthanc: ${error.message}`);
        // Continuar con datos por defecto si Orthanc no está disponible
        series = {
          MainDicomTags: { Modality: 'UNKNOWN', SeriesDate: new Date().toISOString() },
        } as any;
      }

      // Extraer metadatos
      const metadata = {
        modality: series.MainDicomTags?.Modality || 'UNKNOWN',
        studyDate: series.MainDicomTags?.SeriesDate || '',
        seriesDescription: series.MainDicomTags?.SeriesDescription,
        patientPosition: series.MainDicomTags?.PatientPosition,
      };

      // Análisis básico (en producción, esto se haría con librerías especializadas)
      const analysis: DicomAnalysisResult = {
        measurements: {
          instanceCount: instances.length,
          estimatedVolume: this.estimateVolume(instances.length, metadata.modality),
        },
        structures: [],
        findings: [],
        metadata,
      };

      // Detectar estructuras comunes según la modalidad
      if (metadata.modality === 'CT' || metadata.modality === 'MR') {
        analysis.structures = this.detectCommonStructures(metadata.modality);
        analysis.findings = this.analyzeFindings(metadata.modality, instances.length);
      }

      this.logger.log(`Análisis completado para serie ${seriesId}`);
      return analysis;
    } catch (error: any) {
      this.logger.error(`Error analizando serie DICOM ${seriesId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera datos para reconstrucción 3D
   */
  async generate3DReconstructionData(seriesId: string): Promise<{
    vertices: number[][];
    faces: number[][];
    normals: number[][];
    metadata: {
      bounds: { min: number[]; max: number[] };
      center: number[];
      scale: number;
    };
  }> {
    try {
      this.logger.log(`Generando datos de reconstrucción 3D para serie: ${seriesId}`);

      let series;
      let instances: any[] = [];
      
      try {
        series = await this.orthancService.getSeries(seriesId);
        instances = await this.orthancService.getSeriesInstances(seriesId);
      } catch (error: any) {
        this.logger.warn(`No se pudo obtener serie ${seriesId} de Orthanc: ${error.message}`);
        series = {
          MainDicomTags: { Modality: 'UNKNOWN', SeriesDate: new Date().toISOString() },
        } as any;
      }

      // En producción, esto usaría algoritmos de reconstrucción 3D reales
      // Por ahora, generamos datos de ejemplo basados en la serie
      const instanceCount = instances.length;
      const spacing = 1.0; // mm (en producción, se obtendría de los metadatos DICOM)
      const width = 512; // Asumido (en producción, se obtendría de los metadatos)
      const height = 512; // Asumido

      // Generar geometría básica para visualización
      const vertices: number[][] = [];
      const faces: number[][] = [];
      const normals: number[][] = [];

      // Crear una malla básica (ejemplo simplificado)
      for (let z = 0; z < instanceCount; z++) {
        for (let y = 0; y < height; y += 10) {
          for (let x = 0; x < width; x += 10) {
            vertices.push([x * spacing, y * spacing, z * spacing]);
            normals.push([0, 0, 1]);
          }
        }
      }

      // Calcular bounds
      const bounds = {
        min: [0, 0, 0],
        max: [width * spacing, height * spacing, instanceCount * spacing],
      };

      const center = [
        (bounds.max[0] + bounds.min[0]) / 2,
        (bounds.max[1] + bounds.min[1]) / 2,
        (bounds.max[2] + bounds.min[2]) / 2,
      ];

      this.logger.log(`Reconstrucción 3D generada: ${vertices.length} vértices`);
      return {
        vertices,
        faces,
        normals,
        metadata: {
          bounds,
          center,
          scale: spacing,
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Error generando reconstrucción 3D para serie ${seriesId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Estima el volumen basado en el número de instancias y modalidad
   */
  private estimateVolume(instanceCount: number, modality: string): number {
    // Valores estimados (en producción, se calcularían desde los metadatos DICOM reales)
    const sliceThickness = modality === 'CT' ? 1.0 : 2.0; // mm
    const pixelSpacing = 0.5; // mm (asumido)
    const area = 512 * 512 * pixelSpacing * pixelSpacing; // mm²

    return area * sliceThickness * instanceCount; // mm³
  }

  /**
   * Detecta estructuras comunes según la modalidad
   */
  private detectCommonStructures(modality: string): DicomAnalysisResult['structures'] {
    const structures: DicomAnalysisResult['structures'] = [];

    if (modality === 'CT') {
      structures.push(
        {
          name: 'Hueso',
          coordinates: [[0, 0, 0], [100, 100, 100]],
          type: 'bone',
          properties: { density: 1000 },
        },
        {
          name: 'Tejido blando',
          coordinates: [[50, 50, 50], [150, 150, 150]],
          type: 'soft_tissue',
          properties: { density: 40 },
        },
      );
    } else if (modality === 'MR') {
      structures.push({
        name: 'Tejido cerebral',
        coordinates: [[0, 0, 0], [200, 200, 200]],
        type: 'brain_tissue',
        properties: { density: 100 },
      });
    }

    return structures;
  }

  /**
   * Analiza hallazgos en las imágenes
   */
  private analyzeFindings(modality: string, instanceCount: number): string[] {
    const findings: string[] = [];

    if (instanceCount > 100) {
      findings.push('Serie completa con alta resolución');
    }

    if (modality === 'CT') {
      findings.push('Imágenes de tomografía computarizada');
    } else if (modality === 'MR') {
      findings.push('Imágenes de resonancia magnética');
    }

    return findings;
  }

  /**
   * Calcula mediciones entre puntos en el espacio 3D
   */
  calculateDistance(point1: number[], point2: number[]): number {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    const dz = point2[2] - point1[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Identifica zonas de riesgo basadas en estructuras críticas
   */
  identifyRiskZones(structures: DicomAnalysisResult['structures']): {
    name: string;
    coordinates: number[][];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }[] {
    return structures
      .filter((s) => s.type === 'critical' || s.name.toLowerCase().includes('arteria'))
      .map((s) => ({
        name: `Zona de riesgo: ${s.name}`,
        coordinates: s.coordinates,
        riskLevel: s.type === 'critical' ? 'critical' : 'high',
      }));
  }
}
