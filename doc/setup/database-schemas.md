# 🗄️ Estructura de Base de Datos - Schemas

## Resumen

El proyecto utiliza **PostgreSQL con schemas separados por servicio** para mejor organización y aislamiento de datos.

```
Base de datos: app
├── Schema: users      → Datos del servicio users-service
├── Schema: trips      → Datos del servicio trips-service
├── Schema: bookings   → Datos del servicio booking-service
└── Schema: matches    → Datos del servicio matching-service
```

---

## 📊 Schemas y Tablas

### **users.users**
**Servicio**: users-service  
**Puerto**: 8082

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | VARCHAR(255) | ID del usuario (desde Keycloak) |
| name | VARCHAR(255) | Nombre completo |
| email | VARCHAR(255) | Email corporativo (único) |
| sede_id | VARCHAR(255) | ID de la sede |
| role | VARCHAR(50) | Rol (EMPLOYEE, ADMIN) |
| created_at | TIMESTAMP WITH TIME ZONE | Fecha de creación |
| updated_at | TIMESTAMP WITH TIME ZONE | Fecha de actualización |

**Índices**:
- `idx_users_email` → Búsqueda por email
- `idx_users_sede_id` → Filtrar por sede
- `idx_users_role` → Filtrar por rol

---

### **trips.trips**
**Servicio**: trips-service  
**Puerto**: 8081

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | ID del viaje |
| driver_id | VARCHAR(255) | ID del conductor |
| origin | VARCHAR(255) | Ubicación origen ("lat,lng") |
| destination_sede_id | VARCHAR(255) | ID de la sede destino |
| date_time | TIMESTAMP WITH TIME ZONE | Fecha y hora del viaje |
| seats_total | INTEGER | Asientos totales |
| seats_free | INTEGER | Asientos disponibles |
| created_at | TIMESTAMP WITH TIME ZONE | Fecha de creación |
| updated_at | TIMESTAMP WITH TIME ZONE | Fecha de actualización |

**Índices**:
- `idx_trips_destination_sede_id` → Filtrar por destino
- `idx_trips_date_time` → Ordenar/filtrar por fecha
- `idx_trips_driver_id` → Viajes de un conductor
- `idx_trips_seats_free` → Viajes con asientos disponibles

**Constraints**:
- `seats_total > 0`
- `seats_free >= 0 AND seats_free <= seats_total`

---

### **bookings.bookings**
**Servicio**: booking-service  
**Puerto**: 8083

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | ID de la reserva |
| trip_id | UUID | ID del viaje reservado |
| passenger_id | VARCHAR(255) | ID del pasajero |
| seats_requested | INTEGER | Asientos reservados |
| status | VARCHAR(50) | Estado (PENDING, CONFIRMED, CANCELLED) |
| created_at | TIMESTAMP WITH TIME ZONE | Fecha de creación |
| updated_at | TIMESTAMP WITH TIME ZONE | Fecha de actualización |

**Índices**:
- `idx_bookings_trip_id` → Reservas de un viaje
- `idx_bookings_passenger_id` → Reservas de un usuario
- `idx_bookings_status` → Filtrar por estado

**Constraints**:
- `seats_requested > 0`

---

### **matches.matches**
**Servicio**: matching-service  
**Puerto**: 8084

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | ID del match |
| trip_id | UUID | ID del viaje |
| passenger_id | VARCHAR(255) | ID del pasajero |
| driver_id | VARCHAR(255) | ID del conductor |
| match_score | DECIMAL(3,2) | Score de compatibilidad (0.0-1.0) |
| status | VARCHAR(50) | Estado (PENDING, ACCEPTED, REJECTED) |
| created_at | TIMESTAMP WITH TIME ZONE | Fecha de creación |
| updated_at | TIMESTAMP WITH TIME ZONE | Fecha de actualización |

**Índices**:
- `idx_matches_trip_id` → Matches de un viaje
- `idx_matches_passenger_id` → Matches de un pasajero
- `idx_matches_driver_id` → Matches de un conductor
- `idx_matches_status` → Filtrar por estado
- `idx_matches_score` → Ordenar por compatibilidad

**Constraints**:
- `match_score >= 0.0 AND match_score <= 1.0`

