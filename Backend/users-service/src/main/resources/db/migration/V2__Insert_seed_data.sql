-- Set search path to users schema
SET search_path TO users, public;

-- Insert seed data for testing
INSERT INTO users (id, name, email, sede_id, role) VALUES
    ('user-001', 'Ana García', 'ana.garcia@company.com', 'SEDE-1', 'EMPLOYEE'),
    ('user-002', 'Carlos López', 'carlos.lopez@company.com', 'SEDE-1', 'EMPLOYEE'),
    ('user-003', 'María Rodríguez', 'maria.rodriguez@company.com', 'SEDE-2', 'EMPLOYEE'),
    ('user-004', 'Pedro Martín', 'pedro.martin@company.com', 'SEDE-1', 'ADMIN'),
    ('user-005', 'Laura Sánchez', 'laura.sanchez@company.com', 'SEDE-2', 'EMPLOYEE');
