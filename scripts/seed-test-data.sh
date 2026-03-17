#!/bin/bash

# Script para generar datos de seed en la base de datos para tests
# Inserta datos de prueba en todos los schemas

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Generando datos de seed para tests...${NC}"
echo ""

# Verificar que PostgreSQL está corriendo
if ! docker exec covoituraje_db pg_isready -U app &>/dev/null; then
    echo -e "${RED}❌ PostgreSQL no está corriendo${NC}"
    echo -e "${YELLOW}💡 Ejecuta primero: ./scripts/dev-infra.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL está disponible${NC}"
echo ""

# Función para ejecutar SQL con feedback
execute_sql() {
    local schema=$1
    local description=$2
    local sql=$3
    
    echo -e "${BLUE}📝 ${description}...${NC}"
    
    if docker exec covoituraje_db psql -U app -d app -c "${sql}" > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Completado${NC}"
    else
        echo -e "${RED}   ❌ Error${NC}"
        return 1
    fi
}

# ==========================================
# USERS (Schema: users)
# ==========================================
echo -e "${BLUE}👥 Insertando usuarios de prueba...${NC}"

docker exec covoituraje_db psql -U app -d app <<'EOF'
SET search_path TO users, public;

INSERT INTO users (id, name, email, sede_id, role, created_at, updated_at) VALUES
    ('user-001', 'Ana García', 'ana.garcia@company.com', 'SEDE-1', 'EMPLOYEE', NOW(), NOW()),
    ('user-002', 'Carlos López', 'carlos.lopez@company.com', 'SEDE-1', 'EMPLOYEE', NOW(), NOW()),
    ('user-003', 'María Rodríguez', 'maria.rodriguez@company.com', 'SEDE-2', 'EMPLOYEE', NOW(), NOW()),
    ('user-004', 'Pedro Martín', 'pedro.martin@company.com', 'SEDE-1', 'ADMIN', NOW(), NOW()),
    ('user-005', 'Laura Sánchez', 'laura.sanchez@company.com', 'SEDE-2', 'EMPLOYEE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    sede_id = EXCLUDED.sede_id,
    role = EXCLUDED.role,
    updated_at = NOW();

SELECT COUNT(*) as usuarios_insertados FROM users;
EOF

# ==========================================
# TRIPS (Schema: trips)
# ==========================================
echo -e "${BLUE}🚗 Insertando viajes de prueba...${NC}"

docker exec covoituraje_db psql -U app -d app <<'EOF'
SET search_path TO trips, public;

-- Limpiar viajes antiguos si existen
DELETE FROM trips WHERE driver_id IN ('user-001', 'user-002', 'user-003');

INSERT INTO trips (id, driver_id, origin, destination_sede_id, date_time, seats_total, seats_free, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'user-001', '40.4168,-3.7038', 'SEDE-1', '2025-10-15T08:00:00+00:00', 4, 4, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'user-001', '40.4200,-3.7100', 'SEDE-2', '2025-10-15T09:00:00+00:00', 3, 3, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'user-002', '40.4300,-3.6900', 'SEDE-1', '2025-10-16T08:30:00+00:00', 5, 5, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'user-003', '40.4100,-3.7200', 'SEDE-2', '2025-10-16T17:00:00+00:00', 2, 2, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    seats_total = EXCLUDED.seats_total,
    seats_free = EXCLUDED.seats_free,
    date_time = EXCLUDED.date_time,
    updated_at = NOW();

SELECT COUNT(*) as viajes_insertados FROM trips;
EOF

# ==========================================
# BOOKINGS (Schema: bookings)
# ==========================================
echo -e "${BLUE}📅 Insertando reservas de prueba...${NC}"

docker exec covoituraje_db psql -U app -d app <<'EOF'
SET search_path TO bookings, public;

-- Limpiar reservas antiguas
DELETE FROM bookings WHERE passenger_id IN ('user-004', 'user-005');

INSERT INTO bookings (id, trip_id, passenger_id, seats_requested, status, created_at, updated_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'user-004', 1, 'CONFIRMED', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'user-005', 2, 'PENDING', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW();

SELECT COUNT(*) as reservas_insertadas FROM bookings;
EOF

# ==========================================
# MATCHES (Schema: matches)
# ==========================================
echo -e "${BLUE}🎯 Insertando matches de prueba...${NC}"

docker exec covoituraje_db psql -U app -d app <<'EOF'
SET search_path TO matches, public;

-- Limpiar matches antiguos
DELETE FROM matches WHERE passenger_id IN ('user-004', 'user-005');

INSERT INTO matches (id, trip_id, passenger_id, driver_id, match_score, status, created_at, updated_at) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'user-004', 'user-001', 0.95, 'PENDING', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'user-005', 'user-001', 0.85, 'PENDING', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'user-004', 'user-002', 0.75, 'PENDING', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    match_score = EXCLUDED.match_score,
    status = EXCLUDED.status,
    updated_at = NOW();

SELECT COUNT(*) as matches_insertados FROM matches;
EOF

# ==========================================
# RESUMEN
# ==========================================
echo ""
echo -e "${GREEN}✅ Datos de seed insertados exitosamente!${NC}"
echo ""
echo -e "${BLUE}📊 Resumen de registros:${NC}"

docker exec covoituraje_db psql -U app -d app <<'EOF'
SELECT 
    'users.users' as tabla,
    COUNT(*) as registros
FROM users.users
UNION ALL
SELECT 'trips.trips', COUNT(*) FROM trips.trips
UNION ALL
SELECT 'bookings.bookings', COUNT(*) FROM bookings.bookings
UNION ALL
SELECT 'matches.matches', COUNT(*) FROM matches.matches
UNION ALL
SELECT 'notifications.notification_subscriptions', COUNT(*) FROM notifications.notification_subscriptions
ORDER BY tabla;
EOF

echo ""
echo -e "${BLUE}💡 Datos de prueba disponibles:${NC}"
echo ""
echo -e "${YELLOW}Usuarios:${NC}"
echo "  • user-001 (Ana García) - SEDE-1, EMPLOYEE"
echo "  • user-002 (Carlos López) - SEDE-1, EMPLOYEE"
echo "  • user-003 (María Rodríguez) - SEDE-2, EMPLOYEE"
echo "  • user-004 (Pedro Martín) - SEDE-1, ADMIN"
echo "  • user-005 (Laura Sánchez) - SEDE-2, EMPLOYEE"
echo ""
echo -e "${YELLOW}Viajes:${NC}"
echo "  • 4 viajes programados para diferentes sedes y horarios"
echo ""
echo -e "${YELLOW}Reservas:${NC}"
echo "  • 2 reservas de prueba (1 confirmada, 1 pendiente)"
echo ""
echo -e "${YELLOW}Matches:${NC}"
echo "  • 3 matches con diferentes scores de compatibilidad"
echo ""
echo -e "${YELLOW}Notificaciones:${NC}"
echo "  • 3 suscripciones de notificaciones push (2 activas, 1 inactiva)"
echo ""

