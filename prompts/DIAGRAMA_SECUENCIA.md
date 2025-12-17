# Diagramas de Secuencia - Flujos Críticos

## 1. Flujo de Autenticación y Login

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as Angular SPA
    participant AuthController as Auth Controller
    participant AuthService as Auth Service
    participant UsuariosService as Usuarios Service
    participant DB as PostgreSQL
    participant Redis

    Usuario->>Frontend: Ingresa credenciales (username, password)
    Frontend->>Frontend: Validación formulario
    Frontend->>AuthController: POST /auth/login {username, password}
    
    AuthController->>AuthService: validateUser(username, password)
    AuthService->>UsuariosService: findByUsername(username)
    UsuariosService->>DB: SELECT * FROM usuarios WHERE username = ? AND cooperativa_id = ?
    DB-->>UsuariosService: Usuario data
    
    alt Usuario no existe
        UsuariosService-->>AuthService: null
        AuthService-->>AuthController: throw UnauthorizedException
        AuthController-->>Frontend: 401 Unauthorized
        Frontend->>Usuario: Mostrar error: Credenciales inválidas
    else Usuario existe
        UsuariosService-->>AuthService: Usuario con roles/permisos
        AuthService->>AuthService: bcrypt.compare(password, hash)
        
        alt Password incorrecto
            AuthService->>UsuariosService: incrementarIntentosLogin(userId)
            UsuariosService->>DB: UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1
            
            alt intentos >= 5
                UsuariosService->>DB: UPDATE usuarios SET estado = 'bloqueado', motivo_bloqueo = 'Múltiples intentos fallidos'
            end
            
            AuthService-->>AuthController: throw UnauthorizedException
            AuthController-->>Frontend: 401 + intentos restantes
            Frontend->>Usuario: Mostrar error + intentos restantes
        else Password correcto
            AuthService->>AuthService: Generar JWT token (payload: userId, cooperativaId, roles, permissions)
            AuthService->>AuthService: Generar refresh token
            
            AuthService->>DB: INSERT INTO sesiones (usuario_id, token_hash, ip_origen, fecha_inicio)
            AuthService->>UsuariosService: resetIntentosLogin(userId)
            UsuariosService->>DB: UPDATE usuarios SET intentos_fallidos = 0, ultimo_login = NOW()
            
            AuthService->>Redis: SET session:{sessionId} {userData} EX 28800
            
            AuthService-->>AuthController: {token, refreshToken, user, expiresIn}
            AuthController->>AuditService: log('AUTH', 'LOGIN', userId, ip)
            AuditService->>DB: INSERT INTO audit_logs
            
            AuthController-->>Frontend: 200 OK {token, refreshToken, user}
            Frontend->>Frontend: StorageService.setItem('token', token)
            Frontend->>Frontend: StorageService.setItem('refreshToken', refreshToken)
            Frontend->>Frontend: Redirect to /dashboard
            Frontend->>Usuario: Mostrar dashboard
        end
    end
