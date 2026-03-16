-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS astillero_tools;
USE astillero_tools;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    uuid CHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT FALSE,
    dh_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    dh_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT FALSE,
    dh_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    dh_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de herramientas
CREATE TABLE IF NOT EXISTS herramientas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT FALSE,
    dh_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    dh_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de movimientos de herramientas
CREATE TABLE IF NOT EXISTS movimientos_herramienta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    herramienta_id INT NOT NULL,
    operario_uuid CHAR(36) NULL,
    ubicacion_id INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME,
    fecha_solicitud_fin DATETIME NULL,
    dh_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    dh_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (herramienta_id) REFERENCES herramientas(id),
    FOREIGN KEY (operario_uuid) REFERENCES usuarios(uuid),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id)
);

-- Tabla de códigos de login
CREATE TABLE IF NOT EXISTS codigos_login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_uuid CHAR(36) NOT NULL,
    codigo VARCHAR(8) NOT NULL,
    fecha_envio DATETIME NOT NULL,
    fecha_validacion DATETIME,
    activo BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_uuid) REFERENCES usuarios(uuid)
);

-- Tabla de intentos de login (rate limiting)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    INDEX idx_email_time (email, attempt_time),
    INDEX idx_ip_time (ip_address, attempt_time)
);

-- Agregar índices para mejorar rendimiento:
CREATE INDEX idx_movimientos_herramienta ON movimientos_herramienta(herramienta_id, fecha_fin);
CREATE INDEX idx_movimientos_operario ON movimientos_herramienta(operario_uuid, fecha_fin);
CREATE INDEX idx_movimientos_fecha ON movimientos_herramienta(dh_created DESC);