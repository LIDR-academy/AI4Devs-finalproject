# Especificación de Controladores API

## Estructura General

Todos los controladores siguen las siguientes convenciones:
- Namespace: `App\Controller\Api`
- Prefijo de ruta: `/api/v1`
- Formato de respuesta: JSON
- Autenticación: Certificado Digital
- Versión en cabecera: `X-API-Version: 1.0`

## Controladores

### 1. SecurityController
```php
namespace App\Controller\Api;

class SecurityController extends AbstractController
{
    #[Route('/auth/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // La autenticación se maneja a través del CertificateAuthenticator
        // Este endpoint solo valida y devuelve el token JWT
    }

    #[Route('/auth/refresh', name: 'api_auth_refresh', methods: ['POST'])]
    public function refreshToken(): JsonResponse
    {
        // Renovación de token JWT
    }
}
```

### 2. EmployeeController
```php
namespace App\Controller\Api;

#[Route('/employees')]
class EmployeeController extends AbstractController
{
    #[Route('', name: 'api_employee_list', methods: ['GET'])]
    #[IsGranted('ROLE_HR')]
    public function list(Request $request): JsonResponse
    {
        // Lista paginada de empleados
        // Parámetros: page, limit, department, status
    }

    #[Route('/{id}', name: 'api_employee_get', methods: ['GET'])]
    #[IsGranted('ROLE_HR')]
    public function get(string $id): JsonResponse
    {
        // Detalles de un empleado específico
    }

    #[Route('', name: 'api_employee_create', methods: ['POST'])]
    #[IsGranted('ROLE_HR')]
    public function create(Request $request): JsonResponse
    {
        // Creación de nuevo empleado
        // Validación de datos requeridos
    }

    #[Route('/{id}', name: 'api_employee_update', methods: ['PUT'])]
    #[IsGranted('ROLE_HR')]
    public function update(string $id, Request $request): JsonResponse
    {
        // Actualización de datos de empleado
    }

    #[Route('/{id}/status', name: 'api_employee_status', methods: ['PATCH'])]
    #[IsGranted('ROLE_HR')]
    public function updateStatus(string $id, Request $request): JsonResponse
    {
        // Actualización de estado (activo/inactivo)
    }
}
```

### 3. TimeClockController
```php
namespace App\Controller\Api;

#[Route('/timeclock')]
class TimeClockController extends AbstractController
{
    #[Route('/clock', name: 'api_timeclock_register', methods: ['POST'])]
    #[IsGranted('ROLE_EMPLOYEE')]
    public function registerClock(Request $request): JsonResponse
    {
        // Registro de fichaje
        // Validación de horario y ubicación
    }

    #[Route('/history', name: 'api_timeclock_history', methods: ['GET'])]
    #[IsGranted('ROLE_EMPLOYEE')]
    public function getHistory(Request $request): JsonResponse
    {
        // Historial de fichajes
        // Parámetros: start_date, end_date, type
    }

    #[Route('/approve/{id}', name: 'api_timeclock_approve', methods: ['POST'])]
    #[IsGranted('ROLE_SUPERVISOR')]
    public function approveClock(string $id, Request $request): JsonResponse
    {
        // Aprobación de fichaje manual
    }

    #[Route('/report', name: 'api_timeclock_report', methods: ['GET'])]
    #[IsGranted('ROLE_HR')]
    public function generateReport(Request $request): JsonResponse
    {
        // Generación de informes
        // Parámetros: department, start_date, end_date, format
    }
}
```

### 4. WorkScheduleController
```php
namespace App\Controller\Api;

#[Route('/schedules')]
class WorkScheduleController extends AbstractController
{
    #[Route('', name: 'api_schedule_list', methods: ['GET'])]
    #[IsGranted('ROLE_HR')]
    public function list(Request $request): JsonResponse
    {
        // Lista de horarios
        // Parámetros: department, employee, status
    }

    #[Route('', name: 'api_schedule_create', methods: ['POST'])]
    #[IsGranted('ROLE_HR')]
    public function create(Request $request): JsonResponse
    {
        // Creación de horario
        // Validación de solapamientos
    }

    #[Route('/{id}', name: 'api_schedule_update', methods: ['PUT'])]
    #[IsGranted('ROLE_HR')]
    public function update(string $id, Request $request): JsonResponse
    {
        // Actualización de horario
    }

    #[Route('/validate', name: 'api_schedule_validate', methods: ['POST'])]
    #[IsGranted('ROLE_HR')]
    public function validateSchedule(Request $request): JsonResponse
    {
        // Validación de horario
        // Comprueba cumplimiento legal
    }
}
```

