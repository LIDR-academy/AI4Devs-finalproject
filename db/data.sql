USE astillero_tools;

-- ======================================
-- INSERTS EN TABLA usuarios
-- ======================================
INSERT INTO usuarios (uuid, nombre, email, activo)
VALUES 
(UUID(), 'Daniel Sánchez - Septeo', 'operario@astillero.com',true);

-- ======================================
-- INSERTS EN TABLA ubicaciones
-- ======================================
-- 30 ubicaciones de almacén
INSERT INTO ubicaciones (nombre)
VALUES
('Almacen Principal A1'),
('Almacen Principal A2'),
('Almacen Principal A3'),
('Almacen Principal A4'),
('Almacen Principal A5'),
('Almacen Pintura P1'),
('Almacen Pintura P2'),
('Almacen Carpintería C1'),
('Almacen Carpintería C2'),
('Almacen Carpintería C3'),
('Almacen Soldadura S1'),
('Almacen Soldadura S2'),
('Almacen Soldadura S3'),
('Almacen Electricidad E1'),
('Almacen Electricidad E2'),
('Almacen Electricidad E3'),
('Almacen General Norte'),
('Almacen General Sur'),
('Almacen General Este'),
('Almacen General Oeste'),
('Almacen Auxiliar 1'),
('Almacen Auxiliar 2'),
('Almacen Herramientas Portátiles'),
('Almacen Materiales Pesados'),
('Almacen de Repuestos'),
('Almacen de Cabos y Cables'),
('Almacen de Motores'),
('Almacen de Equipos de Seguridad'),
('Almacen Temporal'),
('Almacen Externo');

-- 10 ubicaciones de puestos de trabajo
INSERT INTO ubicaciones (nombre)
VALUES
('Puesto Soldadura 1'),
('Puesto Soldadura 2'),
('Puesto Electricidad 1'),
('Puesto Electricidad 2'),
('Puesto Carpintería 1'),
('Puesto Carpintería 2'),
('Puesto Mantenimiento General'),
('Puesto Montaje de Cubierta'),
('Puesto Control de Calidad'),
('Puesto Dirección Técnica');

-- ======================================
-- INSERTS EN TABLA herramientas
-- ======================================
INSERT INTO herramientas (nombre, codigo)
VALUES
('Taladro Inalámbrico Bosch GSR 12V', 'HR001'),
('Amoladora Angular Makita GA5030', 'HR002'),
('Atornillador Impacto DeWalt DCF887', 'HR003'),
('Sierra Circular Bosch GKS 18V', 'HR004'),
('Multiherramienta Oscilante Dremel 8260', 'HR005'),
('Llave de Impacto Milwaukee M18', 'HR006'),
('Taladro Percutor Hitachi DV18', 'HR007'),
('Pulidora Metabo PE 12-175', 'HR008'),
('Lijadora Orbital Makita BO3710', 'HR009'),
('Cortadora de Metal Bosch GCO 14-24', 'HR010');