```

## 2. Flujo de Búsqueda Avanzada de Clientes (Multi-tenant)

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as Angular SPA
    participant ClientesController as Clientes Controller
    participant TenantGuard as Tenant Guard
    participant BusquedaService as Búsqueda Service
    participant DB as PostgreSQL
    participant Redis

    Usuario->>Frontend: Ingresa filtros búsqueda (nombre, identificación, código, tipo, estado)
    Frontend->>Frontend: Debounce 500ms
    Frontend->>ClientesController: GET /clientes/buscar?search=...&tipo=...&estado=...
    Note over Frontend,ClientesController: Headers: Authorization: Bearer {JWT}
    
    ClientesController->>JwtAuthGuard: Validar token JWT
    JwtAuthGuard->>JwtAuthGuard: Verificar firma y expiración
    JwtAuthGuard->>JwtAuthGuard: Extraer payload {userId, cooperativaId}
    JwtAuthGuard->>ClientesController: request.user = userData
    
    ClientesController->>TenantGuard: Validar tenant
    TenantGuard->>TenantGuard: Extraer cooperativaId del user
    TenantGuard->>ClientesController: request.cooperativaId = cooperativaId
    
    ClientesController->>PermissionsGuard: Validar permiso 'clientes.buscar'
    PermissionsGuard->>PermissionsGuard: Verificar en user.permissions
    PermissionsGuard-->>ClientesController: Autorizado
    
    ClientesController->>BusquedaService: buscarClientes(filtros, cooperativaId)
    
    BusquedaService->>Redis: GET clientes:search:{hash(filtros)}
    
    alt Cache hit
        Redis-->>BusquedaService: Datos en caché
        BusquedaService-->>ClientesController: Lista de clientes
    else Cache miss
        BusquedaService->>BusquedaService: Construir QueryBuilder con filtros
        Note over BusquedaService: WHERE cooperativa_id = ? <br/>AND fecha_eliminacion IS NULL<br/>AND (identificacion LIKE ? OR nombres LIKE ?)
        
        BusquedaService->>DB: SELECT c.*, p.*, tc.descripcion<br/>FROM clientes c<br/>JOIN personas p ON c.persona_id = p.id<br/>JOIN catalogo_registros tc ON c.tipo_cliente_id = tc.id<br/>WHERE c.cooperativa_id = ?<br/>AND c.fecha_eliminacion IS NULL<br/>AND (p.numero_identificacion ILIKE ? OR p.nombres ILIKE ?)<br/>ORDER BY p.apellidos<br/>LIMIT ? OFFSET ?
        
        DB-->>BusquedaService: Resultados (max 100 registros)
        
        BusquedaService->>Redis: SETEX clientes:search:{hash} 300 {results}
        BusquedaService-->>ClientesController: Lista de clientes
    end
    
    ClientesController->>TransformInterceptor: Transformar respuesta
    TransformInterceptor-->>ClientesController: {success: true, data: [...], timestamp}
    
    ClientesController-->>Frontend: 200 OK {data: clientes[], total, page, pageSize}
    Frontend->>Frontend: Actualizar tabla con resultados
    Frontend->>Usuario: Mostrar resultados (tabla paginada)
    
    Usuario->>Frontend: Click en cliente
    Frontend->>Frontend: Navigate to /clientes/{id}
```