### 5. AbsenceController
```php
namespace App\Controller\Api;

#[Route('/absences')]
class AbsenceController extends AbstractController
{
    #[Route('', name: 'api_absence_list', methods: ['GET'])]
    #[IsGranted('ROLE_EMPLOYEE')]
    public function list(Request $request): JsonResponse
    {
        // Lista de ausencias
        // Filtrado por estado y fechas
    }

    #[Route('', name: 'api_absence_request', methods: ['POST'])]
    #[IsGranted('ROLE_EMPLOYEE')]
    public function request(Request $request): JsonResponse
    {
        // Solicitud de ausencia
        // Validación de días disponibles
    }

    #[Route('/{id}/approve', name: 'api_absence_approve', methods: ['POST'])]
    #[IsGranted('ROLE_SUPERVISOR')]
    public function approve(string $id, Request $request): JsonResponse
    {
        // Aprobación de ausencia
    }

    #[Route('/{id}/reject', name: 'api_absence_reject', methods: ['POST'])]
    #[IsGranted('ROLE_SUPERVISOR')]
    public function reject(string $id, Request $request): JsonResponse
    {
        // Rechazo de ausencia
    }
}
```

### 6. DepartmentController
```php
namespace App\Controller\Api;

#[Route('/departments')]
class DepartmentController extends AbstractController
{
    #[Route('', name: 'api_department_list', methods: ['GET'])]
    #[IsGranted('ROLE_HR')]
    public function list(): JsonResponse
    {
        // Lista de departamentos
        // Incluye estructura jerárquica
    }

    #[Route('', name: 'api_department_create', methods: ['POST'])]
    #[IsGranted('ROLE_HR')]
    public function create(Request $request): JsonResponse
    {
        // Creación de departamento
    }

    #[Route('/{id}', name: 'api_department_update', methods: ['PUT'])]
    #[IsGranted('ROLE_HR')]
    public function update(string $id, Request $request): JsonResponse
    {
        // Actualización de departamento
    }

    #[Route('/{id}/employees', name: 'api_department_employees', methods: ['GET'])]
    #[IsGranted('ROLE_HR')]
    public function getEmployees(string $id): JsonResponse
    {
        // Lista de empleados por departamento
    }
}
```

## Respuestas y Códigos de Estado

### Códigos de Estado Comunes
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 500: Internal Server Error

### Formato de Respuesta
```json
{
    "status": "success|error",
    "data": {
        // Datos de la respuesta
    },
    "meta": {
        "page": 1,
        "limit": 20,
        "total": 100
    },
    "errors": [
        {
            "code": "ERROR_CODE",
            "message": "Descripción del error",
            "field": "campo_afectado"
        }
    ]
}
```

## Validación y Filtros

### Validadores Comunes
```php
namespace App\Validator;

class TimeClockValidator
{
    public function validateClockTime(TimeClock $timeClock): bool
    {
        // Validación de horario legal
        // Validación de solapamientos
        // Validación de ubicación
    }
}
```

### Filtros de Búsqueda
```php
namespace App\Filter;

class EmployeeFilter
{
    public function apply(QueryBuilder $qb, array $filters): void
    {
        // Filtrado por departamento
        // Filtrado por estado
        // Filtrado por fechas
    }
}
```

## Documentación API

La documentación completa de la API se genera automáticamente usando:
- NelmioApiDocBundle
- OpenAPI/Swagger
- Disponible en `/api/doc`

## Seguridad

### Middleware de Seguridad
```php
namespace App\Security;

class ApiSecurityMiddleware implements MiddlewareInterface
{
    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        // Validación de certificado
        // Rate limiting
        // Validación de versión API
        // Logging de acceso
    }
}
```

### Rate Limiting
```yaml
# config/packages/security.yaml
api_rate_limiter:
    login:
        policy: 'sliding_window'
        limit: 5
        interval: '1 minute'
    timeclock:
        policy: 'sliding_window'
        limit: 10
        interval: '1 minute'
```

¿Necesitas más detalles sobre algún aspecto específico de los controladores o endpoints? 