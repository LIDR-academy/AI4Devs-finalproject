-- Migration: Seed initial roles
-- Description: Inserts the basic roles (SOCIO, ADMIN) with default permissions

INSERT INTO roles (role_name, permissions) VALUES
  ('SOCIO', '{"view_routes": true, "propose_routes": true, "register_routes": true, "view_profile": true, "update_profile": true, "view_calendar": true, "make_payments": true, "view_notifications": true}'::jsonb),
  ('ADMIN', '{"create_routes": true, "edit_routes": true, "delete_routes": true, "manage_proposals": true, "upload_media": true, "manage_calendar": true, "send_notifications": true, "manage_members": true, "view_payments": true, "manage_admin_users": true, "view_audit_logs": true}'::jsonb),
  ('SUPERADMIN', '{"*": true}'::jsonb)
ON CONFLICT (role_name) DO NOTHING;

-- Add comment
COMMENT ON TABLE roles IS 'Stores role definitions: SOCIO (regular member), ADMIN (moderator), SUPERADMIN (full access)';
