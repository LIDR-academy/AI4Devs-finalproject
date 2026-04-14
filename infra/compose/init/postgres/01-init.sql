-- Esquemas de aplicación y PostGIS en la BD principal (POSTGRES_DB).
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS notification;
CREATE SCHEMA IF NOT EXISTS ai;

CREATE EXTENSION IF NOT EXISTS postgis;

-- Rol y BD para Keycloak (contraseña alineada con KEYCLOAK_DB_PASSWORD en docker-compose / .env.example).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'keycloak') THEN
    CREATE ROLE keycloak LOGIN PASSWORD 'keycloak_dev_password';
  END IF;
END
$$;

CREATE DATABASE keycloak OWNER keycloak;
