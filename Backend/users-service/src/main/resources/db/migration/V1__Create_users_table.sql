-- Set search path to users schema
SET search_path TO users, public;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    sede_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_sede_id ON users(sede_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comments
COMMENT ON TABLE users IS 'Users/employees of the company';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user (from Keycloak)';
COMMENT ON COLUMN users.name IS 'Full name of the user';
COMMENT ON COLUMN users.email IS 'Email address of the user';
COMMENT ON COLUMN users.sede_id IS 'Office/sede where the user works';
COMMENT ON COLUMN users.role IS 'Role of the user (EMPLOYEE, ADMIN, etc.)';
