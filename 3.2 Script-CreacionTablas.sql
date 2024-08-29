-- Crear los esquemas para los microservicios
CREATE SCHEMA IF NOT EXISTS auth_service;
CREATE SCHEMA IF NOT EXISTS customer_service;
CREATE SCHEMA IF NOT EXISTS provider_service;
CREATE SCHEMA IF NOT EXISTS service_management;
CREATE SCHEMA IF NOT EXISTS booking_service;
CREATE SCHEMA IF NOT EXISTS referral_service;
CREATE SCHEMA IF NOT EXISTS admin_service;

-- Crear la tabla de usuarios en auth_service
CREATE TABLE auth_service.users (
    user_id SERIAL PRIMARY KEY,
    firebase_user_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_access TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Crear la tabla de roles en auth_service
CREATE TABLE auth_service.roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Crear la tabla de relaciones entre usuarios y roles en auth_service
CREATE TABLE auth_service.user_roles (
    user_role_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_service.users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES auth_service.roles(role_id) ON DELETE CASCADE,
    UNIQUE (user_id, role_id)
);

-- Crear la tabla de permisos en auth_service
CREATE TABLE auth_service.permissions (
    permission_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Crear la tabla de relaciones entre roles y permisos en auth_service
CREATE TABLE auth_service.role_permissions (
    role_permission_id SERIAL PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES auth_service.roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES auth_service.permissions(permission_id) ON DELETE CASCADE,
    UNIQUE (role_id, permission_id)
);

-- Crear la tabla de clientes en customer_service
CREATE TABLE customer_service.customers (
    customer_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES auth_service.users(user_id) ON DELETE CASCADE
);

-- Crear la tabla de proveedores en provider_service
CREATE TABLE provider_service.providers (
    provider_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    specialty VARCHAR(255),
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3, 2) DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES auth_service.users(user_id) ON DELETE CASCADE
);

-- Crear la tabla de categorías en service_management
CREATE TABLE service_management.categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Crear la tabla de servicios en service_management
CREATE TABLE service_management.services (
    service_id SERIAL PRIMARY KEY,
    provider_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    estimated_duration VARCHAR(50),
    FOREIGN KEY (provider_id) REFERENCES provider_service.providers(provider_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_management.categories(category_id) ON DELETE CASCADE
);

-- Crear la tabla de relaciones entre servicios y categorías en service_management
CREATE TABLE service_management.service_categories (
    service_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (service_id, category_id),
    FOREIGN KEY (service_id) REFERENCES service_management.services(service_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_management.categories(category_id) ON DELETE CASCADE
);

-- Crear la tabla de reservas en booking_service
CREATE TABLE booking_service.bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    rating DECIMAL(3, 2),
    comments TEXT,
    FOREIGN KEY (customer_id) REFERENCES customer_service.customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service_management.services(service_id) ON DELETE CASCADE
);

-- Crear la tabla de transacciones en booking_service
CREATE TABLE booking_service.transactions (
    transaction_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    status VARCHAR(50),
    FOREIGN KEY (booking_id) REFERENCES booking_service.bookings(booking_id) ON DELETE CASCADE
);

-- Crear la tabla de referidos en referral_service
CREATE TABLE referral_service.referrals (
    referral_id SERIAL PRIMARY KEY,
    referring_user_id INT NOT NULL,
    referred_user_id INT NOT NULL,
    referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (referring_user_id) REFERENCES auth_service.users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES auth_service.users(user_id) ON DELETE CASCADE
);

-- Crear la tabla de recompensas en referral_service
CREATE TABLE referral_service.rewards (
    reward_id SERIAL PRIMARY KEY,
    referral_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reward_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_id) REFERENCES referral_service.referrals(referral_id) ON DELETE CASCADE
);

-- Crear la tabla de administradores en admin_service
CREATE TABLE admin_service.admins (
    admin_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_service.users(user_id) ON DELETE CASCADE
);

-- Índices adicionales para mejorar el rendimiento
CREATE INDEX idx_user_email ON auth_service.users(email);
CREATE INDEX idx_user_firebase_id ON auth_service.users(firebase_user_id);
CREATE INDEX idx_role_name ON auth_service.roles(role_name);
CREATE INDEX idx_permission_name ON auth_service.permissions(name);
CREATE INDEX idx_provider_specialty ON provider_service.providers(specialty);
CREATE INDEX idx_service_name ON service_management.services(name);
CREATE INDEX idx_booking_status ON booking_service.bookings(status);
CREATE INDEX idx_transaction_status ON booking_service.transactions(status);
