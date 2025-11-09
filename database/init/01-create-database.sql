-- Database initialization script for SEPE Templates Comparator
-- This script creates the main database and user if they don't exist

-- Create database
SELECT 'CREATE DATABASE sepe_comparator'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sepe_comparator')\gexec

-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'sepe_user') THEN

      CREATE ROLE sepe_user LOGIN PASSWORD 'sepe_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sepe_comparator TO sepe_user;

-- Connect to the database
\c sepe_comparator;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Grant usage on extensions
GRANT USAGE ON SCHEMA public TO sepe_user;
GRANT CREATE ON SCHEMA public TO sepe_user;
