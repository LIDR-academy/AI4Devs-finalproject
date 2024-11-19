-- Limpiar todas las tablas manteniendo la integridad referencial
TRUNCATE TABLE notificacion CASCADE;
TRUNCATE TABLE accion_cobro CASCADE;
TRUNCATE TABLE estrategia_cobro CASCADE;
TRUNCATE TABLE clasificacion CASCADE;
TRUNCATE TABLE pago CASCADE;
TRUNCATE TABLE deuda CASCADE;
TRUNCATE TABLE contribuyente CASCADE;

-- Reiniciar las secuencias
ALTER SEQUENCE contribuyente_id_seq RESTART WITH 1;
ALTER SEQUENCE deuda_id_seq RESTART WITH 1;
ALTER SEQUENCE pago_id_seq RESTART WITH 1;
ALTER SEQUENCE clasificacion_id_seq RESTART WITH 1;
ALTER SEQUENCE estrategia_cobro_id_seq RESTART WITH 1;
ALTER SEQUENCE accion_cobro_id_seq RESTART WITH 1;
ALTER SEQUENCE notificacion_id_seq RESTART WITH 1;

-- Poblar tabla Contribuyente
INSERT INTO contribuyente (documento, tipo_documento, nombre, direccion, telefono, email) VALUES
('1234567890', 'CC', 'Juan Pérez', 'Calle 123 #45-67, Medellín', '3001234567', 'juan.perez@email.com'),
('9876543210', 'CC', 'María López', 'Carrera 78 #90-12, Medellín', '3109876543', 'maria.lopez@email.com'),
('8765432109', 'NIT', 'Comercial XYZ S.A.S', 'Avenida 45 #23-45, Medellín', '3208765432', 'contacto@xyz.com'),
('7654321098', 'CC', 'Carlos Rodríguez', 'Calle 89 #12-34, Medellín', '3157654321', 'carlos.rodriguez@email.com'),
('6543210987', 'CC', 'Ana Martínez', 'Carrera 34 #56-78, Medellín', '3046543210', 'ana.martinez@email.com'),
('5432109876', 'NIT', 'Inversiones ABC LTDA', 'Calle 67 #89-12, Medellín', '3135432109', 'contacto@abc.com'),
('4321098765', 'CC', 'Pedro González', 'Avenida 90 #34-56, Medellín', '3224321098', 'pedro.gonzalez@email.com'),
('3210987654', 'CC', 'Laura Sánchez', 'Carrera 12 #67-89, Medellín', '3013210987', 'laura.sanchez@email.com'),
('2109876543', 'NIT', 'Distribuidora DEF S.A', 'Calle 45 #78-90, Medellín', '3102109876', 'contacto@def.com'),
('1098765432', 'CC', 'Diego Ramírez', 'Avenida 78 #12-34, Medellín', '3091098765', 'diego.ramirez@email.com');

-- Poblar tabla Deuda
INSERT INTO deuda (contribuyente_id, monto, fecha_vencimiento, estado, concepto) VALUES
(1, 1500000.00, '2024-06-30', 'PENDIENTE', 'Impuesto Predial 2024'),
(2, 850000.00, '2024-05-15', 'VENCIDA', 'Impuesto Predial 2023'),
(3, 3200000.00, '2024-07-20', 'PENDIENTE', 'Impuesto Predial 2024'),
(4, 750000.00, '2024-04-30', 'VENCIDA', 'Impuesto Predial 2023'),
(5, 1200000.00, '2024-08-15', 'PENDIENTE', 'Impuesto Predial 2024'),
(6, 4500000.00, '2024-06-30', 'PENDIENTE', 'Impuesto Predial 2024'),
(7, 950000.00, '2024-05-20', 'VENCIDA', 'Impuesto Predial 2023'),
(8, 1100000.00, '2024-07-15', 'PENDIENTE', 'Impuesto Predial 2024'),
(9, 2800000.00, '2024-06-30', 'PENDIENTE', 'Impuesto Predial 2024'),
(10, 680000.00, '2024-04-15', 'VENCIDA', 'Impuesto Predial 2023');

