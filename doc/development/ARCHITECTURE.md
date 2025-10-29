# Architecture Documentation - bonÀreaGo

Documentación completa de la arquitectura del sistema bonÀreaGo.

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura de Microservicios](#arquitectura-de-microservicios)
- [Patrones de Diseño](#patrones-de-diseño)
- [Flujo de Datos](#flujo-de-datos)
- [Base de Datos](#base-de-datos)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Integraciones](#integraciones)
- [Escalabilidad](#escalabilidad)

---

## Visión General

bonÀreaGo es una plataforma de carpooling corporativo construida con arquitectura de microservicios.

### Diagrama C4 - Nivel 1: Contexto

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                      bonÀreaGo System                         │
│                                                               │
│  Plataforma de carpooling corporativo que conecta            │
│  empleados para compartir viajes                             │
│                                                               │
└───────────────┬─────────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────┐            ┌─────▼──────┐
│Empleado│            │   Keycloak │
│        │            │   (OIDC)   │
└────────┘            └────────────┘
```

### Diagrama C4 - Nivel 2: Contenedores

```
┌──────────────────────────────────────────────────────────────┐
│                      bonÀreaGo System                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐         ┌──────────────┐                   │
│  │   Frontend  │────────▶│  API Gateway │                   │
│  │  React SPA  │         │    (Nginx)   │                   │
│  └─────────────┘         └───────┬──────┘                   │
│                                   │                           │
│         ┌─────────────────────────┼──────────────┐           │
│         │                         │              │           │
│    ┌────▼────┐  ┌────▼────┐  ┌──▼──────┐  ┌───▼────┐      │
│    │  Auth   │  │  Users  │  │  Trips  │  │Booking │      │
│    │ Service │  │ Service │  │ Service │  │Service │      │
│    └─────────┘  └─────────┘  └─────────┘  └────────┘      │
│                                                               │
│    ┌──────────┐  ┌──────────────┐                           │
│    │ Matching │  │Notification  │                           │
│    │ Service  │  │  Service     │                           │
│    └──────────┘  └──────────────┘                           │
│                                                               │
│  ┌────────────┐  ┌────────┐  ┌──────────┐                  │
│  │ PostgreSQL │  │ Redis  │  │ Keycloak │                  │
│  └────────────┘  └────────┘  └──────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Arquitectura de Microservicios

### Servicios

#### 1. Auth Service
**Responsabilidad**: Validación de tokens JWT y autorización

**Tecnologías**:
- Java 17
- Jakarta EE
- Nimbus JOSE JWT

**Endpoints**:
- `GET /api/auth/health`
- `POST /api/auth/validate`

#### 2. Users Service
**Responsabilidad**: Gestión de usuarios y perfiles

**Tecnologías**:
- Java 17
- JPA/Hibernate
- PostgreSQL

**Endpoints**:
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users/{id}`
- `POST /api/ratings`
- `GET /api/ratings/user/{userId}`

#### 3. Trips Service
**Responsabilidad**: Gestión de viajes

**Tecnologías**:
- Java 17
- JPA/Hibernate
- PostgreSQL + PostGIS

**Endpoints**:
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/{id}`
- `PUT /api/trips/{id}`
- `DELETE /api/trips/{id}`

#### 4. Booking Service
**Responsabilidad**: Gestión de reservas

**Tecnologías**:
- Java 17
- JPA/Hibernate
- PostgreSQL

**Endpoints**:
- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/bookings/{id}`
- `DELETE /api/bookings/{id}`

#### 5. Matching Service
**Responsabilidad**: Búsqueda y emparejamiento de viajes

**Tecnologías**:
- Java 17
- JPA/Hibernate
- PostgreSQL

**Endpoints**:
- `GET /api/matches`
- `POST /api/matches/{id}/accept`
- `POST /api/matches/{id}/reject`

#### 6. Notification Service
**Responsabilidad**: Notificaciones push y email

**Tecnologías**:
- Java 17
- JPA/Hibernate
- Web Push API
- SMTP

**Endpoints**:
- `POST /api/notifications/subscribe`
- `DELETE /api/notifications/subscribe`
- `GET /api/notifications`

---

## Patrones de Diseño

### 1. Strategy Pattern

Usado en Matching Service para filtros y ordenación.

```java
public interface MatchFilterStrategy {
    List<Match> filter(List<Match> matches, FilterCriteria criteria);
}

public class ScoreFilterStrategy implements MatchFilterStrategy {
    @Override
    public List<Match> filter(List<Match> matches, FilterCriteria criteria) {
        return matches.stream()
            .filter(m -> m.getScore() >= criteria.getMinScore())
            .collect(Collectors.toList());
    }
}
```

### 2. Factory Pattern

Usado para crear estrategias de filtrado.

```java
public interface FilterStrategyFactory {
    MatchFilterStrategy createStrategy(FilterType type);
}

public class ConcreteFilterStrategyFactory implements FilterStrategyFactory {
    @Override
    public MatchFilterStrategy createStrategy(FilterType type) {
        return switch (type) {
            case SCORE -> new ScoreFilterStrategy();
            case SEATS -> new SeatsFilterStrategy();
            case DATE_RANGE -> new DateRangeFilterStrategy();
        };
    }
}
```

### 3. Repository Pattern

Usado en todos los servicios para acceso a datos.

```java
@ApplicationScoped
public class TripRepository {
    
    @PersistenceContext
    private EntityManager em;
    
    public List<Trip> findByStatus(TripStatus status) {
        return em.createQuery(
            "SELECT t FROM Trip t WHERE t.status = :status", 
            Trip.class
        )
        .setParameter("status", status)
        .getResultList();
    }
}
```

### 4. Dependency Injection

Usado en todos los servicios para inversión de control.

```java
@ApplicationScoped
public class TripService {
    
    private final TripRepository tripRepository;
    private final BookingServiceClient bookingClient;
    
    @Inject
    public TripService(
        TripRepository tripRepository,
        BookingServiceClient bookingClient
    ) {
        this.tripRepository = tripRepository;
        this.bookingClient = bookingClient;
    }
}
```

### 5. Chain of Responsibility

Usado para aplicar múltiples filtros secuencialmente.

```java
public class MatchFilterService {
    
    public List<Match> applyFilters(
        List<Match> matches, 
        List<MatchFilterStrategy> strategies
    ) {
        List<Match> result = matches;
        for (MatchFilterStrategy strategy : strategies) {
            result = strategy.filter(result, criteria);
        }
        return result;
    }
}
```

---

## Flujo de Datos

### Flujo de Creación de Viaje

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│Frontend │────▶│ Gateway  │────▶│   Trips    │────▶│PostgreSQL│
│         │     │          │     │  Service   │     │          │
└─────────┘     └──────────┘     └────────────┘     └──────────┘
     │                                   │
     │                                   │
     │                                   ▼
     │                            ┌────────────┐
     │                            │Notification│
     │◀───────────────────────────│  Service   │
                                  └────────────┘
```

### Flujo de Búsqueda y Reserva

```
┌─────────┐     ┌──────────┐     ┌────────────┐
│Frontend │────▶│ Gateway  │────▶│  Matching  │
│         │     │          │     │  Service   │
└─────────┘     └──────────┘     └──────┬─────┘
     │                                   │
     │                                   ▼
     │                            ┌────────────┐
     │                            │   Trips    │
     │                            │  Service   │
     │                            └────────────┘
     │
     ▼
┌──────────┐     ┌────────────┐     ┌──────────┐
│ Gateway  │────▶│  Booking   │────▶│PostgreSQL│
│          │     │  Service   │     │          │
└──────────┘     └──────┬─────┘     └──────────┘
                        │
                        ▼
                 ┌────────────┐
                 │Notification│
                 │  Service   │
                 └────────────┘
```

---

## Base de Datos

### Esquema PostgreSQL

```sql
-- Schema por servicio
CREATE SCHEMA users;
CREATE SCHEMA trips;
CREATE SCHEMA bookings;
CREATE SCHEMA matches;
CREATE SCHEMA notifications;

-- Tabla de usuarios
CREATE TABLE users.users (
    id UUID PRIMARY KEY,
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    sede_id VARCHAR(50),
    preferred_schedule VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de viajes
CREATE TABLE trips.trips (
    id UUID PRIMARY KEY,
    driver_id UUID NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    destination_sede_id VARCHAR(50) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    seats_total INTEGER NOT NULL,
    seats_free INTEGER NOT NULL,
    direction VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservas
CREATE TABLE bookings.bookings (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL,
    passenger_id UUID NOT NULL,
    seats_requested INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de matches
CREATE TABLE matches.matches (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL,
    passenger_id UUID NOT NULL,
    score INTEGER NOT NULL,
    reasons TEXT[],
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE notifications.notification_subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices

```sql
-- Índices para performance
CREATE INDEX idx_trips_driver ON trips.trips(driver_id);
CREATE INDEX idx_trips_date ON trips.trips(date_time);
CREATE INDEX idx_trips_status ON trips.trips(status);
CREATE INDEX idx_bookings_trip ON bookings.bookings(trip_id);
CREATE INDEX idx_bookings_passenger ON bookings.bookings(passenger_id);
CREATE INDEX idx_matches_trip ON matches.matches(trip_id);
CREATE INDEX idx_matches_passenger ON matches.matches(passenger_id);
```

---

## Autenticación y Autorización

### Flujo de Autenticación

```
┌─────────┐     ┌──────────┐     ┌────────────┐
│Frontend │────▶│ Keycloak │────▶│   Backend  │
│         │     │  (OIDC)  │     │  Services  │
└─────────┘     └──────────┘     └────────────┘
     │                │                  │
     │ 1. Login       │                  │
     │───────────────▶│                  │
     │                │                  │
     │ 2. JWT Token   │                  │
     │◀───────────────│                  │
     │                │                  │
     │ 3. API Request with JWT           │
     │───────────────────────────────────▶│
     │                │                  │
     │                │ 4. Validate JWT  │
     │                │◀─────────────────│
     │                │                  │
     │                │ 5. Valid         │
     │                │──────────────────▶│
     │                │                  │
     │ 6. Response    │                  │
     │◀───────────────────────────────────│
```

### Validación JWT

```java
public class JwtValidator {
    
    private final DefaultJWTProcessor<SecurityContext> jwtProcessor;
    
    public JwtValidator(String issuerUri, String jwksUri) {
        this.jwtProcessor = new DefaultJWTProcessor<>();
        
        // Configure JWKS source
        JWKSource<SecurityContext> keySource = 
            new RemoteJWKSet<>(new URL(jwksUri));
        
        // Configure validator
        JWSVerificationKeySelector<SecurityContext> keySelector = 
            new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
        
        jwtProcessor.setJWSKeySelector(keySelector);
    }
    
    public JWTClaimsSet validate(String token) throws Exception {
        return jwtProcessor.process(token, null);
    }
}
```

---

## Integraciones

### Integración entre Servicios

Los servicios se comunican vía HTTP REST:

```java
@ApplicationScoped
public class BookingServiceClient {
    
    private final Client client;
    private final String baseUrl;
    
    public List<BookingDto> getBookingsByTripId(String tripId) {
        Response response = client.target(baseUrl)
            .path("/api/bookings")
            .queryParam("tripId", tripId)
            .request(MediaType.APPLICATION_JSON)
            .get();
            
        return response.readEntity(
            new GenericType<List<BookingDto>>() {}
        );
    }
}
```

### Eventos Asíncronos

Para notificaciones, se usan eventos asíncronos:

```java
@ApplicationScoped
public class BookingService {
    
    @Inject
    private NotificationServiceClient notificationClient;
    
    public BookingDto confirmBooking(String bookingId) {
        Booking booking = repository.findById(bookingId);
        booking.setStatus(BookingStatus.CONFIRMED);
        repository.update(booking);
        
        // Enviar notificación asíncrona
        notificationClient.sendBookingConfirmed(booking);
        
        return toDto(booking);
    }
}
```

---

## Escalabilidad

### Escalado Horizontal

Los servicios están diseñados para escalar horizontalmente:

```yaml
# docker-compose.scale.yml
services:
  trips-service:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### Load Balancing

Nginx actúa como load balancer:

```nginx
upstream trips-service {
    least_conn;
    server trips-service-1:8081;
    server trips-service-2:8081;
    server trips-service-3:8081;
}
```

### Caching

Redis se usa para caching:

```java
@ApplicationScoped
public class TripService {
    
    @Inject
    private RedisClient redis;
    
    public TripDto findById(String id) {
        // Try cache first
        String cached = redis.get("trip:" + id);
        if (cached != null) {
            return deserialize(cached);
        }
        
        // Load from database
        Trip trip = repository.findById(id);
        
        // Cache for 1 hour
        redis.setex("trip:" + id, 3600, serialize(trip));
        
        return toDto(trip);
    }
}
```

---

## Principios SOLID

### Single Responsibility
Cada servicio tiene una única responsabilidad.

### Open/Closed
Extensible sin modificar código existente (ej: nuevas estrategias de filtrado).

### Liskov Substitution
Implementaciones intercambiables (ej: diferentes estrategias).

### Interface Segregation
Interfaces específicas para cada necesidad.

### Dependency Inversion
Dependencias en abstracciones, no implementaciones concretas.

---

## Referencias

- [C4 Model](https://c4model.com/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
