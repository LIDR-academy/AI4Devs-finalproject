# Análisis de Imágenes DICOM y Visualización 3D

Este módulo proporciona funcionalidades para analizar imágenes DICOM y generar visualizaciones 3D para planificación quirúrgica.

## Características

- **Análisis de series DICOM**: Extrae información relevante de imágenes médicas
- **Reconstrucción 3D**: Genera datos de geometría 3D desde series DICOM
- **Detección de estructuras**: Identifica estructuras anatómicas comunes
- **Mediciones**: Calcula distancias y volúmenes
- **Identificación de zonas de riesgo**: Detecta áreas críticas para la cirugía

## Servicios

### DicomAnalysisService

Servicio principal para análisis de imágenes DICOM.

#### Métodos

**`analyzeDicomSeries(seriesId: string): Promise<DicomAnalysisResult>`**
- Analiza una serie DICOM y extrae información relevante
- Retorna mediciones, estructuras detectadas y hallazgos

**`generate3DReconstructionData(seriesId: string): Promise<ReconstructionData>`**
- Genera datos de reconstrucción 3D desde una serie DICOM
- Retorna vértices, caras, normales y metadatos para visualización

**`calculateDistance(point1: number[], point2: number[]): number`**
- Calcula distancia euclidiana entre dos puntos 3D

**`identifyRiskZones(structures: Structure[]): RiskZone[]`**
- Identifica zonas de riesgo basadas en estructuras críticas

## Endpoints API

### Analizar Serie DICOM
```
POST /api/v1/planning/dicom/analyze/:seriesId
Roles: cirujano, administrador
```

**Respuesta:**
```json
{
  "measurements": {
    "instanceCount": 100,
    "estimatedVolume": 125000
  },
  "structures": [
    {
      "name": "Hueso",
      "coordinates": [[0, 0, 0], [100, 100, 100]],
      "type": "bone",
      "properties": { "density": 1000 }
    }
  ],
  "findings": ["Serie completa con alta resolución"],
  "metadata": {
    "modality": "CT",
    "studyDate": "2024-01-27",
    "seriesDescription": "Abdomen"
  }
}
```

### Generar Reconstrucción 3D
```
POST /api/v1/planning/dicom/reconstruct-3d/:seriesId
Roles: cirujano, administrador
```

**Respuesta:**
```json
{
  "vertices": [[0, 0, 0], [1, 1, 1], ...],
  "faces": [[0, 1, 2], ...],
  "normals": [[0, 0, 1], ...],
  "metadata": {
    "bounds": {
      "min": [0, 0, 0],
      "max": [512, 512, 100]
    },
    "center": [256, 256, 50],
    "scale": 1.0
  }
}
```

## Integración con Orthanc

El servicio se integra con Orthanc para obtener información de series DICOM. Si Orthanc no está disponible, el servicio continúa con datos por defecto para desarrollo.

## Frontend

El visualizador 3D está implementado en:
- `frontend/src/components/planning/DicomViewer3D.tsx`
- `frontend/src/pages/planning/Planning3DViewer.tsx`

### Características del Visualizador

- Visualización 3D interactiva con Three.js
- Controles de cámara (rotar, zoom, pan)
- Herramientas de medición
- Panel de análisis de resultados
- Integración con API de planificación

### Uso

1. Acceder desde la página de detalle de cirugía
2. Ingresar ID de serie DICOM
3. Hacer clic en "Analizar" para obtener información
4. Hacer clic en "Reconstruir 3D" para generar visualización
5. Usar controles del mouse para interactuar con el modelo 3D

## Notas de Implementación

**En producción**, el análisis de imágenes DICOM debería usar:
- Librerías especializadas de procesamiento de imágenes médicas
- Algoritmos de segmentación para detectar estructuras
- Algoritmos de reconstrucción 3D reales (marching cubes, etc.)
- Integración con servicios de IA para análisis avanzado

La implementación actual proporciona una base funcional que puede extenderse con estas funcionalidades avanzadas.
