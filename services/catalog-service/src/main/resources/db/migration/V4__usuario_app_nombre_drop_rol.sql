SET search_path TO catalog;

-- Perfil de aplicación desde claims OIDC firmados; roles solo en JWT (ADR-0004).
ALTER TABLE usuario_app DROP COLUMN IF EXISTS rol;
ALTER TABLE usuario_app ADD COLUMN IF NOT EXISTS nombre VARCHAR(255);

COMMENT ON COLUMN usuario_app.nombre IS 'Nombre para mostrar derivado del token (name o given_name+family_name); nullable.';
