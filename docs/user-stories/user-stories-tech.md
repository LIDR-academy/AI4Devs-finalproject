# Análisis Técnico de User Stories – KinderTrack MVP

---

## Índice

1. [Introducción](#introducción)
2. [Contexto Arquitectónico](#contexto-arquitectónico)
3. [Análisis de Historias Críticas](#análisis-de-historias-críticas)
4. [Análisis de Historias de Alta Prioridad](#análisis-de-historias-de-alta-prioridad)
5. [Análisis de Historias de Prioridad Media](#análisis-de-historias-de-prioridad-media)
6. [Resumen de Riesgos y Mitigaciones](#resumen-de-riesgos-y-mitigaciones)
7. [Stack Tecnológico Recomendado](#stack-tecnológico-recomendado)

---

## Introducción

Este documento presenta el análisis técnico detallado de las user stories del MVP de **KinderTrack**, desde la perspectiva de arquitectura de software y liderazgo técnico, con foco en la implementación con **Flutter Web** y **TypeScript/Node.js**.

### Objetivo del Análisis

- Identificar **requerimientos técnicos específicos** para cada historia
- Documentar **riesgos potenciales** y estrategias de mitigación
- Proporcionar guía técnica para el equipo de desarrollo
- Asegurar alineación con arquitectura DDD y principios SOLID

### Alcance

Se analizan las **14 user stories del MVP**, clasificadas en:
- **Críticas**: funcionalidad base
- **Alta prioridad**: valor completo del MVP
- **Prioridad media**: mejoras importantes

---

## Contexto Arquitectónico

### Stack Tecnológico

**Frontend:**
- Flutter Web 3.x
- State Management: Riverpod o Bloc
- HTTP Client: Dio
- Local Storage: Hive o SQLite + sqflite_common_ffi

**Backend:**
- Node.js 20.x LTS + TypeScript 5.x
- Framework: Express.js
- ORM: Prisma
- Base de datos: PostgreSQL 15+ (Supabase)
- Autenticación: JWT + bcrypt / Supabase Auth

**Arquitectura:**
- Patrón: Domain-Driven Design (DDD)
- Mono-repositorio
- API REST (JSON)
- Offline-first con sincronización opcional

### Modelo de Datos Core

```
User (usuario/docente)
  ↓
ClassRoom (aula/grupo)
  ↓
Child (niño)
  ↓
Attendance (asistencia) + Incident (incidente)
```

---

## Análisis de Historias Críticas

### US-001: Autenticación de usuarios

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Capa de Dominio:**
   ```typescript
   // domains/users/entities/User.ts
   - Entity User con validaciones
   - Value Objects: Email, Password, Role
   - Domain events: UserLoggedIn, SessionExpired
   ```

2. **Repositorio:**
   ```typescript
   // domains/users/repositories/UserRepository.ts
   interface IUserRepository {
     findByEmail(email: string): Promise<User | null>;
     findById(id: string): Promise<User | null>;
     updateLastLogin(userId: string): Promise<void>;
   }
   ```

3. **Servicios:**
   ```typescript
   // domains/users/services/AuthService.ts
   - hashPassword(password: string): Promise<string>
   - verifyPassword(plain: string, hashed: string): Promise<boolean>
   - generateToken(user: User): string
   - validateToken(token: string): Promise<User | null>
   - trackFailedAttempts(email: string): Promise<void>
   - lockAccount(email: string, duration: number): Promise<void>
   ```

4. **Controllers:**
   ```typescript
   // interfaces/controllers/AuthController.ts
   POST /api/auth/login
   POST /api/auth/logout
   GET /api/auth/me
   POST /api/auth/refresh
   ```

5. **Middlewares:**
   ```typescript
   // middlewares/auth.middleware.ts
   - authenticateToken()
   - checkSessionValidity()
   - rateLimitLogin()
   ```

6. **Configuración:**
   - JWT secret en variables de entorno
   - Tiempo de expiración: 8 horas
   - Bcrypt rounds: 10-12
   - Rate limiting: 5 intentos/15 min

**Frontend (Flutter Web):**

1. **State Management:**
   ```dart
   // state/auth/auth_provider.dart
   class AuthState {
     User? user;
     String? token;
     bool isAuthenticated;
     DateTime? sessionExpiry;
   }
   
   class AuthNotifier extends StateNotifier<AuthState> {
     Future<void> login(String email, String password);
     Future<void> logout();
     Future<bool> checkSession();
   }
   ```

2. **Servicios:**
   ```dart
   // services/auth_service.dart
   class AuthService {
     Future<LoginResponse> login(LoginRequest request);
     Future<void> logout();
     Future<User?> getCurrentUser();
   }
   ```

3. **Storage Seguro:**
   ```dart
   // utils/secure_storage.dart
   - flutter_secure_storage para token JWT
   - Almacenar token con encriptación
   - Auto-logout en expiración
   ```

4. **UI:**
   ```dart
   // pages/login_page.dart
   - Form con validación
   - Manejo de errores
   - Indicador de carga
   - Navegación post-login
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Vulnerabilidad XSS en Flutter Web** | Media | Alto | Sanitizar inputs, usar TextEditingController con validación |
| **Token JWT expuesto en localStorage** | Media | Crítico | Usar flutter_secure_storage, implementar refresh tokens |
| **Falta de rate limiting** | Alta | Alto | Implementar middleware de rate limiting (express-rate-limit) |
| **Session fixation** | Baja | Alto | Regenerar session ID post-login, invalidar tokens antiguos |
| **Contraseñas débiles** | Media | Alto | Validación fuerte en frontend/backend, bcrypt con 12 rounds |
| **CSRF en API** | Media | Medio | CSRF tokens, validar Origin header, SameSite cookies |
| **Brute force attacks** | Alta | Alto | Bloqueo temporal (5 intentos), CAPTCHA después de 3 fallos |
| **JWT sin expiración adecuada** | Media | Alto | Expiración a 8h, implementar refresh token pattern |

**Consideraciones de Performance:**
- Cachear validación de token (Redis si escala)
- Implementar lazy loading de datos de usuario
- Optimizar tamaño del JWT (solo datos esenciales)

**Consideraciones de Flutter Web:**
- Bundle inicial grande → lazy loading de módulos
- CORS configurado correctamente en backend
- Manejo de hot reload durante desarrollo

---

### US-002: Control de acceso por roles

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Capa de Dominio:**
   ```typescript
   // domains/users/entities/Role.ts
   enum Role {
     TEACHER = 'TEACHER',
     DIRECTOR = 'DIRECTOR',
     ADMIN = 'ADMIN'
   }
   
   enum Permission {
     CREATE_ATTENDANCE = 'CREATE_ATTENDANCE',
     VIEW_ALL_CLASSROOMS = 'VIEW_ALL_CLASSROOMS',
     CREATE_INCIDENT = 'CREATE_INCIDENT',
     VIEW_INCIDENT = 'VIEW_INCIDENT',
     EXPORT_DATA = 'EXPORT_DATA',
     MANAGE_USERS = 'MANAGE_USERS'
   }
   
   // domains/users/entities/RolePermission.ts
   class RolePermission {
     static getPermissions(role: Role): Permission[];
     static hasPermission(role: Role, permission: Permission): boolean;
   }
   ```

2. **Asignación Aula-Docente:**
   ```typescript
   // domains/classrooms/entities/ClassRoomAssignment.ts
   interface IClassRoomAssignment {
     userId: string;
     classRoomIds: string[];
   }
   ```

3. **Middlewares:**
   ```typescript
   // middlewares/authorization.middleware.ts
   const requirePermission = (permission: Permission) => {
     return async (req, res, next) => {
       const user = req.user;
       if (RolePermission.hasPermission(user.role, permission)) {
         next();
       } else {
         res.status(403).json({ error: 'Forbidden' });
       }
     }
   }
   
   const requireClassRoomAccess = (classRoomId: string) => {
     return async (req, res, next) => {
       const user = req.user;
       if (user.role === Role.DIRECTOR) {
         next(); // Acceso total
       } else if (user.assignedClasses.includes(classRoomId)) {
         next();
       } else {
         res.status(403).json({ error: 'No access to this classroom' });
       }
     }
   }
   ```

4. **Servicios:**
   ```typescript
   // domains/users/services/AuthorizationService.ts
   class AuthorizationService {
     canAccessClassRoom(userId: string, classRoomId: string): Promise<boolean>;
     canPerformAction(userId: string, action: Permission): Promise<boolean>;
     getAccessibleClassRooms(userId: string): Promise<string[]>;
   }
   ```

5. **Rutas Protegidas:**
   ```typescript
   // interfaces/routes/attendance.routes.ts
   router.post(
     '/attendance',
     authenticateToken,
     requirePermission(Permission.CREATE_ATTENDANCE),
     requireClassRoomAccess,
     AttendanceController.create
   );
   ```

**Frontend (Flutter Web):**

1. **State Management:**
   ```dart
   // state/auth/user_permissions.dart
   class UserPermissions {
     Role role;
     List<String> assignedClassRoomIds;
     
     bool canAccessClassRoom(String classRoomId);
     bool hasPermission(Permission permission);
   }
   ```

2. **Guards de Navegación:**
   ```dart
   // utils/route_guards.dart
   class RoleGuard {
     bool canActivate(Role requiredRole, Role userRole);
   }
   
   class PermissionGuard {
     bool canActivate(Permission permission, User user);
   }
   ```

3. **UI Condicional:**
   ```dart
   // widgets/conditional_widget.dart
   class PermissionBasedWidget extends StatelessWidget {
     final Permission requiredPermission;
     final Widget child;
     
     @override
     Widget build(BuildContext context) {
       final user = context.read<AuthNotifier>().user;
       if (user.hasPermission(requiredPermission)) {
         return child;
       }
       return SizedBox.shrink();
     }
   }
   ```

4. **Filtrado de Datos:**
   ```dart
   // services/classroom_service.dart
   Future<List<ClassRoom>> getAccessibleClassRooms() {
     // Filtrar según rol y asignaciones
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Bypass de autorización en frontend** | Alta | Crítico | SIEMPRE validar permisos en backend, frontend solo UI |
| **Escalación de privilegios** | Media | Crítico | Validación estricta en cada endpoint, auditoría de roles |
| **Asignaciones inconsistentes** | Media | Alto | Validar integridad referencial, transacciones ACID |
| **Cambio de rol requiere nueva sesión** | Baja | Bajo | Invalidar JWT al cambiar rol, forzar re-login |
| **Performance en queries de permisos** | Media | Medio | Cachear permisos en JWT, indexar tabla de asignaciones |
| **RBAC vs ABAC confusion** | Baja | Medio | Documentar claramente modelo de permisos, consistencia |

**Consideraciones de Arquitectura:**
- Implementar RBAC (Role-Based Access Control) estricto
- Cada usuario tiene un único rol (ENUM en User.role)
- Permisos en JWT para evitar consultas constantes
- Tabla intermedia `user_classroom_assignments` para N:M (usuario-aula)
- Auditoría de cambios de roles/permisos

**Testing:**
- Tests unitarios para cada combinación rol-permiso
- Tests de integración de endpoints protegidos
- Tests de seguridad (intentos de bypass)

---

### US-003: Registro rápido de check-in

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Capa de Dominio:**
   ```typescript
   // domains/attendance/entities/Attendance.ts
   enum AttendanceStatus {
     PRESENT = 'PRESENT',
     ABSENT = 'ABSENT',
     LATE = 'LATE'
   }
   
   // Nota: "CHECKED_OUT" no es un valor del enum.
   // Es un estado derivado que se calcula como:
   // status === PRESENT && check_out_time !== null
   
   enum ChildState {
     CALM = 'CALM',
     TIRED = 'TIRED',
     HYPERACTIVE = 'HYPERACTIVE',
     MEDICATED = 'MEDICATED',
     FED = 'FED',
     NOT_FED = 'NOT_FED'
   }
   
   class Attendance {
     id: string;
     childId: string;
     classRoomId: string;
     date: Date;
     checkInTime: Date;
     checkOutTime?: Date;
     status: AttendanceStatus;
     state?: ChildState;
     notes?: string;
     recordedBy: string;
     deviceId?: string;
   }
   ```

2. **Validaciones de Dominio:**
   ```typescript
   // domains/attendance/entities/Attendance.ts
   class Attendance {
     static validate(data: CreateAttendanceDto): ValidationResult {
       // No permitir check-in duplicado mismo día
       // Validar que childId exista
       // Validar que classRoomId coincida con el child
       // Notes máximo 100 caracteres
     }
   }
   ```

3. **Repositorio:**
   ```typescript
   // domains/attendance/repositories/AttendanceRepository.ts
   interface IAttendanceRepository {
     create(attendance: Attendance): Promise<Attendance>;
     findByChildAndDate(childId: string, date: Date): Promise<Attendance | null>;
     findByClassRoomAndDate(classRoomId: string, date: Date): Promise<Attendance[]>;
     update(id: string, data: Partial<Attendance>): Promise<Attendance>;
   }
   ```

4. **Servicios:**
   ```typescript
   // domains/attendance/services/AttendanceService.ts
   class AttendanceService {
     async checkIn(dto: CheckInDto, userId: string): Promise<Attendance> {
       // Validar no duplicación
       // Crear registro con timestamp actual
       // Asociar educador
       // Emitir evento CheckInRegistered
     }
     
     async getTodayPresent(classRoomId: string): Promise<Child[]>;
     async getTodayAbsent(classRoomId: string): Promise<Child[]>;
   }
   ```

5. **Controllers:**
   ```typescript
   // interfaces/controllers/AttendanceController.ts
   POST /api/attendance/check-in
   Body: {
     childId: string,
     classRoomId: string,
     state?: ChildState,
     notes?: string
   }
   Response: { attendance: Attendance, timestamp: Date }
   ```

6. **Optimización:**
   ```typescript
   // Índices en BD
   CREATE INDEX idx_attendance_child_date ON attendance(child_id, date);
   CREATE INDEX idx_attendance_classroom_date ON attendance(class_room_id, date);
   
   // Query optimizada
   SELECT * FROM attendance 
   WHERE class_room_id = ? AND date = CURRENT_DATE
   ```

**Frontend (Flutter Web):**

1. **State Management:**
   ```dart
   // state/attendance/attendance_provider.dart
   class AttendanceState {
     List<Child> childrenList;
     List<Attendance> todayAttendances;
     bool isLoading;
     String? error;
   }
   
   class AttendanceNotifier extends StateNotifier<AttendanceState> {
     Future<void> checkIn({
       required String childId,
       required ChildState? state,
       String? notes,
     });
     
     Future<void> loadTodayAttendance(String classRoomId);
   }
   ```

2. **UI Optimizada:**
   ```dart
   // pages/attendance_page.dart
   class AttendancePage extends StatelessWidget {
     // Lista de niños con búsqueda rápida
     // Botón de check-in prominente
     // Selector rápido de estado (chips)
     // Validación en tiempo real
     // Feedback visual inmediato
   }
   
   // widgets/quick_check_in_button.dart
   class QuickCheckInButton extends StatelessWidget {
     // Botón optimizado para tap rápido
     // Animación de confirmación
     // Debounce para evitar doble click
   }
   ```

3. **Optimización de Performance:**
   ```dart
   // services/attendance_service.dart
   class AttendanceService {
     final _dio = Dio();
     
     Future<Attendance> checkIn(CheckInRequest request) async {
       // Timeout de 5 segundos
       // Retry automático (max 2 intentos)
       // Cache optimistic update
       final response = await _dio.post(
         '/api/attendance/check-in',
         data: request.toJson(),
         options: Options(
           sendTimeout: Duration(seconds: 5),
           receiveTimeout: Duration(seconds: 5),
         ),
       );
       return Attendance.fromJson(response.data);
     }
   }
   ```

4. **UI/UX para <15 segundos:**
   ```dart
   // Flujo optimizado:
   // 1. Tap en niño (1 seg)
   // 2. Selector de estado (2-3 seg)
   // 3. Confirmación (1 seg)
   // 4. API call + feedback (2-3 seg)
   // Total: 6-8 segundos
   
   // Optimizaciones:
   - ListView.builder para listas grandes
   - Memoización de widgets
   - Debouncing en búsqueda
   - Optimistic updates
   ```

5. **Validaciones Frontend:**
   ```dart
   // validators/attendance_validator.dart
   class AttendanceValidator {
     static String? validateNotes(String? notes) {
       if (notes != null && notes.length > 100) {
         return 'Máximo 100 caracteres';
       }
       return null;
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Check-in duplicado en mismo día** | Alta | Medio | Constraint UNIQUE(child_id, date) en BD, validación en service |
| **Latencia de red >2 seg** | Media | Alto | Timeout corto, retry automático, optimistic updates |
| **Timestamp incorrecto (zona horaria)** | Media | Alto | Usar UTC en BD, convertir en presentación, sincronizar reloj |
| **Inconsistencia child-classroom** | Media | Alto | Validar FK en BD, verificar en service layer |
| **UI lenta en tablets antiguos** | Media | Medio | Lazy loading, virtualización de listas, optimizar renders |
| **Pérdida de datos en red inestable** | Alta | Crítico | Queue local, retry mechanism, feedback claro de estado |
| **Race condition en updates simultáneos** | Baja | Medio | Optimistic locking, timestamps, idempotencia |
| **Bundle size grande en Flutter Web** | Alta | Medio | Tree shaking, code splitting, lazy loading de páginas |

**Consideraciones de Performance:**
- Target: <2 segundos para API call
- UI debe responder en <100ms
- Implementar debouncing en búsqueda (300ms)
- Cachear lista de niños del aula
- Minimizar re-renders con memoización

**Consideraciones de UX:**
- Feedback visual inmediato (optimistic update)
- Loading indicators claros
- Manejo de errores user-friendly
- Confirmación visual de éxito
- Acceso rápido a últimos registros

---

### US-004: Registro rápido de check-out

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

**Nota Importante:** Utilizaremos el campo `notes` existente en el modelo Attendance para almacenar información sobre quién recoge al niño, sin necesidad de extender el modelo.

1. **Validaciones:**
   ```typescript
   // domains/attendance/services/AttendanceService.ts
   async checkOut(dto: CheckOutDto, userId: string): Promise<Attendance> {
     // 1. Verificar que existe check-in
     const attendance = await this.repository.findByChildAndDate(
       dto.childId,
       new Date()
     );
     
     if (!attendance || !attendance.checkInTime) {
       throw new ValidationError('No check-in found for today');
     }
     
     // 2. Verificar que no tiene check-out previo
     if (attendance.checkOutTime) {
       throw new ValidationError('Already checked out');
     }
     
     // 3. Validar nota de salida (quién recoge)
     if (!dto.pickupNote || dto.pickupNote.trim().length === 0) {
       throw new ValidationError('Pickup information required');
     }
     
     // 4. Actualizar registro usando campo notes existente
     const updatedNotes = attendance.notes 
       ? `${attendance.notes} | Recogido por: ${dto.pickupNote}`
       : `Recogido por: ${dto.pickupNote}`;
     
     return this.repository.update(attendance.id, {
       checkOutTime: new Date(),
       notes: updatedNotes,
     });
   }
   ```

2. **Controllers:**
   ```typescript
   // interfaces/controllers/AttendanceController.ts
   POST /api/attendance/check-out
   Body: {
     childId: string,
     classRoomId: string,
     pickupNote: string // Ej: "Madre", "Padre", "Tía María"
   }
   ```

**Frontend (Flutter Web):**

1. **State Management:**
   ```dart
   // state/attendance/attendance_provider.dart
   Future<void> checkOut({
     required String childId,
     required String pickupNote,
   }) async {
     state = state.copyWith(isLoading: true);
     
     try {
       final attendance = await _attendanceService.checkOut(
         CheckOutRequest(
           childId: childId,
           pickupNote: pickupNote,
         ),
       );
       
       // Actualizar lista local
       _updateLocalAttendance(attendance);
       
       state = state.copyWith(
         isLoading: false,
         error: null,
       );
     } catch (e) {
       state = state.copyWith(
         isLoading: false,
         error: e.toString(),
       );
     }
   }
   ```

2. **UI Condicional:**
   ```dart
   // widgets/check_out_dialog.dart
   class CheckOutDialog extends StatefulWidget {
     final _pickupController = TextEditingController();
     
     @override
     Widget build(BuildContext context) {
       return AlertDialog(
         title: Text('Registrar Salida'),
         content: Column(
           mainAxisSize: MainAxisSize.min,
           children: [
             Text('¿Quién recoge al niño?'),
             SizedBox(height: 16),
             TextField(
               controller: _pickupController,
               decoration: InputDecoration(
                 labelText: 'Recogido por *',
                 hintText: 'Ej: Madre, Padre, Tía María',
                 border: OutlineInputBorder(),
               ),
               autofocus: true,
             ),
           ],
         ),
         actions: [
           TextButton(
             onPressed: () => Navigator.pop(context),
             child: Text('Cancelar'),
           ),
           ElevatedButton(
             onPressed: _canSubmit() ? _handleCheckOut : null,
             child: Text('Confirmar'),
           ),
         ],
       );
     }
     
     bool _canSubmit() {
       return _pickupController.text.trim().isNotEmpty;
     }
     
     Future<void> _handleCheckOut() async {
       await context.read<AttendanceNotifier>().checkOut(
         childId: widget.childId,
         pickupNote: _pickupController.text.trim(),
       );
       Navigator.pop(context);
     }
   }
   ```

3. **Validaciones:**
   ```dart
   // validators/check_out_validator.dart
   class CheckOutValidator {
     static ValidationResult validate(CheckOutRequest request) {
       if (request.pickupNote == null || request.pickupNote!.trim().isEmpty) {
         return ValidationResult.error('Información de quién recoge es requerida');
       }
       if (request.pickupNote!.length > 100) {
         return ValidationResult.error('Máximo 100 caracteres');
       }
       return ValidationResult.success();
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Check-out sin check-in previo** | Media | Alto | Validación estricta en service, UI solo muestra presentes |
| **Check-out duplicado** | Media | Medio | Validar checkOutTime IS NULL, deshabilitar botón tras envío |
| **Campo pickupNote vacío** | Alta | Medio | Validación frontend + backend, campo required |
| **Persona no autorizada recoge** | Media | Alto | Post-MVP: lista de autorizados, alertas |
| **Timestamp de check-out < check-in** | Baja | Bajo | Validación de lógica temporal en service |
| **Inconsistencia en estado "retirado"** | Media | Medio | Actualización atómica, transacción DB |
| **Notes field demasiado largo** | Baja | Bajo | Validar longitud máxima en servicio |

**Consideraciones de UX:**
- Mostrar solo niños con check-in (estado "presente")
- Campo de texto simple y rápido
- Sugerencias comunes: "Madre", "Padre", "Autorizado"
- Confirmación visual clara
- Deshacer check-out (dentro de ventana de tiempo)
- Historial de quién ha recogido anteriormente

---

### US-005: Visualización en tiempo real del estado del aula

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Endpoints Optimizados:**
   ```typescript
   // interfaces/controllers/AttendanceController.ts
   GET /api/attendance/classroom/:classRoomId/today
   Response: {
     present: Child[],
     absent: Child[],
     checkedOut: Child[],
     stats: {
       totalEnrolled: number,
       present: number,
       absent: number,
       checkedOut: number,
       percentage: number
     }
   }
   ```

2. **Servicio con Query Optimizada:**
   ```typescript
   // domains/attendance/services/AttendanceService.ts
   async getTodayStatus(classRoomId: string): Promise<ClassRoomDayStatus> {
     const today = new Date().toISOString().split('T')[0];
     
     // Single query con JOIN
     // Nota: 'CHECKED_OUT' es un estado derivado, no existe en el enum AttendanceStatus
     // Se calcula como: status=PRESENT AND check_out_time IS NOT NULL
     const result = await this.prisma.$queryRaw`
       SELECT 
         c.id, c.first_name, c.last_name,
         a.check_in_time, a.check_out_time, a.state,
         CASE 
           WHEN a.check_out_time IS NOT NULL THEN 'CHECKED_OUT'
           WHEN a.check_in_time IS NOT NULL THEN 'PRESENT'
           ELSE 'ABSENT'
         END as status
       FROM child c
       LEFT JOIN attendance a ON c.id = a.child_id 
         AND DATE(a.date) = ${today}
       WHERE c.class_room_id = ${classRoomId}
       ORDER BY c.last_name, c.first_name
     `;
     
     return this.groupByStatus(result);
   }
   ```

**Frontend (Flutter Web):**

1. **State Management Reactivo:**
   ```dart
   // state/attendance/classroom_status_provider.dart
   class ClassRoomStatusState {
     List<Child> present;
     List<Child> absent;
     List<Child> checkedOut; // Derivado: niños con check_out_time != null
     ClassRoomStats stats;
     DateTime lastUpdate;
     bool isLoading;
   }
   
   class ClassRoomStatusNotifier extends StateNotifier<ClassRoomStatusState> {
     Timer? _pollingTimer;
     
     void startPolling(String classRoomId) {
       _pollingTimer = Timer.periodic(
         Duration(seconds: 30),
         (_) => refresh(classRoomId),
       );
     }
     
     void stopPolling() {
       _pollingTimer?.cancel();
     }
     
     Future<void> refresh(String classRoomId) async {
       final status = await _service.getTodayStatus(classRoomId);
       state = ClassRoomStatusState.fromDTO(status);
     }
   }
   ```

2. **UI con Actualización Automática:**
   ```dart
   // pages/classroom_status_page.dart
   class ClassRoomStatusPage extends ConsumerStatefulWidget {
     @override
     Widget build(BuildContext context, WidgetRef ref) {
       final status = ref.watch(classRoomStatusProvider);
       
       useEffect(() {
         ref.read(classRoomStatusProvider.notifier)
            .startPolling(widget.classRoomId);
         return () {
           ref.read(classRoomStatusProvider.notifier).stopPolling();
         };
       }, []);
       
       return Scaffold(
         body: RefreshIndicator(
           onRefresh: () => ref.read(classRoomStatusProvider.notifier)
                               .refresh(widget.classRoomId),
           child: Column(
             children: [
               _buildStats(status.stats),
               _buildStatusTabs(status),
             ],
           ),
         ),
       );
     }
   }
   ```

3. **Widgets Optimizados:**
   ```dart
   // widgets/status_section.dart
   class StatusSection extends StatelessWidget {
     final String title;
     final List<Child> children;
     final Color color;
     
     @override
     Widget build(BuildContext context) {
       return Container(
         decoration: BoxDecoration(
           border: Border(left: BorderSide(color: color, width: 4)),
         ),
         child: Column(
           children: [
             _buildHeader(),
             ListView.builder(
               itemCount: children.length,
               itemBuilder: (context, index) {
                 return ChildTile(child: children[index]);
               },
             ),
           ],
         ),
       );
     }
   }
   ```

4. **Códigos de Color:**
   ```dart
   // utils/status_colors.dart
   class StatusColors {
     static const present = Color(0xFF4CAF50);      // Verde
     static const absent = Color(0xFF9E9E9E);       // Gris
     static const checkedOut = Color(0xFF2196F3);   // Azul
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Queries lentas con muchos niños** | Media | Alto | Índices en BD, paginación, query optimizada con JOIN |
| **Polling excesivo (tráfico)** | Media | Medio | Intervalo 30-60 seg, optimistic updates en UI |
| **Estado desincronizado** | Media | Medio | Timestamps en respuesta, validar versión, optimistic updates |
| **Memory leaks en polling** | Media | Medio | Cancelar timers en dispose, usar ref.onDispose |
| **UI se congela con listas grandes** | Media | Alto | ListView.builder, lazy loading, virtualización |
| **Códigos de color inaccesibles** | Baja | Bajo | Cumplir WCAG 2.1 AA, usar iconos además de color |
| **Actualizaciones perdidas** | Media | Medio | Polling periódico, reconciliación cada 30-60 seg |

**Consideraciones de Performance:**
- Query única optimizada vs múltiples queries
- Cachear resultado por 10-15 segundos
- Lazy loading para aulas con >50 niños
- Minimizar re-renders (memoización)
- Considerar paginación si >100 niños

**Consideraciones de UX:**
- Pull-to-refresh manual
- Indicador de última actualización
- Animaciones suaves en cambios de estado
- Contadores visuales prominentes
- Acceso rápido a detalles de niño

---

### US-009: Registro rápido de incidentes

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Capa de Dominio:**
   ```typescript
   // domains/incidents/entities/Incident.ts
   enum IncidentType {
     POSITIVE = 'POSITIVE',
     NEGATIVE = 'NEGATIVE',
     PEDAGOGICAL = 'PEDAGOGICAL',
     HEALTH = 'HEALTH',
     BEHAVIOR = 'BEHAVIOR',
     ACHIEVEMENT = 'ACHIEVEMENT'
   }
   
   enum DevelopmentArea {
     FINE_MOTOR = 'FINE_MOTOR',
     GROSS_MOTOR = 'GROSS_MOTOR',
     SOCIALIZATION = 'SOCIALIZATION',
     LANGUAGE = 'LANGUAGE',
     AUTONOMY = 'AUTONOMY',
     CREATIVITY = 'CREATIVITY'
   }
   
   class Incident {
     id: string;
     childId: string;
     classRoomId: string;
     dateTime: Date;
     type: IncidentType;
     description: string; // max 500 chars
     tags: DevelopmentArea[];
     recordedBy: string;
     sharedWithFamily: boolean;
     deviceId?: string;
   }
   ```

2. **Validaciones de Dominio:**
   ```typescript
   // domains/incidents/entities/Incident.ts
   class Incident {
     static validate(data: CreateIncidentDto): ValidationResult {
       const errors: string[] = [];
       
       if (!data.description || data.description.trim().length === 0) {
         errors.push('Description is required');
       }
       
       if (data.description && data.description.length > 500) {
         errors.push('Description must be 500 characters or less');
       }
       
       if (!Object.values(IncidentType).includes(data.type)) {
         errors.push('Invalid incident type');
       }
       
       if (data.tags) {
         for (const tag of data.tags) {
           if (!Object.values(DevelopmentArea).includes(tag)) {
             errors.push(`Invalid development area: ${tag}`);
           }
         }
       }
       
       return errors.length > 0 
         ? ValidationResult.error(errors) 
         : ValidationResult.success();
     }
   }
   ```

3. **Repositorio:**
   ```typescript
   // domains/incidents/repositories/IncidentRepository.ts
   interface IIncidentRepository {
     create(incident: Incident): Promise<Incident>;
     findById(id: string): Promise<Incident | null>;
     findByChild(childId: string, filters?: IncidentFilters): Promise<Incident[]>;
     findByClassRoom(classRoomId: string, date: Date): Promise<Incident[]>;
     update(id: string, data: Partial<Incident>): Promise<Incident>;
     delete(id: string): Promise<void>;
   }
   ```

4. **Servicios:**
   ```typescript
   // domains/incidents/services/IncidentService.ts
   class IncidentService {
     async create(dto: CreateIncidentDto, userId: string): Promise<Incident> {
       // Validar dominio
       const validation = Incident.validate(dto);
       if (!validation.isValid) {
         throw new ValidationError(validation.errors);
       }
       
       // Verificar child existe y pertenece al classroom
       await this.validateChildInClassRoom(dto.childId, dto.classRoomId);
       
       // Verificar usuario tiene acceso al classroom
       await this.authService.canAccessClassRoom(userId, dto.classRoomId);
       
       // Crear incidente
       const incident = new Incident({
         ...dto,
         id: uuidv4(),
         dateTime: new Date(),
         recordedBy: userId,
         sharedWithFamily: false, // Default
       });
       
       // Persistir
       const created = await this.repository.create(incident);
       
       // Emitir evento de dominio
       this.eventBus.emit('IncidentCreated', created);
       
       return created;
     }
   }
   ```

5. **Controllers:**
   ```typescript
   // interfaces/controllers/IncidentController.ts
   POST /api/incidents
   Body: {
     childId: string,
     classRoomId: string,
     type: IncidentType,
     description: string,
     tags?: DevelopmentArea[]
   }
   Response: { incident: Incident }
   
   GET /api/incidents/child/:childId
   GET /api/incidents/classroom/:classRoomId/today
   ```

6. **Schema Prisma:**
   ```prisma
   model Incident {
     id              String   @id @default(uuid())
     childId         String   @map("child_id")
     classRoomId     String   @map("class_room_id")
     dateTime        DateTime @map("date_time") @default(now())
     type            String
     description     String   @db.VarChar(500)
     tags            String[]
     recordedBy      String   @map("recorded_by")
     sharedWithFamily Boolean @map("shared_with_family") @default(false)
     
     child      Child     @relation(fields: [childId], references: [id])
     classRoom  ClassRoom @relation(fields: [classRoomId], references: [id])
     user       User      @relation(fields: [recordedBy], references: [id])
     
     @@index([childId, dateTime])
     @@index([classRoomId, dateTime])
     @@map("incident")
   }
   ```

**Frontend (Flutter Web):**

1. **State Management:**
   ```dart
   // state/incidents/incident_provider.dart
   class IncidentState {
     List<Incident> incidents;
     bool isLoading;
     String? error;
   }
   
   class IncidentNotifier extends StateNotifier<IncidentState> {
     Future<void> createIncident({
       required String childId,
       required IncidentType type,
       required String description,
       List<DevelopmentArea>? tags,
     }) async {
       state = state.copyWith(isLoading: true);
       
       try {
         final incident = await _incidentService.create(
           CreateIncidentRequest(
             childId: childId,
             classRoomId: _currentClassRoomId,
             type: type,
             description: description,
             tags: tags,
           ),
         );
         
         state = state.copyWith(
           incidents: [...state.incidents, incident],
           isLoading: false,
         );
       } catch (e) {
         state = state.copyWith(
           isLoading: false,
           error: e.toString(),
         );
       }
     }
   }
   ```

2. **UI de Registro Rápido:**
   ```dart
   // pages/create_incident_page.dart
   class CreateIncidentPage extends StatefulWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(title: Text('Nuevo Incidente')),
         body: Form(
           key: _formKey,
           child: ListView(
             padding: EdgeInsets.all(16),
             children: [
               // 1. Selector de niño
               ChildDropdown(
                 selectedChildId: _selectedChildId,
                 onChanged: (childId) {
                   setState(() => _selectedChildId = childId);
                 },
               ),
               
               SizedBox(height: 16),
               
               // 2. Selector de categoría (chips)
               Text('Categoría *', style: Theme.of(context).textTheme.subtitle1),
               Wrap(
                 spacing: 8,
                 children: IncidentType.values.map((type) {
                   return ChoiceChip(
                     label: Text(type.displayName),
                     selected: _selectedType == type,
                     onSelected: (selected) {
                       setState(() => _selectedType = type);
                     },
                   );
                 }).toList(),
               ),
               
               SizedBox(height: 16),
               
               // 3. Campo de descripción
               TextFormField(
                 controller: _descriptionController,
                 decoration: InputDecoration(
                   labelText: 'Descripción *',
                   hintText: 'Describe brevemente lo ocurrido',
                   counterText: '${_descriptionController.text.length}/500',
                   border: OutlineInputBorder(),
                 ),
                 maxLength: 500,
                 maxLines: 4,
                 validator: (value) {
                   if (value == null || value.trim().isEmpty) {
                     return 'La descripción es obligatoria';
                   }
                   return null;
                 },
                 onChanged: (value) {
                   setState(() {}); // Update counter
                 },
               ),
               
               SizedBox(height: 16),
               
               // 4. Áreas de desarrollo (opcional)
               Text('Áreas de desarrollo (opcional)'),
               Wrap(
                 spacing: 8,
                 children: DevelopmentArea.values.map((area) {
                   return FilterChip(
                     label: Text(area.displayName),
                     selected: _selectedAreas.contains(area),
                     onSelected: (selected) {
                       setState(() {
                         if (selected) {
                           _selectedAreas.add(area);
                         } else {
                           _selectedAreas.remove(area);
                         }
                       });
                     },
                   );
                 }).toList(),
               ),
               
               SizedBox(height: 24),
               
               // 5. Botón de guardar
               ElevatedButton(
                 onPressed: _canSubmit() ? _handleSubmit : null,
                 child: Text('Guardar Incidente'),
               ),
             ],
           ),
         ),
       );
     }
     
     bool _canSubmit() {
       return _selectedChildId != null &&
              _selectedType != null &&
              _descriptionController.text.trim().isNotEmpty &&
              !_isSubmitting;
     }
     
     Future<void> _handleSubmit() async {
       if (!_formKey.currentState!.validate()) return;
       
       setState(() => _isSubmitting = true);
       
       try {
         await context.read<IncidentNotifier>().createIncident(
           childId: _selectedChildId!,
           type: _selectedType!,
           description: _descriptionController.text.trim(),
           tags: _selectedAreas.isEmpty ? null : _selectedAreas,
         );
         
         Navigator.of(context).pop();
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Incidente registrado')),
         );
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error: ${e.toString()}')),
         );
       } finally {
         setState(() => _isSubmitting = false);
       }
     }
   }
   ```

3. **Validaciones:**
   ```dart
   // validators/incident_validator.dart
   class IncidentValidator {
     static String? validateDescription(String? value) {
       if (value == null || value.trim().isEmpty) {
         return 'La descripción es obligatoria';
       }
       if (value.length > 500) {
         return 'Máximo 500 caracteres';
       }
       return null;
     }
   }
   ```

4. **Modelos:**
   ```dart
   // models/incident.dart
   class Incident {
     final String id;
     final String childId;
     final String classRoomId;
     final DateTime dateTime;
     final IncidentType type;
     final String description;
     final List<DevelopmentArea> tags;
     final String recordedBy;
     final bool sharedWithFamily;
     
     Incident({
       required this.id,
       required this.childId,
       required this.classRoomId,
       required this.dateTime,
       required this.type,
       required this.description,
       required this.tags,
       required this.recordedBy,
       required this.sharedWithFamily,
     });
     
     factory Incident.fromJson(Map<String, dynamic> json) {
       return Incident(
         id: json['id'],
         childId: json['childId'],
         classRoomId: json['classRoomId'],
         dateTime: DateTime.parse(json['dateTime']),
         type: IncidentType.values.firstWhere(
           (e) => e.toString() == 'IncidentType.${json['type']}',
         ),
         description: json['description'],
         tags: (json['tags'] as List<dynamic>)
           .map((t) => DevelopmentArea.values.firstWhere(
             (e) => e.toString() == 'DevelopmentArea.$t',
           ))
           .toList(),
         recordedBy: json['recordedBy'],
         sharedWithFamily: json['sharedWithFamily'],
       );
     }
   }
   
   enum IncidentType {
     POSITIVE,
     NEGATIVE,
     PEDAGOGICAL,
     HEALTH,
     BEHAVIOR,
     ACHIEVEMENT;
     
     String get displayName {
       switch (this) {
         case IncidentType.POSITIVE:
           return 'Positivo';
         case IncidentType.NEGATIVE:
           return 'Negativo';
         case IncidentType.PEDAGOGICAL:
           return 'Pedagógico';
         case IncidentType.HEALTH:
           return 'Salud';
         case IncidentType.BEHAVIOR:
           return 'Comportamiento';
         case IncidentType.ACHIEVEMENT:
           return 'Logro';
       }
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Descripción vacía o inválida** | Alta | Medio | Validación frontend + backend, campo required |
| **Descripción >500 caracteres** | Media | Bajo | Validación con contador en tiempo real, maxLength en TextField |
| **Tipo de incidente inválido** | Baja | Medio | Enum validation en backend, ChoiceChip en frontend |
| **Tags inválidos** | Baja | Bajo | Validación de enum values, FilterChip controlados |
| **Relación child-classroom incorrecta** | Media | Alto | Validación en service, verificar FK |
| **UI compleja ralentiza registro** | Media | Medio | Mantener flujo simple, campos opcionales al final |
| **Pérdida de datos en error de red** | Media | Alto | Draft local, retry mechanism, feedback claro |

**Consideraciones de Performance:**
- API call debe completar en <2 segundos
- Validaciones síncronas en frontend
- Debouncing en contador de caracteres
- Optimistic updates para feedback rápido

**Consideraciones de UX:**
- Flujo lineal top-down
- Campos obligatorios claros (*)
- Contador de caracteres visible
- Categorías con iconos y colores
- Confirmación visual al guardar
- Mantener contexto (niño pre-seleccionado)

---

### US-010: Control de visibilidad de incidentes

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Uso de Campo Existente:**
   ```typescript
   // domains/incidents/entities/Incident.ts
   class Incident {
     // ... campos existentes
     sharedWithFamily: boolean; // Default: false
     // No se agregan campos adicionales para auditoría en MVP
   }
   ```

2. **Validaciones de Negocio:**
   ```typescript
   // domains/incidents/services/IncidentService.ts
   async updateVisibility(
     incidentId: string,
     sharedWithFamily: boolean,
     userId: string
   ): Promise<Incident> {
     const incident = await this.repository.findById(incidentId);
     
     if (!incident) {
       throw new NotFoundError('Incident not found');
     }
     
     // Verificar permisos
     const user = await this.userRepository.findById(userId);
     
     // Solo el autor o directivos pueden cambiar
     if (incident.recordedBy !== userId && user.role !== Role.DIRECTOR) {
       throw new ForbiddenError('Only author or director can change visibility');
     }
     
     return this.repository.update(incidentId, {
       sharedWithFamily,
     });
   }
   ```

3. **Filtrado para Resumen Diario:**
   ```typescript
   // domains/incidents/services/IncidentService.ts
   async getShareableIncidents(
     childId: string,
     date: Date
   ): Promise<Incident[]> {
     return this.repository.findByChild(childId, {
       date,
       sharedWithFamily: true,
     });
   }
   
   async getInternalIncidents(
     childId: string,
     date: Date,
     userId: string
   ): Promise<Incident[]> {
     // Verificar usuario es docente o directivo
     await this.authService.requireRole(userId, [Role.TEACHER, Role.DIRECTOR]);
     
     return this.repository.findByChild(childId, {
       date,
       sharedWithFamily: false,
     });
   }
   ```

4. **Controllers:**
   ```typescript
   // interfaces/controllers/IncidentController.ts
   PATCH /api/incidents/:id/visibility
   Body: { sharedWithFamily: boolean }
   Response: { incident: Incident }
   
   // Middleware de autorización
   router.patch(
     '/incidents/:id/visibility',
     authenticateToken,
     requirePermission(Permission.UPDATE_INCIDENT_VISIBILITY),
     IncidentController.updateVisibility
   );
   ```

5. **Schema Prisma:**
   ```prisma
   model Incident {
     // ... campos existentes del modelo (sin campos adicionales)
     // Usa sharedWithFamily Boolean @default(false) que ya existe
     
     @@index([childId, sharedWithFamily])
     @@index([classRoomId, sharedWithFamily])
   }
   ```

**Nota:** No se agregan campos nuevos al modelo. Se utiliza únicamente el campo `sharedWithFamily` existente.

**Frontend (Flutter Web):**

1. **UI en Formulario de Creación:**
   ```dart
   // pages/create_incident_page.dart
   class CreateIncidentPage extends StatefulWidget {
     bool _sharedWithFamily = false; // Default: false
     
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         body: Form(
           child: Column(
             children: [
               // ... otros campos
               
               SizedBox(height: 16),
               
               // Selector de visibilidad
               Card(
                 child: Padding(
                   padding: EdgeInsets.all(16),
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       Text(
                         'Visibilidad',
                         style: Theme.of(context).textTheme.subtitle1,
                       ),
                       SizedBox(height: 8),
                       RadioListTile<bool>(
                         title: Text('Solo interno'),
                         subtitle: Text('Visible únicamente para docentes y directivos'),
                         value: false,
                         groupValue: _sharedWithFamily,
                         onChanged: (value) {
                           setState(() => _sharedWithFamily = value!);
                         },
                       ),
                       RadioListTile<bool>(
                         title: Text('Compartir con familia'),
                         subtitle: Text('Se incluirá en el resumen diario'),
                         value: true,
                         groupValue: _sharedWithFamily,
                         onChanged: (value) {
                           setState(() => _sharedWithFamily = value!);
                         },
                       ),
                     ],
                   ),
                 ),
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

2. **Indicador Visual en Lista:**
   ```dart
   // widgets/incident_tile.dart
   class IncidentTile extends StatelessWidget {
     final Incident incident;
     
     @override
     Widget build(BuildContext context) {
       return ListTile(
         leading: CircleAvatar(
           backgroundColor: _getTypeColor(incident.type),
           child: Icon(_getTypeIcon(incident.type)),
         ),
         title: Text(incident.description),
         subtitle: Text(
           _formatDateTime(incident.dateTime),
         ),
         trailing: Row(
           mainAxisSize: MainAxisSize.min,
           children: [
             if (incident.sharedWithFamily)
               Chip(
                 label: Text('Compartido'),
                 backgroundColor: Colors.green[100],
                 avatar: Icon(Icons.family_restroom, size: 16),
               )
             else
               Chip(
                 label: Text('Interno'),
                 backgroundColor: Colors.grey[300],
                 avatar: Icon(Icons.lock, size: 16),
               ),
             
             // Botón de edición (solo autor o directivo)
             if (_canEdit(incident))
               IconButton(
                 icon: Icon(Icons.edit),
                 onPressed: () => _showVisibilityDialog(incident),
               ),
           ],
         ),
       );
     }
     
     bool _canEdit(Incident incident) {
       final user = context.read<AuthNotifier>().user;
       return incident.recordedBy == user.id || user.role == Role.DIRECTOR;
     }
   }
   ```

3. **Dialog de Cambio de Visibilidad:**
   ```dart
   // widgets/change_visibility_dialog.dart
   class ChangeVisibilityDialog extends StatelessWidget {
     final Incident incident;
     
     @override
     Widget build(BuildContext context) {
       return AlertDialog(
         title: Text('Cambiar visibilidad'),
         content: Column(
           mainAxisSize: MainAxisSize.min,
           children: [
             Text('¿Deseas cambiar la visibilidad de este incidente?'),
             SizedBox(height: 16),
             if (incident.sharedWithFamily)
               Text('Se ocultará del resumen familiar')
             else
               Text('Se incluirá en el resumen familiar'),
           ],
         ),
         actions: [
           TextButton(
             onPressed: () => Navigator.pop(context),
             child: Text('Cancelar'),
           ),
           ElevatedButton(
             onPressed: () async {
               await context.read<IncidentNotifier>().updateVisibility(
                 incident.id,
                 !incident.sharedWithFamily,
               );
               Navigator.pop(context);
             },
             child: Text('Confirmar'),
           ),
         ],
       );
     }
   }
   ```

4. **State Management:**
   ```dart
   // state/incidents/incident_provider.dart
   Future<void> updateVisibility(
     String incidentId,
     bool sharedWithFamily,
   ) async {
     state = state.copyWith(isLoading: true);
     
     try {
       final updatedIncident = await _incidentService.updateVisibility(
         incidentId,
         sharedWithFamily,
       );
       
       // Actualizar lista local
       final updatedList = state.incidents.map((i) {
         return i.id == incidentId ? updatedIncident : i;
       }).toList();
       
       state = state.copyWith(
         incidents: updatedList,
         isLoading: false,
       );
     } catch (e) {
       state = state.copyWith(
         isLoading: false,
         error: e.toString(),
       );
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Compartir accidentalmente info sensible** | Alta | Crítico | Default "Solo interno", confirmación explícita |
| **Usuario no autorizado cambia visibilidad** | Media | Alto | Validación de permisos en backend, UI condicional |
| **Inconsistencia en filtro de resumen** | Media | Alto | Query con WHERE sharedWithFamily = true, tests |
| **Confusión sobre estado de visibilidad** | Media | Medio | Indicadores visuales claros (iconos + color) |
| **Auditoría insuficiente de cambios** | Baja | Medio | Post-MVP: implementar tabla de audit log |
| **Cambios masivos erróneos** | Baja | Alto | No permitir cambio masivo en MVP, individual solo |

**Consideraciones de Seguridad:**
- NUNCA confiar en filtrado frontend
- Validar permisos en cada request
- Auditar todos los cambios de visibilidad
- Logs de acceso a incidentes

**Consideraciones de UX:**
- Default seguro (solo interno)
- Explicación clara de cada opción
- Confirmación antes de compartir
- Indicadores visuales distintos
- Posibilidad de deshacer (ventana corta)

---

### US-014: Cifrado de datos locales

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Configuración de PostgreSQL con Cifrado:**
   ```typescript
   // infrastructure/database/encryption.config.ts
   import { config } from 'dotenv';
   import crypto from 'crypto';
   
   export class EncryptionConfig {
     private static readonly ALGORITHM = 'aes-256-gcm';
     private static readonly KEY_LENGTH = 32; // 256 bits
     private static readonly IV_LENGTH = 16;
     private static readonly SALT_LENGTH = 64;
     
     private static encryptionKey: Buffer;
     
     static initialize() {
       const key = process.env.ENCRYPTION_KEY;
       if (!key) {
         throw new Error('ENCRYPTION_KEY not found in environment');
       }
       
       // Derive key from passphrase
       this.encryptionKey = crypto.scryptSync(
         key,
         process.env.ENCRYPTION_SALT || 'default-salt',
         this.KEY_LENGTH
       );
     }
     
     static encrypt(plaintext: string): string {
       const iv = crypto.randomBytes(this.IV_LENGTH);
       const cipher = crypto.createCipheriv(
         this.ALGORITHM,
         this.encryptionKey,
         iv
       );
       
       let encrypted = cipher.update(plaintext, 'utf8', 'hex');
       encrypted += cipher.final('hex');
       
       const authTag = cipher.getAuthTag();
       
       // Format: iv:authTag:encrypted
       return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
     }
     
     static decrypt(ciphertext: string): string {
       const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
       
       const iv = Buffer.from(ivHex, 'hex');
       const authTag = Buffer.from(authTagHex, 'hex');
       
       const decipher = crypto.createDecipheriv(
         this.ALGORITHM,
         this.encryptionKey,
         iv
       );
       
       decipher.setAuthTag(authTag);
       
       let decrypted = decipher.update(encrypted, 'hex', 'utf8');
       decrypted += decipher.final('utf8');
       
       return decrypted;
     }
   }
   ```

2. **Middleware de Cifrado Transparente:**
   ```typescript
   // infrastructure/prisma/middleware/encryption.middleware.ts
   export const encryptionMiddleware: Prisma.Middleware = async (params, next) => {
     const sensitiveFields = ['notes', 'allergies', 'description'];
     const sensitiveModels = ['Child', 'Incident', 'Attendance'];
     
     // Encrypt on CREATE/UPDATE
     if (
       (params.action === 'create' || params.action === 'update') &&
       sensitiveModels.includes(params.model)
     ) {
       for (const field of sensitiveFields) {
         if (params.args.data[field]) {
           params.args.data[field] = EncryptionConfig.encrypt(
             params.args.data[field]
           );
         }
       }
     }
     
     const result = await next(params);
     
     // Decrypt on READ
     if (
       (params.action === 'findUnique' || 
        params.action === 'findFirst' || 
        params.action === 'findMany') &&
       sensitiveModels.includes(params.model)
     ) {
       if (Array.isArray(result)) {
         for (const item of result) {
           for (const field of sensitiveFields) {
             if (item[field]) {
               item[field] = EncryptionConfig.decrypt(item[field]);
             }
           }
         }
       } else if (result) {
         for (const field of sensitiveFields) {
           if (result[field]) {
             result[field] = EncryptionConfig.decrypt(result[field]);
           }
         }
       }
     }
     
     return result;
   };
   ```

3. **Inicialización en App:**
   ```typescript
   // index.ts
   import { PrismaClient } from '@prisma/client';
   import { encryptionMiddleware } from './infrastructure/prisma/middleware';
   import { EncryptionConfig } from './infrastructure/database/encryption.config';
   
   // Inicializar cifrado
   EncryptionConfig.initialize();
   
   // Configurar Prisma con middleware
   const prisma = new PrismaClient();
   prisma.$use(encryptionMiddleware);
   ```

4. **Variables de Entorno:**
   ```bash
   # .env
   ENCRYPTION_KEY=<strong-passphrase-min-32-chars>
   ENCRYPTION_SALT=<random-salt-64-chars>
   
   # Generación segura:
   # node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

**Frontend (Flutter Web):**

**Nota Importante:** Para Flutter Web, el cifrado local es más complejo debido a las limitaciones del navegador. Las opciones son:

1. **Opción 1: IndexedDB con Web Crypto API** (Recomendado)
   ```dart
   // utils/web_encryption.dart
   import 'dart:typed_data';
   import 'package:crypto/crypto.dart';
   import 'package:encrypt/encrypt.dart' as encrypt;
   import 'package:flutter_secure_storage/flutter_secure_storage.dart';
   
   class WebEncryption {
     static const _storage = FlutterSecureStorage();
     static const _keyName = 'kindertrack_encryption_key';
     
     static Future<void> initialize() async {
       // Generar o recuperar clave de cifrado
       String? key = await _storage.read(key: _keyName);
       
       if (key == null) {
         // Generar nueva clave
         final random = SecureRandom();
         key = base64Encode(random.nextBytes(32));
         await _storage.write(key: _keyName, value: key);
       }
     }
     
     static Future<String> encrypt(String plaintext) async {
       final keyString = await _storage.read(key: _keyName);
       final key = encrypt.Key.fromBase64(keyString!);
       final iv = encrypt.IV.fromSecureRandom(16);
       
       final encrypter = encrypt.Encrypter(
         encrypt.AES(key, mode: encrypt.AESMode.gcm),
       );
       
       final encrypted = encrypter.encrypt(plaintext, iv: iv);
       
       // Format: iv:encrypted
       return '${iv.base64}:${encrypted.base64}';
     }
     
     static Future<String> decrypt(String ciphertext) async {
       final parts = ciphertext.split(':');
       final iv = encrypt.IV.fromBase64(parts[0]);
       final encrypted = encrypt.Encrypted.fromBase64(parts[1]);
       
       final keyString = await _storage.read(key: _keyName);
       final key = encrypt.Key.fromBase64(keyString!);
       
       final encrypter = encrypt.Encrypter(
         encrypt.AES(key, mode: encrypt.AESMode.gcm),
       );
       
       return encrypter.decrypt(encrypted, iv: iv);
     }
   }
   ```

2. **Opción 2: Confiar en TLS + Backend Encryption** (MVP Simplificado)
   ```dart
   // Para MVP, dado que es web-based y los datos se persisten en backend:
   // - Toda comunicación via HTTPS (TLS 1.3)
   // - Cifrado en backend con AES-256
   // - No almacenar datos sensibles en localStorage/IndexedDB
   // - Session storage para datos temporales
   ```

3. **Almacenamiento Local Seguro:**
   ```dart
   // services/local_storage_service.dart
   import 'package:hive_flutter/hive_flutter.dart';
   
   class LocalStorageService {
     static late Box _secureBox;
     
     static Future<void> initialize() async {
       await Hive.initFlutter();
       
       // Clave de cifrado para Hive
       final encryptionKey = await _getOrCreateEncryptionKey();
       
       _secureBox = await Hive.openBox(
         'kindertrack_secure',
         encryptionCipher: HiveAesCipher(encryptionKey),
       );
     }
     
     static Future<Uint8List> _getOrCreateEncryptionKey() async {
       const storage = FlutterSecureStorage();
       String? keyString = await storage.read(key: 'hive_encryption_key');
       
       if (keyString == null) {
         final key = Hive.generateSecureKey();
         keyString = base64Encode(key);
         await storage.write(key: 'hive_encryption_key', value: keyString);
         return Uint8List.fromList(key);
       }
       
       return base64Decode(keyString);
     }
     
     static Future<void> saveSecure(String key, dynamic value) async {
       await _secureBox.put(key, value);
     }
     
     static T? getSecure<T>(String key) {
       return _secureBox.get(key) as T?;
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Clave de cifrado comprometida** | Media | Crítico | Rotar claves periódicamente, key management system |
| **Performance degradation** | Media | Alto | Benchmark, índices apropiados, caché selectivo |
| **Pérdida de clave = pérdida de datos** | Baja | Crítico | Backup de claves, múltiples mecanismos de recuperación |
| **Cifrado incorrecto (ECB mode)** | Baja | Alto | Usar GCM mode, auditoría de código, tests |
| **Claves en código fuente** | Media | Crítico | Variables de entorno, never commit .env, .gitignore |
| **Middleware bypass** | Baja | Crítico | Tests exhaustivos, code review, no raw queries |
| **Flutter Web: localStorage no seguro** | Alta | Alto | No almacenar datos sensibles, session only, HTTPS |
| **Ataque timing** | Baja | Medio | Usar funciones constant-time para comparaciones |

**Consideraciones de Performance:**
- Benchmark encrypt/decrypt (target: <1ms por operación)
- Considerar campos que realmente necesitan cifrado
- Caché de datos descifrados en memoria (con límite)
- Índices en campos no cifrados para búsquedas

**Consideraciones de Seguridad:**
- AES-256-GCM (authenticated encryption)
- Claves nunca en código fuente
- IV único por operación
- Rotar claves periódicamente (post-MVP)
- Key derivation con scrypt o PBKDF2
- Secure key storage (HSM para producción)

**Testing:**
- Test encrypt → decrypt = plaintext
- Test con datos vacíos, null, strings largos
- Test de performance con datasets realistas
- Test de integridad (auth tag)

---

## Análisis de Historias de Alta Prioridad

### US-006: Registro de ausencia justificada

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

**Nota Importante:** Utilizaremos el campo `notes` existente en el modelo Attendance para almacenar información sobre la ausencia justificada, sin necesidad de extender el modelo.

1. **Servicio:**
   ```typescript
   // domains/attendance/services/AttendanceService.ts
   async recordJustifiedAbsence(dto: RecordAbsenceDto, userId: string): Promise<Attendance> {
     // Validar permisos
     await this.authService.requirePermission(
       userId,
       Permission.CREATE_ATTENDANCE
     );
     
     // Validar que la nota de ausencia no esté vacía
     if (!dto.absenceNote || dto.absenceNote.trim().length === 0) {
       throw new ValidationError('Absence note is required');
     }
     
     if (dto.absenceNote.length > 200) {
       throw new ValidationError('Absence note max 200 characters');
     }
     
     // Verificar no existe registro para mismo día
     const existing = await this.repository.findByChildAndDate(
       dto.childId,
       dto.date
     );
     
     if (existing) {
       throw new ValidationError('Attendance record already exists for this date');
     }
     
     // Crear registro de ausencia usando campo notes para la justificación
     const attendance = new Attendance({
       id: uuidv4(),
       childId: dto.childId,
       classRoomId: dto.classRoomId,
       date: dto.date,
       status: AttendanceStatus.ABSENT,
       notes: `Ausencia justificada: ${dto.absenceNote}`,
       recordedBy: userId,
     });
     
     return this.repository.create(attendance);
   }
   
   // Permitir registro anticipado
   async recordFutureAbsence(dto: RecordAbsenceDto, userId: string): Promise<Attendance> {
     const today = new Date().toDateString();
     const absenceDate = new Date(dto.date).toDateString();
     
     if (new Date(absenceDate) < new Date(today)) {
       throw new ValidationError('Cannot record absence for past dates');
     }
     
     return this.recordJustifiedAbsence(dto, userId);
   }
   ```

2. **Controllers:**
   ```typescript
   POST /api/attendance/absence
   Body: {
     childId: string,
     classRoomId: string,
     date: string (ISO),
     absenceNote: string // Motivo de la ausencia (max 200 chars)
   }
   ```

**Frontend (Flutter Web):**

1. **UI de Registro:**
   ```dart
   // widgets/record_absence_dialog.dart
   class RecordAbsenceDialog extends StatefulWidget {
     final _noteController = TextEditingController();
     
     @override
     Widget build(BuildContext context) {
       return AlertDialog(
         title: Text('Registrar Ausencia Justificada'),
         content: Column(
           mainAxisSize: MainAxisSize.min,
           children: [
             // Selector de fecha
             DatePicker(
               selectedDate: _selectedDate,
               onChanged: (date) => setState(() => _selectedDate = date),
               firstDate: DateTime.now(),
               lastDate: DateTime.now().add(Duration(days: 30)),
             ),
             
             SizedBox(height: 16),
             
             // Campo de motivo
             TextField(
               controller: _noteController,
               decoration: InputDecoration(
                 labelText: 'Motivo de ausencia *',
                 hintText: 'Ej: Enfermedad, Cita médica, Viaje familiar',
                 border: OutlineInputBorder(),
                 counterText: '${_noteController.text.length}/200',
               ),
               maxLength: 200,
               maxLines: 2,
               autofocus: true,
               onChanged: (_) => setState(() {}),
             ),
           ],
         ),
         actions: [
           TextButton(
             onPressed: () => Navigator.pop(context),
             child: Text('Cancelar'),
           ),
           ElevatedButton(
             onPressed: _canSubmit() ? _handleSubmit : null,
             child: Text('Registrar'),
           ),
         ],
       );
     }
     
     bool _canSubmit() {
       return _selectedDate != null && 
              _noteController.text.trim().isNotEmpty;
     }
     
     Future<void> _handleSubmit() async {
       await context.read<AttendanceNotifier>().recordJustifiedAbsence(
         childId: widget.childId,
         date: _selectedDate!,
         absenceNote: _noteController.text.trim(),
       );
       Navigator.pop(context);
     }
   }
   ```

2. **Indicador Visual:**
   ```dart
   // widgets/child_status_tile.dart
   Widget build(BuildContext context) {
     return ListTile(
       title: Text(child.fullName),
       subtitle: attendance != null && attendance.isJustified
         ? Text(
             'Ausencia justificada: ${attendance.absenceReason.displayName}',
             style: TextStyle(color: Colors.orange),
           )
         : Text('Ausente'),
       trailing: Icon(
         attendance?.isJustified == true 
           ? Icons.event_note 
           : Icons.cancel,
         color: attendance?.isJustified == true 
           ? Colors.orange 
           : Colors.grey,
       ),
     );
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Registro de ausencia cuando ya asistió** | Media | Medio | Validar no existe check-in, UI mostrar solo ausentes |
| **Descripción faltante para OTHER** | Alta | Bajo | Validación frontend + backend, campo required |
| **Registro de fechas pasadas** | Media | Bajo | Validación de fecha, permitir solo hoy o futuro |
| **Inconsistencia en reportes** | Media | Medio | Diferenciar justificada vs no justificada en queries |

---

### US-008: Corrección de registros de asistencia

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Servicio de Corrección:**
   ```typescript
   // domains/attendance/services/AttendanceService.ts
   async correctAttendance(
     attendanceId: string,
     updates: PartialUpdateAttendanceDto,
     userId: string
   ): Promise<Attendance> {
     const attendance = await this.repository.findById(attendanceId);
     
     if (!attendance) {
       throw new NotFoundError('Attendance not found');
     }
     
     // Verificar ventana de 24 horas
     const now = new Date();
     const createdAt = attendance.checkInTime || attendance.dateTime;
     const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
     
     if (hoursDiff > 24) {
       // Solo directivos pueden corregir después de 24h
       const user = await this.userRepository.findById(userId);
       if (user.role !== Role.DIRECTOR) {
         throw new ForbiddenError('Correction window expired (24h)');
       }
     }
     
     // Verificar permisos (autor o directivo)
     const user = await this.userRepository.findById(userId);
     if (attendance.recordedBy !== userId && user.role !== Role.DIRECTOR) {
       throw new ForbiddenError('Only author or director can correct');
     }
     
     // Aplicar corrección
     return this.repository.update(attendanceId, updates);
   }
   ```

2. **Controllers:**
   ```typescript
   PATCH /api/attendance/:id
   Body: {
     checkInTime?: Date,
     checkOutTime?: Date,
     state?: ChildState,
     notes?: string,
     pickedUpBy?: PickupPerson
   }
   ```

**Frontend (Flutter Web):**

1. **UI de Edición:**
   ```dart
   // pages/edit_attendance_page.dart
   class EditAttendancePage extends StatefulWidget {
     final Attendance attendance;
     
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(title: Text('Corregir Asistencia')),
         body: Form(
           child: Column(
             children: [
               // Mostrar tiempo transcurrido
               if (_hoursSinceCreation() > 20)
                 WarningBanner(
                   text: 'Quedan ${24 - _hoursSinceCreation().round()}h para corrección',
                 ),
               
               // Campos editables
               TimePicker(
                 label: 'Hora de llegada',
                 initialTime: attendance.checkInTime,
                 onChanged: (time) => _checkInTime = time,
               ),
               
               // ... otros campos
               
               ElevatedButton(
                 onPressed: _handleUpdate,
                 child: Text('Guardar corrección'),
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Corrección después de 24h sin permiso** | Alta | Medio | Validación estricta de ventana temporal |
| **Usuario no autorizado corrige** | Media | Alto | Validación de permisos backend |
| **Pérdida de historial de cambios** | Media | Medio | Post-MVP: audit log de cambios |

---

### US-011: Consulta de incidentes por niño

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Filtros Avanzados:**
   ```typescript
   // domains/incidents/repositories/IncidentRepository.ts
   interface IncidentFilters {
     types?: IncidentType[];
     tags?: DevelopmentArea[];
     dateFrom?: Date;
     dateTo?: Date;
     sharedWithFamily?: boolean;
     search?: string;
   }
   
   async findByChild(
     childId: string,
     filters?: IncidentFilters
   ): Promise<Incident[]> {
     const whereClause: any = { childId };
     
     if (filters?.types) {
       whereClause.type = { in: filters.types };
     }
     
     if (filters?.tags) {
       whereClause.tags = { hasSome: filters.tags };
     }
     
     if (filters?.dateFrom || filters?.dateTo) {
       whereClause.dateTime = {};
       if (filters.dateFrom) {
         whereClause.dateTime.gte = filters.dateFrom;
       }
       if (filters.dateTo) {
         whereClause.dateTime.lte = filters.dateTo;
       }
     }
     
     if (filters?.sharedWithFamily !== undefined) {
       whereClause.sharedWithFamily = filters.sharedWithFamily;
     }
     
     if (filters?.search) {
       whereClause.description = {
         contains: filters.search,
         mode: 'insensitive',
       };
     }
     
     return this.prisma.incident.findMany({
       where: whereClause,
       orderBy: { dateTime: 'desc' },
       include: {
         user: { select: { firstName: true, lastName: true } },
       },
     });
   }
   ```

2. **Controllers:**
   ```typescript
   GET /api/incidents/child/:childId
   Query params:
     ?types=POSITIVE,HEALTH
     &tags=SOCIALIZATION
     &dateFrom=2026-01-01
     &dateTo=2026-01-21
     &search=fiebre
     &sharedWithFamily=true
   ```

**Frontend (Flutter Web):**

1. **UI con Filtros:**
   ```dart
   // pages/child_incidents_page.dart
   class ChildIncidentsPage extends ConsumerStatefulWidget {
     @override
     Widget build(BuildContext context, WidgetRef ref) {
       final incidents = ref.watch(childIncidentsProvider(widget.childId));
       
       return Scaffold(
         appBar: AppBar(
           title: Text('Incidentes de ${widget.childName}'),
           actions: [
             IconButton(
               icon: Icon(Icons.filter_list),
               onPressed: () => _showFilterDialog(),
             ),
             IconButton(
               icon: Icon(Icons.search),
               onPressed: () => _showSearchDialog(),
             ),
           ],
         ),
         body: Column(
           children: [
             // Chips de filtros activos
             if (_hasActiveFilters())
               _buildActiveFiltersChips(),
             
             // Lista de incidentes
             Expanded(
               child: incidents.when(
                 data: (list) => ListView.builder(
                   itemCount: list.length,
                   itemBuilder: (context, index) {
                     return IncidentTile(incident: list[index]);
                   },
                 ),
                 loading: () => CircularProgressIndicator(),
                 error: (err, stack) => ErrorWidget(err),
               ),
             ),
           ],
         ),
       );
     }
     
     void _showFilterDialog() {
       showDialog(
         context: context,
         builder: (context) => IncidentFilterDialog(
           initialFilters: _currentFilters,
           onApply: (filters) {
             setState(() => _currentFilters = filters);
             ref.read(childIncidentsProvider(widget.childId).notifier)
                .applyFilters(filters);
           },
         ),
       );
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Queries lentas con muchos incidentes** | Media | Alto | Índices, paginación, límite de resultados |
| **Búsqueda de texto lenta** | Media | Medio | Full-text search (PostgreSQL), índice GIN |
| **Filtros complejos confunden usuario** | Media | Bajo | UI intuitiva, presets comunes |

---

### US-012: Generación de resumen diario

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Servicio de Generación:**
   ```typescript
   // domains/reports/services/DailySummaryService.ts
   class DailySummaryService {
     async generateDailySummary(
       childId: string,
       date: Date
     ): Promise<DailySummary> {
       // 1. Obtener asistencia del día
       const attendance = await this.attendanceRepo.findByChildAndDate(
         childId,
         date
       );
       
       // 2. Obtener incidentes compartibles
       const incidents = await this.incidentRepo.findByChild(childId, {
         dateFrom: date,
         dateTo: date,
         sharedWithFamily: true,
       });
       
       // 3. Generar texto del resumen
       const summary = this.buildSummaryText(attendance, incidents);
       
       return {
         childId,
         date,
         attendance,
         incidents,
         summaryText: summary,
         generatedAt: new Date(),
       };
     }
     
     private buildSummaryText(
       attendance: Attendance | null,
       incidents: Incident[]
     ): string {
       let text = '📅 Resumen del día\n\n';
       
       // Asistencia
       if (attendance) {
         text += `✅ Llegada: ${this.formatTime(attendance.checkInTime)}\n`;
         text += `Estado: ${this.translateState(attendance.state)}\n`;
         
         if (attendance.checkOutTime) {
           text += `🚪 Salida: ${this.formatTime(attendance.checkOutTime)}\n`;
           text += `Recogido por: ${this.translatePickup(attendance.pickedUpBy)}\n`;
         }
       } else {
         text += '❌ No asistió hoy\n';
       }
       
       text += '\n';
       
       // Incidentes
       if (incidents.length > 0) {
         text += '📝 Hechos relevantes:\n\n';
         for (const incident of incidents) {
           text += `${this.getIncidentEmoji(incident.type)} ${incident.description}\n\n`;
         }
       } else {
         text += '✨ Tuvo un día tranquilo y participativo.\n';
       }
       
       return text;
     }
     
     async generateBulkSummaries(
       classRoomId: string,
       date: Date
     ): Promise<DailySummary[]> {
       const children = await this.childRepo.findByClassRoom(classRoomId);
       const summaries: DailySummary[] = [];
       
       for (const child of children) {
         const attendance = await this.attendanceRepo.findByChildAndDate(
           child.id,
           date
         );
         
         // Solo generar si asistió
         if (attendance && attendance.checkInTime) {
           const summary = await this.generateDailySummary(child.id, date);
           summaries.push(summary);
         }
       }
       
       return summaries;
     }
   }
   ```

2. **Controllers:**
   ```typescript
   POST /api/reports/daily-summary/:childId
   GET /api/reports/daily-summaries/classroom/:classRoomId/today
   ```

**Frontend (Flutter Web):**

1. **UI de Generación Masiva:**
   ```dart
   // pages/daily_summaries_page.dart
   class DailySummariesPage extends ConsumerWidget {
     @override
     Widget build(BuildContext context, WidgetRef ref) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Resúmenes del Día'),
           actions: [
             ElevatedButton.icon(
               icon: Icon(Icons.auto_awesome),
               label: Text('Generar Todos'),
               onPressed: () => _generateAll(ref),
             ),
           ],
         ),
         body: ListView.builder(
           itemCount: _summaries.length,
           itemBuilder: (context, index) {
             return SummaryCard(
               summary: _summaries[index],
               onEdit: () => _editSummary(_summaries[index]),
               onCopy: () => _copyToClipboard(_summaries[index]),
               onMarkReady: () => _markReady(_summaries[index]),
             );
           },
         ),
       );
     }
     
     Future<void> _generateAll(WidgetRef ref) async {
       showDialog(
         context: context,
         barrierDismissible: false,
         builder: (context) => ProgressDialog(message: 'Generando resúmenes...'),
       );
       
       try {
         final summaries = await ref
           .read(dailySummaryProvider.notifier)
           .generateAllForToday(classRoomId);
         
         Navigator.pop(context);
         setState(() => _summaries = summaries);
       } catch (e) {
         Navigator.pop(context);
         showErrorDialog(e.toString());
       }
     }
   }
   ```

2. **Widget de Resumen:**
   ```dart
   // widgets/summary_card.dart
   class SummaryCard extends StatelessWidget {
     final DailySummary summary;
     
     @override
     Widget build(BuildContext context) {
       return Card(
         child: ExpansionTile(
           title: Text(summary.childName),
           subtitle: Text('${summary.incidents.length} incidentes'),
           children: [
             Padding(
               padding: EdgeInsets.all(16),
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   SelectableText(
                     summary.summaryText,
                     style: TextStyle(fontFamily: 'monospace'),
                   ),
                   SizedBox(height: 16),
                   Row(
                     children: [
                       IconButton(
                         icon: Icon(Icons.edit),
                         onPressed: onEdit,
                         tooltip: 'Editar',
                       ),
                       IconButton(
                         icon: Icon(Icons.copy),
                         onPressed: onCopy,
                         tooltip: 'Copiar',
                       ),
                       Spacer(),
                       if (!summary.isReady)
                         ElevatedButton(
                           onPressed: onMarkReady,
                           child: Text('Marcar como listo'),
                         )
                       else
                         Chip(
                           label: Text('Listo para compartir'),
                           backgroundColor: Colors.green[100],
                         ),
                     ],
                   ),
                 ],
               ),
             ),
           ],
         ),
       );
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Generación lenta con muchos niños** | Media | Alto | Procesamiento asíncrono, progress indicator |
| **Plantilla de texto poco profesional** | Media | Medio | Iteración con usuarios, plantillas configurables |
| **Resumen sin incidentes suena negativo** | Media | Bajo | Mensaje positivo predeterminado |
| **Copiar texto con formato incorrecto** | Media | Bajo | Plain text con emojis, compatible multiplataforma |

---

## Análisis de Historias de Prioridad Media

### US-007: Consulta de historial de asistencia

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Query Optimizada:**
   ```typescript
   async getAttendanceHistory(
     childId: string,
     filters: {
       dateFrom?: Date,
       dateTo?: Date,
       status?: AttendanceStatus[]
     }
   ): Promise<AttendanceHistoryResponse> {
     const attendances = await this.prisma.attendance.findMany({
       where: {
         childId,
         date: {
           gte: filters.dateFrom,
           lte: filters.dateTo,
         },
         ...(filters.status && { status: { in: filters.status } }),
       },
       orderBy: { date: 'desc' },
       include: {
         user: { select: { firstName: true, lastName: true } },
       },
     });
     
     // Calcular estadísticas
     const stats = {
       totalDays: attendances.length,
       daysPresent: attendances.filter(a => a.status === 'PRESENT').length,
       daysAbsent: attendances.filter(a => a.status === 'ABSENT').length,
       justifiedAbsences: attendances.filter(a => a.isJustified).length,
       attendanceRate: 0,
     };
     
     stats.attendanceRate = (stats.daysPresent / stats.totalDays) * 100;
     
     return { attendances, stats };
   }
   ```

2. **Exportación a CSV:**
   ```typescript
   async exportAttendanceHistoryToCSV(
     childId: string,
     filters: any
   ): Promise<string> {
     const { attendances } = await this.getAttendanceHistory(childId, filters);
     
     const csvHeader = 'Fecha,Estado,Hora Entrada,Hora Salida,Justificada,Docente\n';
     const csvRows = attendances.map(a => {
       return [
         a.date.toISOString().split('T')[0],
         a.status,
         a.checkInTime?.toLocaleTimeString() || '-',
         a.checkOutTime?.toLocaleTimeString() || '-',
         a.isJustified ? 'Sí' : 'No',
         `${a.user.firstName} ${a.user.lastName}`,
       ].join(',');
     }).join('\n');
     
     return csvHeader + csvRows;
   }
   ```

**Frontend (Flutter Web):**

1. **UI con Filtros:**
   ```dart
   // pages/attendance_history_page.dart
   class AttendanceHistoryPage extends StatefulWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Historial de Asistencia'),
           actions: [
             IconButton(
               icon: Icon(Icons.download),
               onPressed: _exportToCSV,
             ),
           ],
         ),
         body: Column(
           children: [
             // Filtros de fecha
             DateRangeFilter(
               onChanged: _applyFilters,
             ),
             
             // Estadísticas
             StatsCard(stats: _stats),
             
             // Lista de asistencias
             Expanded(
               child: ListView.builder(
                 itemCount: _attendances.length,
                 itemBuilder: (context, index) {
                   return AttendanceHistoryTile(
                     attendance: _attendances[index],
                   );
                 },
               ),
             ),
           ],
         ),
       );
     }
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Query lenta con histórico largo** | Media | Alto | Paginación, límite de rango de fechas |
| **CSV con caracteres especiales** | Media | Bajo | UTF-8 BOM, escape de comas |
| **Estadísticas incorrectas** | Media | Medio | Tests unitarios, validación de cálculos |

---

### US-013: Exportación de datos a CSV

#### Requerimientos Técnicos

**Backend (TypeScript/Node.js):**

1. **Servicio de Exportación:**
   ```typescript
   // domains/reports/services/ExportService.ts
   class ExportService {
     async exportAttendances(
       filters: ExportFilters,
       userId: string
     ): Promise<string> {
       // Verificar permisos
       await this.authService.requirePermission(
         userId,
         Permission.EXPORT_DATA
       );
       
       // Obtener datos
       const attendances = await this.attendanceRepo.findMany(filters);
       
       // Generar CSV con UTF-8 BOM
       const BOM = '\uFEFF';
       const csv = this.generateCSV(attendances, [
         'Fecha',
         'Niño',
         'Aula',
         'Hora Entrada',
         'Estado al Llegar',
         'Hora Salida',
         'Quién Recogió',
         'Docente',
       ]);
       
       return BOM + csv;
     }
     
     private generateCSV(data: any[], headers: string[]): string {
       const rows = data.map(row => {
         return headers.map(h => {
           const value = row[h] || '';
           // Escape commas and quotes
           return `"${String(value).replace(/"/g, '""')}"`;
         }).join(',');
       });
       
       return [headers.join(','), ...rows].join('\n');
     }
   }
   ```

2. **Controllers:**
   ```typescript
   GET /api/reports/export/attendances
   Query: ?dateFrom=2026-01-01&dateTo=2026-01-21&classRoomIds=uuid1,uuid2
   Response: CSV file download
   ```

**Frontend (Flutter Web):**

1. **Download Handler:**
   ```dart
   // services/export_service.dart
   Future<void> exportAttendances(ExportFilters filters) async {
     final response = await _dio.get(
       '/reports/export/attendances',
       queryParameters: filters.toJson(),
       options: Options(responseType: ResponseType.bytes),
     );
     
     // Crear blob y descargar
     final blob = html.Blob([response.data]);
     final url = html.Url.createObjectUrlFromBlob(blob);
     final anchor = html.AnchorElement(href: url)
       ..setAttribute('download', 'asistencias_${DateTime.now().toIso8601String()}.csv')
       ..click();
     
     html.Url.revokeObjectUrl(url);
   }
   ```

#### Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Exportación con datos sensibles** | Media | Alto | Validar permisos, audit log de exportaciones |
| **CSV corrupto en Excel** | Media | Medio | UTF-8 BOM, escape correcto, tests con Excel |
| **Memory overflow con datasets grandes** | Media | Alto | Streaming, límite de registros, paginación |

---

## Resumen de Riesgos y Mitigaciones

### Riesgos Críticos (Prioridad 1)

| Riesgo | Historias Afectadas | Mitigación Recomendada |
|--------|---------------------|------------------------|
| **Token JWT expuesto/comprometido** | US-001, US-002 | Refresh tokens, rotación, almacenamiento seguro, HTTPS only |
| **Bypass de autorización** | US-002, todas | Validación SIEMPRE en backend, tests exhaustivos |
| **Clave de cifrado comprometida** | US-014 | Key management system, rotación, backup seguro |
| **Compartir datos sensibles accidentalmente** | US-010 | Default seguro, confirmación explícita, audit log |
| **Pérdida de datos en red inestable** | US-003, US-009 | Queue local, retry mechanism, optimistic updates |

### Riesgos Altos (Prioridad 2)

| Riesgo | Mitigación |
|--------|------------|
| **Performance degradado** | Benchmark continuo, índices DB, caché, lazy loading |
| **Queries lentas con muchos datos** | Paginación, límites, índices apropiados |
| **Inconsistencia de datos** | Transacciones ACID, validaciones estrictas |
| **Memory leaks en Flutter Web** | Dispose correctos, ref.onDispose, memory profiling |

### Riesgos Medios (Prioridad 3)

| Riesgo | Mitigación |
|--------|------------|
| **UX confusa** | Iteración con usuarios, user testing, feedback claro |
| **Errores de validación** | Validación frontend + backend, mensajes claros |
| **Timestamps incorrectos** | UTC en DB, conversión en presentación |

---

## Stack Tecnológico Recomendado

### Backend (TypeScript/Node.js)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.3.3",
    "@prisma/client": "^5.8.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "uuid": "^9.0.1",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/express": "^4.17.21",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "prisma": "^5.8.0"
  }
}
```

### Frontend (Flutter Web)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.10
  # o bloc: ^8.1.3
  
  # HTTP & API
  dio: ^5.4.0
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  flutter_secure_storage: ^9.0.0
  
  # Utilities
  uuid: ^4.3.3
  intl: ^0.19.0
  
  # Encryption
  encrypt: ^5.0.3
  crypto: ^3.0.3
  
  # Device Info
  device_info_plus: ^10.0.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  mockito: ^5.4.4
  build_runner: ^2.4.7
  hive_generator: ^2.0.1
```

### Base de Datos (PostgreSQL con Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Extensiones recomendadas
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
// CREATE EXTENSION IF NOT EXISTS "pg_trgm"; // Full-text search
```

---

## Consideraciones Finales

### Prioridades de Implementación

1. **Sprint 1** (Fundación - 2 semanas)
   - US-001: Autenticación
   - US-002: Roles y permisos
   - US-014: Cifrado
   - Setup: DB, Prisma, estructura DDD

2. **Sprint 2** (Asistencias Core - 2 semanas)
   - US-003: Check-in
   - US-004: Check-out
   - US-005: Visualización tiempo real

3. **Sprint 3** (Asistencias Completo - 2 semanas)
   - US-006: Ausencia justificada
   - US-008: Corrección de registros
   - US-007: Historial

4. **Sprint 4** (Incidentes - 2 semanas)
   - US-009: Registro de incidentes
   - US-010: Control de visibilidad
   - US-011: Consulta por niño

5. **Sprint 5** (Reportes - 1.5 semanas)
   - US-012: Resumen diario
   - US-013: Exportación CSV

### Testing Strategy

- **Unit Tests**: >80% coverage en domain services
- **Integration Tests**: Endpoints críticos
- **E2E Tests**: Flujos principales (Cypress)
- **Performance Tests**: Load testing con k6
- **Security Tests**: OWASP Top 10

### DevOps

- **CI/CD**: GitHub Actions
- **Staging**: Render/Railway (gratis)
- **Production**: VPS o Render Pro
- **Monitoring**: Sentry para errores
- **Analytics**: PostHog (open source)

---

**Documento generado:** 21 de enero de 2026  
**Versión:** 1.0  
**Autor:** Tech Lead - KinderTrack MVP
