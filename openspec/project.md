# Project Context

## Purpose
TravelSplit es una plataforma web centralizada que elimina la fricción financiera en viajes grupales, permitiendo el rastreo transparente de gastos en COP (Pesos Colombianos) y la liquidación de cuentas clara entre amigos registrados.

**Objetivos del MVP:**
- Entregar un sistema funcional que permita el ciclo completo: Registro → Creación Viaje → Carga Gastos → Visualización Saldos
- KPI Principal: Tasa de finalización de viajes (Viajes donde se usa el botón "Equilibrar gastos")

## Tech Stack

### Backend (API REST)
- **Runtime:** Node.js v22.x (Active LTS)
- **Framework:** NestJS v11.x
- **Lenguaje:** TypeScript v5.6+
- **ORM:** TypeORM v0.3.x
- **Validación:** class-validator + class-transformer (Seguridad en DTOs)
- **Documentación:** Swagger (OpenAPI 3.0)

### Frontend (SPA)
- **Core:** React v19.2
- **Build System:** Vite v6.x
- **Styling:** Tailwind CSS v4.0
- **State Management:**
  - TanStack Query para sincronizar con NestJS
  - Zustand para controlar la UI y la sesión
- **Forms:** React Hook Form

### Infraestructura de Datos
- **Base de Datos:** PostgreSQL v17 (Imagen Docker: postgres:17-alpine)
- **Storage:** File System Local (MVP) / S3 Compatible (Producción) para imágenes

## Project Conventions

### Code Style
- **Lenguaje:** TypeScript estricto con configuración de linter y prettier
- **Naming:** 
  - Variables y funciones: camelCase
  - Clases y tipos: PascalCase
  - Constantes: UPPER_SNAKE_CASE
- **Formato:** Prettier configurado para consistencia
- **Validación:** Todos los DTOs deben usar decoradores de class-validator

### Architecture Patterns
**Arquitectura en Capas (Layered Architecture):**
- El sistema está dividido en "estratos" horizontales
- Cada capa tiene una responsabilidad única y solo puede comunicarse con la capa inmediatamente inferior
- Principio: Separation of Concerns (Separación de Responsabilidades)
- **Regla de Oro:** El Controlador nunca habla directamente con la Base de Datos; debe pasar por el Servicio

**Patrón de Diseño:** Controller-Service-Repository (CSR)
- **Controllers:** Manejan las peticiones HTTP y validaciones de entrada
- **Services:** Contienen la lógica de negocio
- **Repositories:** Gestionan el acceso a datos y consultas a la base de datos

**Estructura de Carpetas Backend:**
```
Backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── dto/
│   │   ├── trips/
│   │   ├── expenses/
│   │   └── balances/
```

**Estructura de Carpetas Frontend:**
- Componentes organizados de forma atómica/modular
- Separación clara entre componentes de UI, hooks, y servicios

### Testing Strategy
- **Unit Tests:** Cubrir servicios críticos (especialmente cálculo de saldos)
- **Casos de prueba:** Gasto único, múltiples gastos, usuario que no gastó nada
- **Precisión decimal:** Manejo correcto de cálculos financieros

### Git Workflow
- usar convenciones estándar de commits semánticos.
Cada que se trabaja en una user history se debe crear una rama feature y hacer commits hasta finalizar los criterios de aprobación hasta cambiar a una nueva rama.

## Domain Context

### Entidades Principales
- **User:** Usuarios registrados en el sistema (email único, password encriptado)
- **Trip:** Viaje grupal con nombre, código de invitación alfanumérico, y creador
- **TripParticipant:** Relación N:M entre User y Trip con roles (CREATOR, MEMBER)
- **Expense:** Gasto individual con título, monto (COP), pagador, categoría, y foto opcional
- **ExpenseSplit:** División del gasto entre beneficiarios (fair share)
- **ExpenseCategory:** Categorías predefinidas (Comida, Transporte, Alojamiento, Entretenimiento, Varios)

### Roles y Permisos
- **Viajero Administrador (Creador):** 
  - Crea viajes, invita usuarios
  - Gestiona (edita/elimina) TODOS los gastos
  - Permisos exclusivos de escritura
- **Viajero Participante:** 
  - Visualiza data
  - Sube gastos propios (pero no puede editarlos tras crearlos)

### Reglas de Negocio Críticas
1. **Strict User Policy:** No se pueden agregar participantes a un viaje si su email no está previamente registrado en la base de datos
2. **Centralized Control:** Solo el Creador del Viaje tiene permisos de escritura (Edición/Eliminado) sobre los gastos
3. **Moneda Única:** Todo el sistema opera exclusivamente en COP (Pesos Colombianos)
4. **Soft Delete:** Ningún dato se borra físicamente; se usa borrado lógico (`deleted_at`)

### Cálculo de Saldos
- **Lógica:** (Total Viaje / N Personas) - (Lo que pagó Persona X) = Balance
- Calcular "Total Gastado por Persona" vs "Cuota Justa (Fair Share)"
- Visualización: Lista simple de deudas (Ej: "Juan debe $50.000 a Pedro")

## Important Constraints

### Técnicas
- **Base de Datos:** PostgreSQL relacional obligatoria para integridad financiera
- **Moneda:** Sistema opera exclusivamente en COP
- **Validación:** Todos los emails deben ser únicos y validados
- **Seguridad:** Contraseñas encriptadas (bcrypt/argon2), JWT para autenticación

### Negocio
- **Strict User Policy:** Usuarios deben registrarse antes de ser invitados a viajes
- **Permisos Centralizados:** Solo el creador puede editar/eliminar gastos
- **Soft Delete:** Todos los datos usan borrado lógico para mantener historial

### Accesibilidad
- Diseño Responsive completo
- Cumplimiento de pautas WCAG para accesibilidad web

## External Dependencies

### Base de Datos
- **PostgreSQL v17:** Base de datos relacional principal
- Docker image: `postgres:17-alpine`

### Almacenamiento
- **MVP:** Sistema de archivos local para imágenes de recibos
- **Producción:** Servicio S3 Compatible o Cloudinary para almacenamiento de imágenes

### Servicios Futuros
- **Email Service:** Para notificaciones cuando un usuario es agregado a un viaje (pendiente de implementación en MVP)
