-- Migration: Create members table
-- Description: Creates the members table for storing member profiles and authentication

CREATE TABLE IF NOT EXISTS members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL,
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
  CONSTRAINT fk_members_role_id FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- Create indexes for frequent lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_membership_number ON members(membership_number);
CREATE INDEX IF NOT EXISTS idx_members_role_id ON members(role_id);

-- Add comments
COMMENT ON TABLE members IS 'Stores member profiles, credentials, and personal information';
COMMENT ON COLUMN members.member_id IS 'Unique identifier for the member';
COMMENT ON COLUMN members.email IS 'Unique email for login and contact';
COMMENT ON COLUMN members.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN members.membership_number IS 'Internal unique member number';
COMMENT ON COLUMN members.status IS 'Member account status (ACTIVE, INACTIVE, BLOCKED)';
COMMENT ON COLUMN members.last_login_at IS 'Timestamp of last successful login';