## 3. Flujo de Registro de Poder con Documento

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as Angular SPA
    participant PoderesController as Poderes Controller
    participant PoderesService as Poderes Service
    participant ClientesService as Clientes Service
    participant ApoderadosService as Apoderados Service
    participant StorageService as Storage Service (S3)
    participant DB as PostgreSQL
    participant AuditService as Audit Service

    Usuario->>Frontend: Completa formulario poder
    Usuario->>Frontend: Selecciona archivo documento (PDF)
    Frontend->>Frontend: Validar formulario y archivo
    Note over Frontend: Validar: tipo archivo, tamaño < 5MB,<br/>campos requeridos, fechas coherentes
    
    Usuario->>Frontend: Click "Guardar"
    Frontend->>Frontend: Crear FormData con datos + archivo
    Frontend->>PoderesController: POST /poderes (multipart/form-data)
    Note over Frontend,PoderesController: Body: {cliente_id, apoderado_id,<br/>tipo_poder_id, fechas, documento}
    
    PoderesController->>JwtAuthGuard: Validar autenticación
    PoderesController->>PermissionsGuard: Validar 'poderes.crear'
    PoderesController->>TenantGuard: Inyectar cooperativaId
    
    PoderesController->>ValidationPipe: Validar CreatePoderDto
    ValidationPipe->>ValidationPipe: class-validator rules
    
    alt Validación falla
        ValidationPipe-->>PoderesController: BadRequestException
        PoderesController-->>Frontend: 400 Bad Request + errores
        Frontend->>Usuario: Mostrar errores en formulario
    else Validación OK
        PoderesController->>PoderesService: createPoder(data, file, cooperativaId, userId)
        
        PoderesService->>ClientesService: validateCliente(cliente_id, cooperativaId)
        ClientesService->>DB: SELECT id FROM clientes WHERE persona_id = ? AND cooperativa_id = ?
        
        alt Cliente no existe o no pertenece a cooperativa
            DB-->>ClientesService: null
            ClientesService-->>PoderesService: throw NotFoundException
            PoderesService-->>PoderesController: NotFoundException
            PoderesController-->>Frontend: 404 Cliente no encontrado
            Frontend->>Usuario: Error: Cliente inválido
        else Cliente válido
            DB-->>ClientesService: Cliente data
            ClientesService-->>PoderesService: OK
            
            PoderesService->>ApoderadosService: validateApoderado(apoderado_id, cooperativaId)
            ApoderadosService->>DB: SELECT id FROM apoderados WHERE persona_id = ? AND cooperativa_id = ?
            DB-->>ApoderadosService: Apoderado data
            ApoderadosService-->>PoderesService: OK
            
            PoderesService->>PoderesService: Validar fechas (inicio < fin, otorgamiento <= inicio)
            
            PoderesService->>DB: BEGIN TRANSACTION
            
            PoderesService->>StorageService: uploadFile(file, 'poderes/', cooperativaId)
            StorageService->>StorageService: Generar nombre único: {uuid}_{filename}
            StorageService->>StorageService: Construir path: poderes/{cooperativaId}/{uuid}_{filename}
            StorageService->>S3: PUT object
            S3-->>StorageService: URL del archivo
            
            alt Upload falla
                StorageService-->>PoderesService: throw Error
                PoderesService->>DB: ROLLBACK
                PoderesService-->>PoderesController: Error al subir archivo
                PoderesController-->>Frontend: 500 Error
                Frontend->>Usuario: Error al subir documento
            else Upload exitoso
                StorageService-->>PoderesService: {url, key, size}
                
                PoderesService->>DB: INSERT INTO poderes<br/>(cliente_id, apoderado_id, tipo_poder_id,<br/>numero_escritura, fecha_otorgamiento,<br/>fecha_inicio, fecha_fin, notaria, alcance,<br/>documento_url, documento_nombre, documento_tamanio,<br/>estado, cooperativa_id, usuario_creacion, fecha_creacion)<br/>VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'vigente', ?, ?, NOW())
                
                DB-->>PoderesService: Poder insertado {id}
                
                PoderesService->>AuditService: log('PODERES', 'CREATE', 'poderes', poder.id, userId, ip, null, poderData)
                AuditService->>DB: INSERT INTO audit_logs
                
                PoderesService->>DB: COMMIT
                
                PoderesService->>DB: SELECT poder con JOIN clientes, apoderados, personas
                DB-->>PoderesService: Poder completo con relaciones
                
                PoderesService-->>PoderesController: Poder creado
                PoderesController-->>Frontend: 201 Created {poder}
                
                Frontend->>Frontend: NotificationService.success('Poder registrado')
                Frontend->>Frontend: Router.navigate(['/poderes'])
                Frontend->>Usuario: Mostrar notificación éxito + redirección
            end
        end
    end
