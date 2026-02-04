# Sistema de Auditoría

Este módulo implementa un sistema completo de auditoría para cumplimiento normativo (GDPR/LOPD) y trazabilidad de acciones en el sistema.

## Características

- **Registro automático**: Todas las acciones (CREATE, UPDATE, DELETE, VIEW) se registran automáticamente mediante un interceptor global
- **Trazabilidad completa**: Registra quién, qué, cuándo y desde dónde se realizó cada acción
- **Cumplimiento GDPR**: Endpoints para exportación de datos, anonimización y derecho al olvido
- **Consultas optimizadas**: Índices en base de datos para búsquedas rápidas
- **Retención de datos**: Funcionalidad para limpiar logs antiguos según políticas de retención

## Entidad AuditLog

```typescript
{
  id: UUID;
  userId: UUID;           // ID del usuario que realizó la acción
  action: AuditAction;    // CREATE, UPDATE, DELETE, VIEW, EXPORT, LOGIN, LOGOUT
  entityType: string;     // Tipo de entidad (Patient, Surgery, etc.)
  entityId: UUID;         // ID de la entidad afectada
  changes: JSONB;         // Cambios antes/después y metadata
  ipAddress: string;      // IP desde donde se realizó la acción
  userAgent: string;      // User agent del cliente
  endpoint: string;       // Endpoint accedido
  method: string;         // Método HTTP
  createdAt: Date;        // Timestamp de la acción
}
```

## Endpoints

### Consultar logs
```
GET /api/v1/audit/logs
Query params: userId, action, entityType, entityId, startDate, endDate, limit, offset
Roles: administrador, cirujano
```

### Obtener log específico
```
GET /api/v1/audit/logs/:id
Roles: administrador, cirujano
```

### Logs de un usuario
```
GET /api/v1/audit/user/:userId
Roles: administrador
```

### Exportar datos (GDPR)
```
POST /api/v1/audit/gdpr/export
Body: { userId, startDate?, endDate? }
Roles: administrador
```

### Anonimizar logs (GDPR)
```
POST /api/v1/audit/gdpr/anonymize/:userId
Roles: administrador
Descripción: Anonimiza logs manteniendo trazabilidad (recomendado)
```

### Eliminar logs completamente (GDPR)
```
POST /api/v1/audit/gdpr/delete/:userId
Roles: administrador
Descripción: Elimina permanentemente todos los logs (irreversible)
⚠️ ADVERTENCIA: Solo usar cuando no hay obligaciones legales de retención
```

### Estadísticas
```
GET /api/v1/audit/statistics?days=30
Roles: administrador
```

### Limpiar logs antiguos
```
POST /api/v1/audit/cleanup?retentionDays=2555
Roles: administrador
```

## Uso

El sistema funciona automáticamente mediante el `AuditInterceptor` que está registrado globalmente. No se requiere configuración adicional.

### Excepciones

Los siguientes endpoints están excluidos del logging automático para evitar loops:
- `/health`
- `/api/v1/audit/*`
- `/api/v1/auth/login`
- `/api/v1/auth/refresh`

## Índices

La entidad incluye los siguientes índices para optimizar consultas:
- `(userId, createdAt)` - Búsquedas por usuario y fecha
- `(entityType, entityId)` - Búsquedas por entidad
- `createdAt` - Consultas temporales
- `(action, createdAt)` - Filtros por tipo de acción

## Retención de Datos

Por defecto, los logs se retienen por 7 años (2555 días). Puede ajustarse mediante el endpoint de cleanup.

## Cumplimiento GDPR/LOPD

El sistema implementa los siguientes derechos según el Reglamento General de Protección de Datos (GDPR) y la Ley Orgánica de Protección de Datos (LOPD):

### Derechos del Usuario Implementados

#### 1. **Derecho de Acceso (Art. 15 GDPR)**
Permite a los usuarios obtener una copia de todos sus datos personales almacenados en el sistema.

**Endpoint**: `POST /api/v1/audit/gdpr/export`
```json
{
  "userId": "uuid-del-usuario",
  "startDate": "2024-01-01T00:00:00Z",  // Opcional
  "endDate": "2024-12-31T23:59:59Z"     // Opcional
}
```

**Respuesta**: Incluye todos los logs de auditoría del usuario con un resumen estadístico.

#### 2. **Derecho al Olvido / Eliminación (Art. 17 GDPR)**
Permite eliminar o anonimizar los datos personales de un usuario.

**Opciones disponibles**:

- **Anonimización** (recomendado para mantener trazabilidad):
  - Endpoint: `POST /api/v1/audit/gdpr/anonymize/:userId`
  - Acción: Reemplaza el `userId` con un UUID de anonimización, elimina IP, userAgent y datos sensibles del campo `changes`
  - Uso: Mantiene la trazabilidad para auditoría mientras protege la privacidad

- **Eliminación completa**:
  - Endpoint: `POST /api/v1/audit/gdpr/delete/:userId`
  - Acción: Elimina permanentemente todos los logs del usuario
  - Uso: Solo cuando no se requiere mantener trazabilidad por razones legales

#### 3. **Derecho de Rectificación (Art. 16 GDPR)**
Los usuarios pueden solicitar la corrección de datos incorrectos. Los cambios se registran automáticamente en el log de auditoría.

#### 4. **Retención de Datos (Art. 5 GDPR)**
Los datos se retienen solo durante el tiempo necesario para los fines para los que fueron recogidos.

**Endpoint**: `POST /api/v1/audit/cleanup?retentionDays=2555`
- Por defecto: 7 años (2555 días) - ajustable según política de la organización
- Elimina logs más antiguos que el período de retención configurado

### Proceso de Solicitud GDPR

1. **Solicitud del Usuario**: El usuario solicita acceso o eliminación de sus datos
2. **Verificación de Identidad**: El administrador verifica la identidad del solicitante
3. **Procesamiento**:
   - Para exportación: Se genera un archivo con todos los datos del usuario
   - Para eliminación: Se anonimiza o elimina según la política de la organización
4. **Confirmación**: Se notifica al usuario sobre la acción realizada

### Consideraciones Legales

- **Anonimización vs Eliminación**: 
  - La anonimización es preferible cuando se requiere mantener trazabilidad para cumplimiento normativo médico
  - La eliminación completa solo debe usarse cuando no hay obligaciones legales de retención

- **Período de Retención**:
  - Logs médicos: Mínimo 7 años según normativa sanitaria
  - Logs de auditoría: Según política de la organización (recomendado 7 años)

- **Datos Sensibles**:
  - Los campos `ipAddress`, `userAgent` y `changes` se eliminan durante la anonimización
  - El `userId` se reemplaza con un UUID especial de anonimización: `00000000-0000-0000-0000-000000000000`

### Trazabilidad

Aunque se anonimicen o eliminen datos personales, el sistema mantiene:
- Tipo de acción realizada (CREATE, UPDATE, DELETE, etc.)
- Tipo de entidad afectada (Patient, Surgery, etc.)
- Timestamp de la acción
- Endpoint y método HTTP utilizado

Esto permite mantener la integridad del sistema de auditoría mientras se cumple con GDPR.
