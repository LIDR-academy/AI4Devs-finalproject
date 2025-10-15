-- Script de inicialización de la base de datos para desarrollo local
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear esquemas separados para cada servicio
CREATE SCHEMA IF NOT EXISTS trips;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS bookings;
CREATE SCHEMA IF NOT EXISTS matches;
CREATE SCHEMA IF NOT EXISTS notifications;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar permisos
GRANT ALL PRIVILEGES ON DATABASE app TO app;
GRANT ALL PRIVILEGES ON SCHEMA trips TO app;
GRANT ALL PRIVILEGES ON SCHEMA users TO app;
GRANT ALL PRIVILEGES ON SCHEMA bookings TO app;
GRANT ALL PRIVILEGES ON SCHEMA matches TO app;
GRANT ALL PRIVILEGES ON SCHEMA notifications TO app;

-- Configurar search_path para incluir todos los esquemas
ALTER DATABASE app SET search_path TO public, trips, users, bookings, matches, notifications;