```

## 4. Flujo de Soft Delete con Auditoría

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as Angular SPA
    participant ClientesController as Clientes Controller
    participant ClientesService as Clientes Service
    participant DB as PostgreSQL
    participant AuditInterceptor as Audit Interceptor
    participant AuditService as Audit Service

    Usuario->>Frontend: Click "Eliminar" en cliente
    Frontend->>Frontend: Mostrar ConfirmDialog
    Note over Frontend: "¿Está seguro de eliminar este cliente?"<br/>Campo: Motivo de eliminación (requerido)
    
    Usuario->>Frontend: Confirmar + ingresar motivo
    Frontend->>ClientesController: DELETE /clientes/{id} {motivo: "..."}
    
    ClientesController->>JwtAuthGuard: Validar token
    ClientesController->>PermissionsGuard: Validar 'clientes.eliminar'
    ClientesController->>TenantGuard: Inyectar cooperativaId
    
    ClientesController->>AuditInterceptor: BEFORE request
    AuditInterceptor->>ClientesService: getCliente(id) para capturar estado previo
    ClientesService->>DB: SELECT * FROM clientes WHERE persona_id = ? AND cooperativa_id = ?
    DB-->>ClientesService: Cliente actual (datos antes)
    ClientesService-->>AuditInterceptor: Cliente data
    AuditInterceptor->>AuditInterceptor: Guardar datos_anteriores en context
    
    ClientesController->>ClientesService: softDelete(id, motivo, cooperativaId, userId)
    
    ClientesService->>DB: SELECT id, estado FROM clientes<br/>WHERE persona_id = ?<br/>AND cooperativa_id = ?<br/>AND fecha_eliminacion IS NULL
    
    alt Cliente no existe o ya eliminado
        DB-->>ClientesService: null
        ClientesService-->>ClientesController: throw NotFoundException
        ClientesController-->>Frontend: 404 Not Found
        Frontend->>Usuario: Error: Cliente no encontrado
    else Cliente existe
        DB-->>ClientesService: Cliente data
        
        ClientesService->>ClientesService: Validar no tiene poderes vigentes
        ClientesService->>DB: SELECT COUNT(*) FROM poderes<br/>WHERE cliente_id = ?<br/>AND estado = 'vigente'<br/>AND fecha_eliminacion IS NULL
        
        alt Tiene poderes vigentes
            DB-->>ClientesService: count > 0
            ClientesService-->>ClientesController: throw ConflictException
            ClientesController-->>Frontend: 409 Conflict "Cliente tiene poderes vigentes"
            Frontend->>Usuario: Error: No se puede eliminar, tiene poderes vigentes
        else Sin poderes vigentes
            DB-->>ClientesService: count = 0
            
            ClientesService->>DB: UPDATE clientes<br/>SET fecha_eliminacion = NOW(),<br/>    usuario_eliminacion = ?,<br/>    motivo_eliminacion = ?,<br/>    fecha_modificacion = NOW(),<br/>    usuario_modificacion = ?<br/>WHERE persona_id = ?<br/>AND cooperativa_id = ?
            
            DB-->>ClientesService: UPDATE OK
            
            ClientesService-->>ClientesController: void
            
            ClientesController->>AuditInterceptor: AFTER request
            AuditInterceptor->>AuditInterceptor: Comparar datos_anteriores vs datos_nuevos
            
            AuditInterceptor->>AuditService: createLog({<br/>  modulo: 'CLIENTES',<br/>  accion: 'DELETE',<br/>  entidad: 'clientes',<br/>  entidad_id: id,<br/>  usuario_id: userId,<br/>  usuario_ip: request.ip,<br/>  datos_anteriores: {...},<br/>  datos_nuevos: {fecha_eliminacion, motivo},<br/>  cooperativa_id<br/>})
            
            AuditService->>DB: INSERT INTO audit_logs VALUES (...)
            DB-->>AuditService: Log insertado
            
            ClientesController-->>Frontend: 200 OK
            
            Frontend->>Frontend: NotificationService.success('Cliente eliminado')
            Frontend->>Frontend: Refresh lista (excluye eliminados)
            Frontend->>Usuario: Notificación + tabla actualizada
        end
    end
```

