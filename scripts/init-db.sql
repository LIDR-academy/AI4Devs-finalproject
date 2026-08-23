-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ROLES - Tabla de referencia para perfiles y permisos
-- ============================================================================
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. MEMBERS - Perfil principal de los socios
-- ============================================================================
CREATE TABLE members (
    member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(role_id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    birth_date DATE,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    membership_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- ============================================================================
-- 3. ADMIN_USERS - Perfiles habilitados para administrar la plataforma
-- ============================================================================
CREATE TABLE admin_users (
    admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(role_id),
    member_id UUID REFERENCES members(member_id),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. ROUTES - Entidad central de rutas y actividades
-- ============================================================================
CREATE TABLE routes (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by_member UUID REFERENCES members(member_id),
    created_by_admin UUID REFERENCES admin_users(admin_id),
    created_by_type VARCHAR(10) NOT NULL CHECK (created_by_type IN ('MEMBER', 'ADMIN')),
    reviewed_by UUID REFERENCES admin_users(admin_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    distance_km DECIMAL(10, 2),
    meeting_point VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'PROPOSAL' 
        CHECK (status IN ('PROPOSAL', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'COMPLETED', 'CANCELLED')),
    departure_date DATE,
    departure_time TIME,
    return_date DATE,
    has_lodging BOOLEAN DEFAULT FALSE,
    has_restaurant BOOLEAN DEFAULT FALSE,
    base_price DECIMAL(10, 2),
    lodging_price DECIMAL(10, 2) DEFAULT 0,
    restaurant_price DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2),
    route_data JSONB DEFAULT '{}',
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_creator CHECK (
        (created_by_member IS NOT NULL AND created_by_admin IS NULL) OR
        (created_by_member IS NULL AND created_by_admin IS NOT NULL)
    )
);

-- ============================================================================
-- 5. ROUTE_MEDIA - Colección de imágenes/vídeos de las rutas
-- ============================================================================
CREATE TABLE route_media (
    media_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO')),
    file_url VARCHAR(500) NOT NULL,
    cloud_key VARCHAR(255),
    caption VARCHAR(500),
    is_cover BOOLEAN DEFAULT FALSE,
    uploaded_by UUID NOT NULL REFERENCES admin_users(admin_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. CALENDAR_EVENTS - Entrada en el calendario de actividades
-- ============================================================================
CREATE TABLE calendar_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(route_id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES admin_users(admin_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP,
    location VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' 
        CHECK (status IN ('SCHEDULED', 'DONE', 'CANCELLED')),
    capacity INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. ROUTE_REGISTRATIONS - Inscripciones de socios a rutas
-- ============================================================================
CREATE TABLE route_registrations (
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    registration_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (registration_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    companions INTEGER DEFAULT 0,
    amount_due DECIMAL(10, 2) DEFAULT 0,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_registration UNIQUE(route_id, member_id),
    CONSTRAINT valid_amounts CHECK (amount_due >= 0 AND amount_paid >= 0)
);

-- ============================================================================
-- 8. PAYMENTS - Control de cobros
-- ============================================================================
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
    registration_id UUID REFERENCES route_registrations(registration_id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('STRIPE', 'PAYPAL', 'MANUAL')),
    provider_payment_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR' 
        CHECK (currency IN ('EUR', 'USD', 'GBP')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    provider_payload JSONB DEFAULT '{}',
    CONSTRAINT valid_amount CHECK (amount > 0)
);

-- ============================================================================
-- 9. NOTIFICATIONS - Avisos y comunicaciones
-- ============================================================================
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(route_id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES admin_users(admin_id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'GENERAL' 
        CHECK (type IN ('ROUTE', 'GENERAL', 'REMINDER')),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'SENT', 'FAILED')),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. NOTIFICATION_RECIPIENTS - Reparto de mensajes
-- ============================================================================
CREATE TABLE notification_recipients (
    notification_recipient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (delivery_status IN ('PENDING', 'SENT', 'OPENED', 'FAILED')),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP
);

-- ============================================================================
-- 11. AUDIT_LOGS - Registro de operaciones relevantes
-- ============================================================================
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_member_id UUID REFERENCES members(member_id) ON DELETE SET NULL,
    actor_admin_id UUID REFERENCES admin_users(admin_id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL 
        CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'PAYMENT', 'SEND_EMAIL')),
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_actor CHECK (
        (actor_member_id IS NOT NULL AND actor_admin_id IS NULL) OR
        (actor_member_id IS NULL AND actor_admin_id IS NOT NULL)
    )
);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Members indices
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_role_id ON members(role_id);

-- Admin users indices
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role_id ON admin_users(role_id);

-- Routes indices
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_created_by_member ON routes(created_by_member);
CREATE INDEX idx_routes_created_by_admin ON routes(created_by_admin);
CREATE INDEX idx_routes_departure_date ON routes(departure_date);

-- Route registrations indices
CREATE INDEX idx_route_registrations_member ON route_registrations(member_id);
CREATE INDEX idx_route_registrations_route ON route_registrations(route_id);
CREATE INDEX idx_route_registrations_status ON route_registrations(registration_status);

-- Payments indices
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_route ON payments(route_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Notifications indices
CREATE INDEX idx_notifications_created_by ON notifications(created_by);
CREATE INDEX idx_notifications_route ON notifications(route_id);

-- Notification recipients indices
CREATE INDEX idx_notification_recipients_member ON notification_recipients(member_id);
CREATE INDEX idx_notification_recipients_notification ON notification_recipients(notification_id);

-- Audit logs indices
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor_member ON audit_logs(actor_member_id);
CREATE INDEX idx_audit_logs_actor_admin ON audit_logs(actor_admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Insertar roles base
INSERT INTO roles (role_name, permissions) VALUES
    ('SOCIO', '{"view_routes": true, "propose_routes": true, "register_routes": false, "pay": true}'),
    ('ADMIN', '{"view_routes": true, "create_routes": true, "review_routes": true, "manage_payments": true, "send_notifications": true}'),
    ('SUPERADMIN', '{"*": true}')
ON CONFLICT (role_name) DO NOTHING;