-- Poblar tabla Pago
INSERT INTO pago (contribuyente_id, deuda_id, monto, fecha_pago, medio_pago, referencia, estado) VALUES
(1, 1, 500000.00, '2024-02-15', 'PSE', 'REF001', 'COMPLETADO'),
(2, 2, 300000.00, '2024-01-20', 'TARJETA_CREDITO', 'REF002', 'COMPLETADO'),
(3, 3, 1000000.00, '2024-02-10', 'TRANSFERENCIA', 'REF003', 'COMPLETADO'),
(4, 4, 200000.00, '2024-01-15', 'PSE', 'REF004', 'COMPLETADO'),
(5, 5, 400000.00, '2024-02-20', 'TARJETA_DEBITO', 'REF005', 'COMPLETADO');

-- Poblar tabla Clasificación
INSERT INTO clasificacion (contribuyente_id, nivel_probabilidad, score, fecha_clasificacion, estado) VALUES
(1, 'ALTO', 85.5, '2024-02-01', 'ACTIVO'),
(2, 'MEDIO', 65.3, '2024-02-01', 'ACTIVO'),
(3, 'ALTO', 90.2, '2024-02-01', 'ACTIVO'),
(4, 'BAJO', 35.8, '2024-02-01', 'ACTIVO'),
(5, 'MEDIO', 70.4, '2024-02-01', 'ACTIVO'),
(6, 'ALTO', 88.7, '2024-02-01', 'ACTIVO'),
(7, 'BAJO', 40.2, '2024-02-01', 'ACTIVO'),
(8, 'MEDIO', 68.9, '2024-02-01', 'ACTIVO'),
(9, 'ALTO', 92.1, '2024-02-01', 'ACTIVO'),
(10, 'BAJO', 38.5, '2024-02-01', 'ACTIVO');

-- Poblar tabla Estrategia_Cobro
INSERT INTO estrategia_cobro (clasificacion_id, nombre, descripcion) VALUES
(1, 'Recordatorio Amigable', 'Envío de recordatorios amigables para contribuyentes de alta probabilidad'),
(2, 'Incentivos de Pago', 'Ofrecer descuentos y facilidades de pago para contribuyentes de probabilidad media'),
(3, 'Gestión Intensiva', 'Acciones de cobro intensivas para contribuyentes de baja probabilidad'),
(4, 'Plan de Financiación', 'Ofrecer planes de financiación personalizados'),
(5, 'Visitas Programadas', 'Programación de visitas para gestión personalizada');

-- Poblar tabla Accion_Cobro
INSERT INTO accion_cobro (estrategia_id, tipo_accion, descripcion, orden) VALUES
(1, 'NOTIFICACION', 'Envío de correo electrónico recordatorio', 1),
(1, 'SMS', 'Envío de mensaje de texto recordatorio', 2),
(2, 'LLAMADA', 'Llamada telefónica de seguimiento', 1),
(2, 'VISITA', 'Visita personal al contribuyente', 2),
(3, 'NOTIFICACION_LEGAL', 'Envío de notificación legal', 1);

-- Poblar tabla Notificación
INSERT INTO notificacion (accion_cobro_id, contribuyente_id, tipo, contenido, estado, fecha_envio, fecha_lectura) VALUES
(1, 1, 'EMAIL', 'Recordatorio de pago pendiente', 'ENVIADO', '2024-02-15 10:00:00', '2024-02-15 14:30:00'),
(2, 2, 'SMS', 'Su pago está próximo a vencer', 'ENVIADO', '2024-02-15 11:00:00', NULL),
(3, 3, 'EMAIL', 'Oferta de descuento por pronto pago', 'ENVIADO', '2024-02-15 12:00:00', '2024-02-15 15:45:00'),
(4, 4, 'CARTA', 'Notificación de cobro legal', 'ENVIADO', '2024-02-15 13:00:00', NULL),
(5, 5, 'EMAIL', 'Invitación a acordar plan de pagos', 'ENVIADO', '2024-02-15 14:00:00', '2024-02-15 16:20:00');