## 5. Flujo de Exportación Asíncrona (Jobs)

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as Angular SPA
    participant ReportesController as Reportes Controller
    participant ReportesService as Reportes Service
    participant DB as PostgreSQL
    participant Queue as Bull Queue (Redis)
    participant Worker as Export Worker
    participant StorageService as Storage Service (S3)

    Usuario->>Frontend: Selecciona filtros y columnas para exportar
    Usuario->>Frontend: Selecciona formato (Excel/CSV/PDF)
    Usuario->>Frontend: Click "Exportar"
    
    Frontend->>ReportesController: POST /reportes/clientes/exportar<br/>{filtros, columnas, formato}
    
    ReportesController->>JwtAuthGuard: Validar token
    ReportesController->>PermissionsGuard: Validar 'reportes.exportar'
    
    ReportesController->>ReportesService: createExportJob(filtros, columnas, formato, userId, cooperativaId)
    
    ReportesService->>DB: INSERT INTO jobs_exportacion<br/>(usuario_id, cooperativa_id, filtros, columnas, formato,<br/>estado_job, progreso, fecha_creacion)<br/>VALUES (?, ?, ?, ?, ?, 'pendiente', 0, NOW())<br/>RETURNING id
    
    DB-->>ReportesService: Job ID
    
    ReportesService->>Queue: add('export-clientes', {<br/>  jobId,<br/>  filtros,<br/>  columnas,<br/>  formato,<br/>  userId,<br/>  cooperativaId<br/>})
    
    Queue-->>ReportesService: Job enqueued
    
    ReportesService-->>ReportesController: {jobId, status: 'pendiente'}
    ReportesController-->>Frontend: 202 Accepted {jobId}
    
    Frontend->>Frontend: NotificationService.info('Exportación en progreso')
    Frontend->>Frontend: Navigate to /reportes/jobs
    Frontend->>Frontend: Poll job status cada 2s
    
    Note over Frontend,Worker: Proceso asíncrono en background
    
    Queue->>Worker: Process job
    Worker->>DB: SELECT id FROM jobs_exportacion WHERE id = ? AND cooperativa_id = ?
    DB-->>Worker: Job data
    
    Worker->>DB: UPDATE jobs_exportacion SET estado_job = 'procesando' WHERE id = ?
    
    Worker->>Worker: Construir query con filtros
    Worker->>DB: SELECT * FROM clientes c<br/>JOIN personas p ON c.persona_id = p.id<br/>WHERE c.cooperativa_id = ?<br/>AND {filtros aplicados}<br/>LIMIT 10000
    
    DB-->>Worker: Stream de registros
    
    loop Por cada batch de 1000 registros
        Worker->>Worker: Procesar batch
        Worker->>DB: UPDATE jobs_exportacion<br/>SET progreso = calculado<br/>WHERE id = ?
        
        alt Frontend polling
            Frontend->>ReportesController: GET /reportes/jobs/{jobId}
            ReportesController->>DB: SELECT * FROM jobs_exportacion WHERE id = ?
            DB-->>ReportesController: {progreso, estado_job}
            ReportesController-->>Frontend: Job status
            Frontend->>Frontend: Actualizar progress bar (progreso%)
        end
    end
    
    Worker->>Worker: Generar archivo según formato
    Note over Worker: ExcelService.generate() o<br/>CsvService.generate() o<br/>PdfService.generate()
    
    Worker->>StorageService: uploadFile(archivo, 'exports/', cooperativaId)
    StorageService->>S3: PUT object
    S3-->>StorageService: URL firmada temporal (1 hora)
    StorageService-->>Worker: {url, key}
    
    Worker->>DB: UPDATE jobs_exportacion<br/>SET estado_job = 'completado',<br/>    progreso = 100,<br/>    resultado_url = ?,<br/>    fecha_fin = NOW()<br/>WHERE id = ?
    
    Worker->>NotificationService: Enviar notificación a usuario
    NotificationService->>DB: INSERT INTO notificaciones<br/>(usuario_id, titulo, mensaje, tipo, estado, cooperativa_id)<br/>VALUES (?, 'Exportación completa', 'Tu reporte está listo', 'info', 'pendiente', ?)
    
    Frontend->>ReportesController: GET /reportes/jobs/{jobId} (polling)
    ReportesController->>DB: SELECT * FROM jobs_exportacion WHERE id = ?
    DB-->>ReportesController: {estado: 'completado', resultado_url, progreso: 100}
    ReportesController-->>Frontend: Job completado con URL
    
    Frontend->>Frontend: NotificationService.success('Exportación lista')
    Frontend->>Frontend: Mostrar botón "Descargar"
    
    Usuario->>Frontend: Click "Descargar"
    Frontend->>Frontend: window.open(resultado_url)
    Frontend->>S3: GET archivo (URL firmada)
    S3-->>Frontend: Archivo descargado
    Frontend->>Usuario: Archivo descargado al dispositivo
