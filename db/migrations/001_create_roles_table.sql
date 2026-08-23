-- Migration: Create roles table
-- Description: Creates the roles table with permissions column

CREATE TABLE IF NOT EXISTS roles (
  role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on role_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_role_name ON roles(role_name);

-- Add comment to table
COMMENT ON TABLE roles IS 'Stores role definitions with associated permissions';
COMMENT ON COLUMN roles.role_id IS 'Unique identifier for the role';
COMMENT ON COLUMN roles.role_name IS 'Unique role name (SOCIO, ADMIN, SUPERADMIN, etc.)';
COMMENT ON COLUMN roles.permissions IS 'JSON object containing role permissions';
