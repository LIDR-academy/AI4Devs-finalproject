-- Script de inicialización para la base de datos de Redmine
-- Se ejecuta automáticamente cuando se crea el contenedor por primera vez

-- Configurar parámetros de base de datos para Redmine
ALTER DATABASE redmine SET datestyle = 'ISO, MDY';
ALTER DATABASE redmine SET timezone = 'UTC';
ALTER DATABASE redmine SET default_text_search_config = 'pg_catalog.english';

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar parámetros de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Mensaje de confirmación
\echo 'Base de datos de Redmine configurada correctamente'; 