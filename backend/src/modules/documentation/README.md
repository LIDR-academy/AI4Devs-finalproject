# Módulo de Documentación Intraoperatoria

Este módulo proporciona documentación en tiempo real durante procedimientos quirúrgicos usando WebSockets para sincronización en tiempo real entre múltiples usuarios.

La tabla `documentations` se crea con la migración `1738612900000-CreateDocumentationsTable`. Ejecutar `npm run migration:run` desde el backend si la tabla no existe.

## Características

- **Documentación en tiempo real**: Sincronización instantánea entre múltiples usuarios
- **Auto-guardado**: Guardado automático de cambios cada 2 segundos
- **Historial de cambios**: Registro completo de todas las modificaciones
- **Dictado por voz**: Soporte para reconocimiento de voz usando Web Speech API
- **Tres fases**: Preoperatorio, Intraoperatorio y Postoperatorio
- **Detalles del procedimiento**: Registro de anestesia, pérdida de sangre, signos vitales, medicamentos

## Entidad

### Documentation

- `id`: UUID único
- `surgeryId`: ID de la cirugía asociada
- `preoperativeNotes`: Notas preoperatorias
- `intraoperativeNotes`: Notas intraoperatorias
- `postoperativeNotes`: Notas postoperatorias
- `procedureDetails`: Detalles del procedimiento (JSONB)
  - `startTime`, `endTime`, `duration`
  - `anesthesiaType`
  - `complications`
  - `bloodLoss`
  - `vitalSigns[]`
  - `medications[]`
- `status`: Estado (draft, in_progress, completed, archived)
- `changeHistory`: Historial de cambios (JSONB)
- `lastSavedAt`: Última vez que se guardó

## Endpoints REST

### Crear Documentación
```
POST /api/v1/documentation
Body: CreateDocumentationDto
Roles: cirujano, enfermeria, administrador
```

### Obtener por Cirugía
```
GET /api/v1/documentation/surgery/:surgeryId
Roles: cirujano, enfermeria, administrador
```

### Actualizar Documentación
```
PUT /api/v1/documentation/:id
Body: UpdateDocumentationDto
Roles: cirujano, enfermeria, administrador
```

### Obtener Historial
```
GET /api/v1/documentation/:id/history
Roles: cirujano, enfermeria, administrador
```

### Completar Documentación
```
PUT /api/v1/documentation/:id/complete
Roles: cirujano, administrador
```

## WebSocket Events

### Namespace: `/documentation`

### Cliente → Servidor

**`join-surgery`**
```json
{
  "surgeryId": "uuid",
  "userId": "uuid"
}
```

**`leave-surgery`**
```json
{
  "surgeryId": "uuid"
}
```

**`update-field`**
```json
{
  "documentationId": "uuid",
  "field": "intraoperativeNotes",
  "value": "texto actualizado",
  "userId": "uuid"
}
```

**`auto-save`**
```json
{
  "documentationId": "uuid",
  "data": {
    "intraoperativeNotes": "texto..."
  }
}
```

**`typing`**
```json
{
  "userId": "uuid",
  "field": "intraoperativeNotes",
  "isTyping": true
}
```

### Servidor → Cliente

**`field-updated`**
```json
{
  "documentationId": "uuid",
  "field": "intraoperativeNotes",
  "value": "texto actualizado",
  "userId": "uuid",
  "timestamp": "2024-01-27T10:00:00Z",
  "lastSavedAt": "2024-01-27T10:00:00Z"
}
```

**`user-joined`**
```json
{
  "userId": "uuid",
  "socketId": "socket-id",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

**`user-typing`**
```json
{
  "userId": "uuid",
  "field": "intraoperativeNotes",
  "isTyping": true,
  "timestamp": "2024-01-27T10:00:00Z"
}
```

**`auto-saved`**
```json
{
  "documentationId": "uuid",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

## Frontend

### Hook: `useDocumentation`

Hook personalizado para gestionar documentación con WebSockets.

```typescript
const {
  documentation,
  isLoading,
  isConnected,
  isTyping,
  lastSavedAt,
  updateField,
  autoSave,
  updateMutation,
} = useDocumentation({ surgeryId, autoConnect: true });
```

### Componente: `DocumentationEditor`

Componente principal para editar documentación con:
- Tabs para preoperatorio, intraoperatorio, postoperatorio
- Indicador de conexión WebSocket
- Indicador de usuario escribiendo
- Botón de dictado por voz (si está disponible)
- Auto-guardado visual

## Dictado por Voz

El componente utiliza Web Speech API para reconocimiento de voz:
- Soporta español (`es-ES`)
- Reconocimiento continuo mientras está activo
- Resultados intermedios y finales
- Solo disponible en navegadores compatibles (Chrome, Edge)

## Uso

1. Acceder desde la página de detalle de cirugía
2. Hacer clic en "Documentación"
3. Seleccionar la fase (Preoperatorio, Intraoperatorio, Postoperatorio)
4. Escribir o usar dictado por voz
5. Los cambios se sincronizan automáticamente con otros usuarios
6. Auto-guardado cada 2 segundos de inactividad

## Notas de Implementación

- Los WebSockets se conectan automáticamente al montar el componente
- El historial de cambios se crea solo para actualizaciones manuales (no auto-guardado)
- La conexión WebSocket se cierra al desmontar el componente
- Si WebSocket falla, se usa HTTP como fallback
- El reconocimiento de voz requiere permisos del navegador