```

## 6. Flujo de Validación Multi-tenant en Operaciones

```mermaid
sequenceDiagram
    actor Usuario1 as Usuario Cooperativa A
    actor Usuario2 as Usuario Cooperativa B
    participant Frontend as Angular SPA
    participant API as NestJS API
    participant TenantInterceptor as Tenant Interceptor
    participant Service as Domain Service
    participant DB as PostgreSQL

    Note over Usuario1,Usuario2: Ambos usuarios logueados simultáneamente

    Usuario1->>Frontend: Request ver cliente ID=100
    Frontend->>API: GET /clientes/100<br/>Authorization: Bearer {token_cooperativaA}
    
    API->>JwtAuthGuard: Validar token
    JwtAuthGuard->>JwtAuthGuard: Decodificar JWT → cooperativaId = 1
    JwtAuthGuard->>API: request.user = {id: 5, cooperativaId: 1}
    
    API->>TenantInterceptor: Interceptar request
    TenantInterceptor->>TenantInterceptor: Extraer cooperativaId del user
    TenantInterceptor->>API: request.cooperativaId = 1
    
    API->>Service: getCliente(100, cooperativaId=1)
    Service->>DB: SELECT * FROM clientes<br/>WHERE persona_id = 100<br/>AND cooperativa_id = 1<br/>AND fecha_eliminacion IS NULL
    
    alt Cliente pertenece a cooperativa A
        DB-->>Service: Cliente data
        Service-->>API: Cliente completo
        API-->>Frontend: 200 OK {cliente}
        Frontend->>Usuario1: Mostrar datos del cliente
    else Cliente NO pertenece a cooperativa A
        DB-->>Service: null (no results)
        Service-->>API: throw NotFoundException
        API-->>Frontend: 404 Not Found
        Frontend->>Usuario1: Error: Cliente no encontrado
    end
    
    Note over Usuario2: Usuario de Cooperativa B intenta acceder al mismo cliente
    
    Usuario2->>Frontend: Request ver cliente ID=100
    Frontend->>API: GET /clientes/100<br/>Authorization: Bearer {token_cooperativaB}
    
    API->>JwtAuthGuard: Validar token
    JwtAuthGuard->>JwtAuthGuard: Decodificar JWT → cooperativaId = 2
    JwtAuthGuard->>API: request.user = {id: 8, cooperativaId: 2}
    
    API->>TenantInterceptor: Interceptar request
    TenantInterceptor->>API: request.cooperativaId = 2
    
    API->>Service: getCliente(100, cooperativaId=2)
    Service->>DB: SELECT * FROM clientes<br/>WHERE persona_id = 100<br/>AND cooperativa_id = 2<br/>AND fecha_eliminacion IS NULL
    
    DB-->>Service: null (cliente 100 NO existe en cooperativa 2)
    Service-->>API: throw NotFoundException
    API-->>Frontend: 404 Not Found
    Frontend->>Usuario2: Error: Cliente no encontrado
    
    Note over Usuario1,DB: ✅ Aislamiento total de datos entre cooperativas<br/>El WHERE cooperativa_id se aplica automáticamente<br/>en TODAS las queries
