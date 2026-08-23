-- Migration: Create admin_users table
-- Description: Creates admin_users table for administrative access separation

CREATE TABLE IF NOT EXISTS admin_users (
  admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL,
  member_id UUID,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_users_role_id FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
  CONSTRAINT fk_admin_users_member_id FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL
);

-- Create indexes for frequent lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_member_id ON admin_users(member_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

-- Add comments
COMMENT ON TABLE admin_users IS 'Stores administrative user profiles separated from regular members';
COMMENT ON COLUMN admin_users.admin_id IS 'Unique identifier for the admin user';
COMMENT ON COLUMN admin_users.username IS 'Unique username for admin login';
COMMENT ON COLUMN admin_users.member_id IS 'Optional reference to member profile if admin is also a member';
COMMENT ON COLUMN admin_users.status IS 'Admin account status (ACTIVE, INACTIVE)';