---

## 🔧 Migraciones con Flyway

Cada servicio tiene sus propias migraciones en:
```
Backend/{servicio}/src/main/resources/db/migration/
├── V1__Create_{tabla}_table.sql    → Crea la tabla
├── V2__Insert_seed_data.sql        → Datos iniciales
└── V3__*.sql                        → Migraciones adicionales
```

**Importante**: Cada migración debe empezar con:
```sql
SET search_path TO {schema}, public;
```

Esto asegura que las tablas se crean en el schema correcto.

---

## 🌱 Datos de Seed

### Script de Seeds
```bash
./scripts/seed-test-data.sh
```

Este script inserta datos de prueba en todos los schemas:
- 5 usuarios
- 4 viajes
- 2 reservas
- 3 matches

### Usuarios de Prueba
| ID | Nombre | Email | Sede | Rol |
|----|--------|-------|------|-----|
| user-001 | Ana García | ana.garcia@company.com | SEDE-1 | EMPLOYEE |
| user-002 | Carlos López | carlos.lopez@company.com | SEDE-1 | EMPLOYEE |
| user-003 | María Rodríguez | maria.rodriguez@company.com | SEDE-2 | EMPLOYEE |
| user-004 | Pedro Martín | pedro.martin@company.com | SEDE-1 | ADMIN |
| user-005 | Laura Sánchez | laura.sanchez@company.com | SEDE-2 | EMPLOYEE |

---

## 🔍 Verificación

### Ver todas las tablas y schemas:
```bash
docker exec covoituraje_db psql -U app -d app -c "
SELECT table_schema, table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_schema = t.table_schema 
        AND table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema IN ('users', 'trips', 'bookings', 'matches')
ORDER BY table_schema, table_name;
"
```

### Contar registros en cada tabla:
```bash
docker exec covoituraje_db psql -U app -d app -c "
SELECT 'users.users' as tabla, COUNT(*) FROM users.users
UNION ALL SELECT 'trips.trips', COUNT(*) FROM trips.trips
UNION ALL SELECT 'bookings.bookings', COUNT(*) FROM bookings.bookings
UNION ALL SELECT 'matches.matches', COUNT(*) FROM matches.matches
ORDER BY tabla;
"
```

### Verificar schema de una entidad:
```bash
docker exec covoituraje_db psql -U app -d app -c "\d trips.trips"
```

---

## 🚨 Problemas Comunes

### Error: "relation does not exist"
**Causa**: La entidad JPA no especifica el schema correcto.

**Solución**: Verificar que la entidad tiene:
```java
@Entity
@Table(name = "tabla", schema = "schema")
public class Entity {
    // ...
}
```

### Error: Datos no aparecen después de insertar
**Causa**: INSERT se hizo en schema incorrecto (probablemente `public`)

**Solución**: Usar `SET search_path` antes del INSERT:
```sql
SET search_path TO schema_correcto, public;
INSERT INTO tabla ...
```

### Error: Flyway crea tablas en public
**Causa**: Las migraciones no especifican el schema

**Solución**: Todas las migraciones deben empezar con:
```sql
SET search_path TO {schema}, public;
```

---

## 📝 Configuración JPA

Cada servicio tiene su `persistence.xml` configurado para usar el schema correcto:

```xml
<property name="hibernate.default_schema" value="schema_name"/>
```

Y las entidades especifican explícitamente el schema:

```java
@Entity
@Table(name = "tabla", schema = "schema")
```

Esto garantiza que JPA use el schema correcto tanto para queries como para DDL.

---

## 🧪 Testing

Los tests de integración deben:
1. Crear un schema temporal
2. Ejecutar migraciones Flyway
3. Verificar que las tablas están en el schema correcto
4. Ejecutar tests
5. Limpiar

Ver: `Backend/{service}/src/test/resources/META-INF/persistence.xml` para configuración de tests.

---

## 🔗 Referencias

- **Modelo ER completo**: `/doc/plan/er-model.md`
- **Diagrama ER visual**: `/doc/MVP/diagrama-ER.png`
- **System Patterns**: `/memory-bank/systemPatterns.md`
- **Migraciones**: `Backend/{service}/src/main/resources/db/migration/`