```

## 7. Flujo de Refresh Token

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as Angular SPA
    participant API as NestJS API
    participant AuthController as Auth Controller
    participant AuthService as Auth Service
    participant DB as PostgreSQL
    participant Redis

    Note over Usuario,Redis: Usuario trabajando, token JWT expira en 5 min

    Frontend->>Frontend: Detectar token próximo a expirar (5 min antes)
    Frontend->>AuthController: POST /auth/refresh<br/>{refreshToken}
    
    AuthController->>AuthService: refreshToken(refreshToken)
    AuthService->>Redis: GET refresh:{hash(refreshToken)}
    
    alt Refresh token inválido o expirado
        Redis-->>AuthService: null
        AuthService-->>AuthController: throw UnauthorizedException
        AuthController-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: AuthService.logout()
        Frontend->>Frontend: Router.navigate(['/login'])
        Frontend->>Usuario: Sesión expirada, vuelva a iniciar sesión
    else Refresh token válido
        Redis-->>AuthService: {userId, cooperativaId, sessionId}
        
        AuthService->>DB: SELECT id, estado, cooperativa_id<br/>FROM usuarios<br/>WHERE id = ?<br/>AND estado = 'activo'
        
        alt Usuario bloqueado o inactivo
            DB-->>AuthService: null o estado != 'activo'
            AuthService-->>AuthController: throw UnauthorizedException
            AuthController-->>Frontend: 401 Usuario inactivo
            Frontend->>Frontend: AuthService.logout()
            Frontend->>Usuario: Su cuenta ha sido desactivada
        else Usuario activo
            DB-->>AuthService: Usuario data
            
            AuthService->>DB: SELECT roles, permissions FROM usuarios_roles, usuarios_permisos WHERE usuario_id = ?
            DB-->>AuthService: Roles y permisos actualizados
            
            AuthService->>AuthService: Generar nuevo JWT token (8h)
            AuthService->>AuthService: Generar nuevo refresh token (30d)
            
            AuthService->>Redis: DEL refresh:{old_hash}
            AuthService->>Redis: SETEX refresh:{new_hash} 2592000 {userData}
            
            AuthService->>DB: UPDATE sesiones<br/>SET token_hash = ?,<br/>    fecha_expiracion = NOW() + interval '8 hours'<br/>WHERE id = ?
            
            AuthService-->>AuthController: {token, refreshToken, expiresIn}
            AuthController-->>Frontend: 200 OK {token, refreshToken}
            
            Frontend->>Frontend: StorageService.setItem('token', new_token)
            Frontend->>Frontend: StorageService.setItem('refreshToken', new_refreshToken)
            Frontend->>Frontend: Actualizar headers HTTP con nuevo token
            
            Note over Frontend: Usuario sigue trabajando sin interrupción
        end
    end
```

## Notas sobre Flujos

### Seguridad Multi-tenant
- Todas las queries incluyen `WHERE cooperativa_id = ?`
- El `cooperativaId` se extrae del JWT, nunca del request body/query
- TenantInterceptor lo inyecta automáticamente en el contexto
- Imposible acceder a datos de otra cooperativa

### Auditoría Automática
- AuditInterceptor captura todas las operaciones POST/PUT/PATCH/DELETE
- Registra estado antes/después de cada operación
- Include usuario, IP, timestamp, metadata
- Búsqueda y reporting de cambios históricos

### Soft Delete
- No se eliminan registros físicamente
- Se marca con `fecha_eliminacion`, `usuario_eliminacion`, `motivo_eliminacion`
- Queries automáticamente filtran registros eliminados
- Posible recuperación desde panel admin

### Performance
- Cache en Redis para búsquedas frecuentes (TTL 5 min)
- Paginación obligatoria (max 100 registros por página)
- Exports asíncronos para grandes volúmenes
- Índices compuestos en (cooperativa_id, campo_busqueda)

### Manejo de Errores
- Validación en múltiples capas (Frontend, DTOs, Business logic)
- Errores descriptivos con códigos HTTP apropiados
- Rollback de transacciones en caso de error
- Logging de errores para debugging
