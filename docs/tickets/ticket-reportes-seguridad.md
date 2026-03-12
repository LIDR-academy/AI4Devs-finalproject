# Tickets - Reportes y Seguridad

## Índice
- [US-013: Exportación de datos a CSV](#us-013-exportación-de-datos-a-csv)
- [US-014: Cifrado de datos locales](#us-014-cifrado-de-datos-locales)

---

## US-013: Exportación de datos a CSV

### TICKET-013-BE-01: Servicio de exportación a CSV

**Tipo:** Backend - Domain Services  
**Prioridad:** Media  
**Estimación:** 8 puntos  
**Sprint:** 4

#### Descripción
Servicio para generar archivos CSV con datos de asistencias e incidentes según filtros.

#### Tareas técnicas
- [ ] Crear `ExportService` en `domains/export/services/`
  - `exportAttendances(filters): Promise<Buffer>`
    - Filtros: classRoomIds, startDate, endDate
    - Columnas: fecha, niño, aula, hora check-in, estado al llegar, hora check-out, quién recogió, docente responsable
  - `exportIncidents(filters): Promise<Buffer>`
    - Filtros: classRoomIds, childId, startDate, endDate, types, tags
    - Columnas: fecha, niño, aula, categoría, áreas de desarrollo, descripción, visibilidad, docente
- [ ] Implementar generación de CSV con encoding UTF-8:
  - Usar biblioteca `csv-writer` o `papaparse`
  - Headers en español
  - Formato compatible con Excel
- [ ] Validar permisos de exportación:
  - DIRECTOR puede exportar todo
  - TEACHER solo sus aulas asignadas
  - ADMIN puede exportar asistencias
- [ ] Tests unitarios

#### Criterios de aceptación
- CSV se genera correctamente
- Encoding UTF-8 funciona (acentos correctos)
- Formato compatible con Excel
- Headers descriptivos en español
- Permisos validados correctamente
- Tests >80% coverage

#### Dependencias
- TICKET-003-BE-02
- TICKET-009-BE-02
- TICKET-002-BE-03

#### Notas técnicas
- CSV debe usar ; como separador (estándar europeo)
- Incluir BOM (Byte Order Mark) para Excel
- Limitar exportación máxima a 10,000 registros
- Considerar exportación asíncrona si es pesado

---

### TICKET-013-BE-02: Endpoints de exportación

**Tipo:** Backend - API Layer  
**Prioridad:** Media  
**Estimación:** 5 puntos  
**Sprint:** 4

#### Descripción
Endpoints REST para solicitar exportaciones.

#### Tareas técnicas
- [ ] Crear `ExportController` en `interfaces/controllers/`
  - `POST /api/export/attendances`
    - Body: { classRoomIds, startDate, endDate }
    - Response: stream de archivo CSV
  - `POST /api/export/incidents`
    - Body: { classRoomIds?, childId?, startDate, endDate, types?, tags? }
    - Response: stream de archivo CSV
- [ ] Headers HTTP apropiados:
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="asistencias_YYYY-MM-DD.csv"`
- [ ] Aplicar middlewares de autorización
- [ ] Validación de filtros con Zod
- [ ] Rate limiting (max 10 exportaciones/hora por usuario)
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoints descargan archivos CSV correctamente
- Headers HTTP apropiados
- Nombre de archivo descriptivo con fecha
- Autorización aplicada
- Rate limiting funciona
- Tests pasan

#### Dependencias
- TICKET-013-BE-01

---

### TICKET-013-FE-01: State management de exportación

**Tipo:** Frontend - State Management  
**Prioridad:** Media  
**Estimación:** 3 puntos  
**Sprint:** 4

#### Descripción
Notifier para gestionar solicitudes de exportación.

#### Tareas técnicas
- [ ] Crear `ExportState` en `lib/state/export/`
  - Campos: isExporting, progress, error
- [ ] Crear `ExportNotifier`
  - Métodos: `exportAttendances(filters)`, `exportIncidents(filters)`
  - Manejo de descarga de archivo
- [ ] Tests unitarios

#### Criterios de aceptación
- Estado gestiona exportación correctamente
- Descarga de archivo funciona
- Tests pasan

#### Dependencias
- TICKET-002-FE-01

---

### TICKET-013-FE-02: Servicio de exportación en Flutter

**Tipo:** Frontend - Services  
**Prioridad:** Media  
**Estimación:** 5 puntos  
**Sprint:** 4

#### Descripción
Servicio HTTP para solicitar exportaciones y manejar descarga de archivos.

#### Tareas técnicas
- [ ] Crear `ExportService` en `lib/services/`
  - Métodos: `exportAttendances(filters)`, `exportIncidents(filters)`
  - Manejo de response como blob/bytes
  - Descarga de archivo al dispositivo (Flutter Web)
- [ ] DTOs: `ExportAttendanceRequest`, `ExportIncidentRequest`
- [ ] Manejo de errores HTTP
- [ ] Tests con mocks

#### Criterios de aceptación
- Solicitudes HTTP funcionan
- Descarga de archivo funciona en Flutter Web
- Tests pasan

#### Dependencias
- TICKET-013-BE-02

#### Notas técnicas
- En Flutter Web usar `dart:html` para descargar archivo
- Alternativa: usar package `file_picker` y `file_saver`

---

### TICKET-013-FE-03: UI de exportación de datos

**Tipo:** Frontend - UI  
**Prioridad:** Media  
**Estimación:** 8 puntos  
**Sprint:** 4

#### Descripción
Dialog/página para configurar y solicitar exportaciones.

#### Tareas técnicas
- [ ] Crear `ExportDialog` widget
- [ ] Selector de tipo de exportación:
  - Radio buttons: Asistencias / Incidentes
- [ ] Filtros según tipo:
  - Asistencias: classRooms (multi-select), rango de fechas
  - Incidentes: classRooms (multi-select), niño (opcional), rango de fechas, tipos (multi-select), áreas (multi-select)
- [ ] Filtrado automático por permisos del usuario
- [ ] Botón de "Exportar"
  - Loading state durante generación
  - Progress indicator (opcional)
- [ ] Feedback tras descarga exitosa
- [ ] Manejo de errores (permisos, límites, etc.)
- [ ] Tests de widgets

#### Criterios de aceptación
- Dialog intuitivo y funcional
- Filtros apropiados por tipo
- Solo aulas accesibles por usuario
- Loading state visible
- Feedback claro
- Tests pasan

#### Dependencias
- TICKET-013-FE-01
- TICKET-013-FE-02

#### Notas técnicas
- Validar rango de fechas (máximo 1 año)
- Mostrar advertencia si exportación será grande
- Considerar pre-visualización de datos (opcional)

---

### TICKET-013-INT: Pruebas E2E de exportación

**Tipo:** Integration & Testing  
**Prioridad:** Media  
**Estimación:** 5 puntos  
**Sprint:** 4

#### Descripción
Tests end-to-end de exportación de datos.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Exportar asistencias con filtros
  - Exportar incidentes con filtros
  - DIRECTOR exporta todas las aulas
  - TEACHER exporta solo sus aulas
  - Exportación sin permisos (debe fallar)
  - Rate limiting (múltiples exportaciones)
- [ ] Tests de formato CSV:
  - Encoding UTF-8 correcto
  - Separador correcto
  - Headers en español
  - Datos completos y correctos
  - Compatible con Excel
- [ ] Tests de UI:
  - Dialog funciona
  - Filtros aplicados correctamente
  - Descarga funciona

#### Criterios de aceptación
- Exportaciones funcionan correctamente
- Formato CSV válido
- Permisos respetados
- Rate limiting funciona
- Tests pasan

#### Dependencias
- TICKET-013-BE-02
- TICKET-013-FE-03

---

## US-014: Cifrado de datos locales

**Nota:** Esta funcionalidad es más relevante para aplicaciones móviles nativas. Para Flutter Web, el cifrado se enfoca en transit (HTTPS) y en el backend. En este proyecto, el alcance de US-014 se interpreta como cifrado de datos persistidos en el servidor (no del almacenamiento local del dispositivo/navegador): incluye cifrado en tránsito y cifrado en reposo en la base de datos, con cifrado a nivel de campo de datos sensibles en PostgreSQL usando `pgcrypto` y AES-256 según lo definido en el TICKET-014-BE-01. No se implementa cifrado específico del almacenamiento local del dispositivo/navegador. Se documentan tickets con ese enfoque.

### TICKET-014-BE-01: Implementación de cifrado de datos sensibles en BD

**Tipo:** Backend - Infrastructure  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 1

#### Descripción
Implementar cifrado at-rest para datos sensibles en PostgreSQL y configurar HTTPS.

#### Tareas técnicas
- [ ] Configurar PostgreSQL encryption at rest:
  - Habilitar pgcrypto extension
  - Cifrar campos sensibles (notas, descripciones de incidentes)
  - Usar AES-256
- [ ] Gestión segura de claves de cifrado:
  - Almacenar en variables de entorno
  - No versionar en código
  - Rotación de claves (documentar proceso)
- [ ] Configurar HTTPS en Express:
  - Certificados SSL/TLS
  - Redirección HTTP → HTTPS
  - Headers de seguridad (HSTS)
- [ ] Configurar Supabase security:
  - Row Level Security (RLS) policies
  - Encryption at rest habilitado
- [ ] Documentar proceso de backup cifrado
- [ ] Tests de seguridad

#### Criterios de aceptación
- PostgreSQL encryption at rest habilitado
- Campos sensibles cifrados
- HTTPS configurado y funcionando
- Headers de seguridad apropiados
- Claves gestionadas de forma segura
- Documentación completa

#### Dependencias
- TICKET-001-DB

#### Notas técnicas
- Usar Supabase built-in encryption si es posible
- HTTPS obligatorio en producción
- Considerar AWS KMS para gestión de claves (producción)

---

### TICKET-014-FE-01: Implementación de comunicación segura en Flutter

**Tipo:** Frontend - Infrastructure  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Asegurar que todas las comunicaciones HTTP usen HTTPS y sean seguras.

#### Tareas técnicas
- [ ] Configurar Dio para solo aceptar HTTPS:
  - Forzar protocolo https://
  - Certificate pinning (opcional, producción)
  - Validar certificados SSL
- [ ] Configurar headers de seguridad:
  - No enviar información sensible en URL params
  - Siempre usar Authorization header para tokens
- [ ] No almacenar datos sensibles en localStorage sin cifrar
  - Usar flutter_secure_storage para tokens
- [ ] Tests de seguridad

#### Criterios de aceptación
- Solo comunicación HTTPS
- Tokens almacenados de forma segura
- No se expone información sensible en URLs
- Tests de seguridad pasan

#### Dependencias
- TICKET-001-FE-02

#### Notas técnicas
- Certificate pinning puede complicar desarrollo local
- flutter_secure_storage usa KeyStore (Android) y Keychain (iOS)

---

### TICKET-014-INT: Auditoría de seguridad completa

**Tipo:** Integration & Testing  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 2

#### Descripción
Auditoría completa de seguridad del sistema.

#### Tareas técnicas
- [ ] Tests de penetración básicos:
  - SQL injection attempts
  - XSS attempts
  - CSRF attempts
  - Authentication bypass attempts
  - Authorization bypass attempts
- [ ] Validación de configuración de seguridad:
  - HTTPS obligatorio
  - Headers de seguridad (HSTS, CSP, X-Frame-Options)
  - CORS configurado correctamente
  - Rate limiting funciona
- [ ] Revisión de código de seguridad:
  - No hay secrets en código
  - Inputs siempre validados
  - Outputs siempre sanitizados
- [ ] Scan de dependencias vulnerables:
  - npm audit en backend
  - Flutter pub outdated --json
- [ ] Documentar hallazgos y recomendaciones

#### Criterios de aceptación
- Tests de penetración no encuentran vulnerabilidades críticas
- Configuración de seguridad validada
- Dependencias sin vulnerabilidades críticas
- Documentación de seguridad completa

#### Dependencias
- TICKET-014-BE-01
- TICKET-014-FE-01

#### Notas técnicas
- Usar herramientas: OWASP ZAP, Burp Suite
- Considerar contratar auditoría externa (producción)

---

## Resumen de Tickets por Tipo

### Database (0 tickets)
(No se requieren nuevas tablas, se utilizan las existentes)

### Backend (3 tickets)
- TICKET-013-BE-01: Servicio de exportación CSV
- TICKET-013-BE-02: Endpoints de exportación
- TICKET-014-BE-01: Cifrado de datos sensibles

### Frontend (4 tickets)
- TICKET-013-FE-01: State management exportación
- TICKET-013-FE-02: Servicio de exportación
- TICKET-013-FE-03: UI de exportación
- TICKET-014-FE-01: Comunicación segura

### Integration & Testing (2 tickets)
- TICKET-013-INT: Tests E2E exportación
- TICKET-014-INT: Auditoría de seguridad


---

## Orden de Implementación Sugerido

### Sprint 1 - Semana 1-2 (Paralelo con Gestión de Usuarios)
1. TICKET-014-BE-01: Cifrado y HTTPS (CRÍTICO)
2. TICKET-014-FE-01: Comunicación segura (CRÍTICO)

### Sprint 2 - Semana 1-2
3. TICKET-014-INT: Auditoría de seguridad

### Sprint 4 - Semana 1-2
4. TICKET-013-BE-01: Servicio de exportación
5. TICKET-013-BE-02: Endpoints de exportación
6. TICKET-013-FE-01: State management
7. TICKET-013-FE-02: Servicio Flutter

### Sprint 4 - Semana 3
8. TICKET-013-FE-03: UI de exportación
9. TICKET-013-INT: Tests E2E

---

## Priorización por Criticidad

### Crítica (Sprint 1-2)
- TICKET-014-BE-01: Cifrado y HTTPS
- TICKET-014-FE-01: Comunicación segura
- TICKET-014-INT: Auditoría de seguridad

**Subtotal:** ~21 puntos

### Alta (Sprint 2-4)
- TICKET-013-BE-01 a 013-FE-03: Exportación completa
- TICKET-013-INT: Tests exportación

**Subtotal:** ~24 puntos

---

**Total estimación:** ~45 puntos  
**Duración estimada:** 3-4 semanas (1 Sprint para seguridad, 1 Sprint para exportación)  
**Equipo sugerido:** 2 backend, 1 frontend, 1 security/QA

---

## Notas Importantes de Seguridad

### US-014: Consideraciones de Cifrado

Para Flutter Web, el cifrado de datos "locales" no es tan relevante como en apps nativas, ya que:
- Los datos no se almacenan persistentemente en el navegador (excepto tokens)
- El enfoque principal es cifrado en tránsito (HTTPS) y at-rest en servidor (PostgreSQL)

**Implementación recomendada:**
1. **Cifrado en tránsito:** HTTPS obligatorio (TICKET-014-BE-01, 014-FE-01)
2. **Cifrado at-rest:** PostgreSQL encryption + Supabase security (TICKET-014-BE-01)
3. **Tokens seguros:** flutter_secure_storage en Flutter (TICKET-001-FE-01)
4. **Auditoría:** Logging de seguridad para compliance

### Compliance Considerations

- **GDPR/LOPD:** Asegurar consentimiento para almacenamiento de datos
- **Derecho al olvido:** Implementar proceso de eliminación de datos (post-MVP)
- **Portabilidad:** Exportación CSV cubre este requisito (US-013)
- **Auditoría:** Logging de seguridad para auditorías (US-014)
