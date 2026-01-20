# Módulo de Planificación Quirúrgica - Documentación

## Resumen

Se ha implementado el módulo completo de planificación quirúrgica con las siguientes funcionalidades:

### Entidades Creadas

1. **Surgery** (`surgery.entity.ts`)
   - Gestión de cirugías con estados (planned, scheduled, in_progress, completed, cancelled)
   - Tipos de cirugía (elective, urgent, emergency)
   - Asociación con paciente y cirujano
   - Scores de riesgo (ASA, POSSUM, custom)
   - Notas preoperatorias y postoperatorias

2. **SurgicalPlanning** (`surgical-planning.entity.ts`)
   - Planificación preoperatoria con análisis 3D
   - Datos de análisis de imágenes (mediciones, estructuras, hallazgos)
   - Datos de simulación (abordaje, trayectoria, zonas de riesgo)
   - Abordaje quirúrgico seleccionado
   - Referencia a guía 3D generada

3. **DicomImage** (`dicom-image.entity.ts`)
   - Asociación de imágenes DICOM con planificaciones
   - Referencias a instancias en Orthanc
   - Metadatos de imágenes

4. **Checklist** (`checklist.entity.ts`)
   - Checklist WHO completo con tres fases:
     - Pre-Inducción
     - Pre-Incisión
     - Post-Procedimiento
   - Seguimiento de completitud por fase
   - Datos detallados de cada ítem

### Servicios Implementados

1. **PlanningService** (`planning.service.ts`)
   - Crear y gestionar cirugías
   - Crear y actualizar planificaciones quirúrgicas
   - Asociar imágenes DICOM a planificaciones
   - Calcular scores de riesgo
   - Actualizar estados de cirugía

2. **ChecklistService** (`checklist.service.ts`)
   - Crear checklist automáticamente para cirugías
   - Actualizar fases del checklist
   - Marcar/desmarcar ítems individuales
   - Validar completitud de fases

### Endpoints API

#### Cirugías
- `POST /api/v1/planning/surgeries` - Crear nueva cirugía
- `GET /api/v1/planning/surgeries` - Listar cirugías (con filtros)
- `GET /api/v1/planning/surgeries/:id` - Obtener cirugía por ID
- `PUT /api/v1/planning/surgeries/:id/status` - Actualizar estado de cirugía

#### Planificaciones
- `POST /api/v1/planning/plannings` - Crear planificación quirúrgica
- `GET /api/v1/planning/plannings/surgery/:surgeryId` - Obtener planificación por cirugía
- `PUT /api/v1/planning/plannings/:id` - Actualizar planificación
- `GET /api/v1/planning/surgeries/:surgeryId/risk-score` - Calcular score de riesgo

#### Checklist
- `GET /api/v1/planning/surgeries/:surgeryId/checklist` - Obtener checklist
- `POST /api/v1/planning/surgeries/:surgeryId/checklist` - Crear checklist
- `PUT /api/v1/planning/surgeries/:surgeryId/checklist/phase` - Actualizar fase del checklist

### DTOs Creados

1. **CreateSurgeryDto** - Validación para crear cirugías
2. **CreatePlanningDto** - Validación para crear planificaciones
3. **UpdateChecklistDto** - Validación para actualizar checklist

### Características del Checklist WHO

El checklist incluye las tres fases estándar de la OMS:

1. **Pre-Inducción** (5 ítems):
   - Confirmar identidad del paciente
   - Confirmar sitio quirúrgico, procedimiento y consentimiento
   - Verificar marcado del sitio quirúrgico
   - Verificar evaluación de anestesia
   - Verificar pulso oximétro

2. **Pre-Incisión** (6 ítems):
   - Confirmar identidad del paciente
   - Confirmar sitio quirúrgico
   - Confirmar procedimiento
   - Anticipar eventos críticos
   - Revisar alergias conocidas
   - Verificar disponibilidad de sangre

3. **Post-Procedimiento** (4 ítems):
   - Confirmar nombre del procedimiento realizado
   - Verificar conteo de instrumentos, esponjas y agujas
   - Identificar problemas con equipamiento
   - Revisar preocupaciones para recuperación

### Validaciones Implementadas

- ✅ Validación de UUIDs en todos los parámetros de ruta
- ✅ Validación de DTOs con class-validator
- ✅ Verificación de existencia de pacientes antes de crear cirugías
- ✅ Validación de estados de cirugía
- ✅ Validación de fases del checklist

### Integración con Otros Módulos

- ✅ Integración con módulo HCE (Patient)
- ✅ Integración con módulo Integration (OrthancService para imágenes DICOM)
- ✅ Uso de autenticación y autorización (JWT + Roles)

## Próximos Pasos

1. **Reiniciar el backend** para cargar el nuevo módulo
2. **Verificar que las tablas se creen** automáticamente (synchronize: true)
3. **Probar los endpoints** en Swagger:
   - Crear una cirugía
   - Crear una planificación
   - Crear y completar checklist

## Ejemplo de Uso

### 1. Crear Cirugía
```bash
POST /api/v1/planning/surgeries
{
  "patientId": "uuid-del-paciente",
  "procedure": "Colecistectomía laparoscópica",
  "type": "elective",
  "scheduledDate": "2024-02-15T10:00:00Z",
  "riskScores": {
    "asa": 2,
    "possum": 15
  }
}
```

### 2. Crear Planificación
```bash
POST /api/v1/planning/plannings
{
  "surgeryId": "uuid-de-la-cirugia",
  "approachSelected": "Abordaje anterior transperitoneal",
  "analysisData": {
    "measurements": {
      "distance": 5.2,
      "volume": 120.5
    },
    "structures": [
      {
        "name": "Vesícula biliar",
        "coordinates": [[1, 2, 3], [4, 5, 6]],
        "type": "organ"
      }
    ]
  },
  "simulationData": {
    "approach": {
      "entryPoint": [10, 20, 30],
      "direction": [0, 0, 1],
      "angle": 45
    },
    "estimatedDuration": 120
  }
}
```

### 3. Obtener Checklist
```bash
GET /api/v1/planning/surgeries/{surgeryId}/checklist
```

### 4. Actualizar Checklist
```bash
PUT /api/v1/planning/surgeries/{surgeryId}/checklist/phase
{
  "phase": "preInduction",
  "itemId": "pre-1",
  "checked": true,
  "notes": "Verificado por enfermería"
}
```

## Notas Técnicas

- Todas las entidades usan UUIDs como identificadores
- Las relaciones están correctamente definidas con TypeORM
- El checklist se crea automáticamente cuando se solicita si no existe
- Los scores de riesgo son opcionales y pueden calcularse después
- Las imágenes DICOM se asocian por ID de instancia de Orthanc
