# ZenTurno System Patterns

## Architecture Overview
ZenTurno follows a simplified three-tier architecture prioritizing simplicity and maintainability over complexity.

```
Frontend (React/Vercel) → Backend API (Node.js/Express) → Database (PostgreSQL in Docker)
```

## Key Technical Decisions

### 1. Simplified Stack Choice
- **Decision**: Use Docker for local PostgreSQL instead of Supabase
- **Rationale**: Better local development experience, more control over database, easier testing
- **Pattern**: Database-in-Docker, simple backend deployment

### 2. Custom Authentication
- **Decision**: JWT-based authentication instead of third-party auth
- **Rationale**: Full control over user flow, simpler integration, no external dependencies
- **Pattern**: Stateless authentication with role-based access control

### 3. Prisma ORM
- **Decision**: Replaced TypeORM with Prisma for database access
- **Rationale**: Type-safe database queries, better developer experience, simpler migrations
- **Pattern**: Schema-first approach with Prisma schema

## Design Patterns in Use

### Backend Patterns
1. **Clean Architecture**: Separation of concerns with domain/infrastructure layers
2. **Repository Pattern**: Database access abstraction through Prisma repositories
3. **Middleware Pattern**: Authentication, validation, error handling
4. **RESTful API**: Standard HTTP methods and status codes

### Frontend Patterns
1. **Component-Based Architecture**: Reusable React components
2. **Custom Hooks**: Shared logic extraction
3. **Context API**: State management for authentication
4. **Feature-First Structure**: Organization by functionality

### Database Patterns
1. **Normalized Schema**: Proper entity relationships
2. **Timestamped Records**: Created/updated tracking
3. **Soft Deletes**: Data preservation for auditing
4. **Indexed Queries**: Performance optimization
5. **Migrations**: Schema changes managed through Prisma migrations

## Component Relationships

### Core Entities
- **Usuario** (User): Base authentication entity
- **Cliente** (Client): Customer-specific data
- **Profesional** (Professional): Service provider data
- **Servicio** (Service): Bookable services
- **Reserva** (Booking): Appointment records

### Key Relationships
- User → Client/Professional (1:1)
- Professional → Booking (1:many)
- Client → Booking (1:many)
- Service → Booking (1:many)

## Deployment Architecture
- **Frontend**: Static files on Vercel CDN
- **Backend**: Container on Railway/Render
- **Database**: PostgreSQL in Docker for development, managed PostgreSQL for production
- **Pattern**: Containerized development with simplified deployment
