-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tablas

-- Tabla Contribuyente
CREATE TABLE contribuyente (
    id SERIAL PRIMARY KEY,
    documento VARCHAR(20) NOT NULL,
    tipo_documento VARCHAR(10) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(documento, tipo_documento)
);

-- Tabla Deuda
CREATE TABLE deuda (
    id SERIAL PRIMARY KEY,
    contribuyente_id INTEGER NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id)
);

-- Tabla Pago
CREATE TABLE pago (
    id SERIAL PRIMARY KEY,
    contribuyente_id INTEGER NOT NULL,
    deuda_id INTEGER NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    medio_pago VARCHAR(50) NOT NULL,
    referencia VARCHAR(50) UNIQUE,
    estado VARCHAR(20) NOT NULL,
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id),
    FOREIGN KEY (deuda_id) REFERENCES deuda(id)
);

-- Tabla Clasificación
CREATE TABLE clasificacion (
    id SERIAL PRIMARY KEY,
    contribuyente_id INTEGER NOT NULL,
    nivel_probabilidad VARCHAR(20) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    fecha_clasificacion TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL,
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id)
);

-- Tabla Estrategia_Cobro
CREATE TABLE estrategia_cobro (
    id SERIAL PRIMARY KEY,
    clasificacion_id INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clasificacion_id) REFERENCES clasificacion(id)
);

-- Tabla Accion_Cobro
CREATE TABLE accion_cobro (
    id SERIAL PRIMARY KEY,
    estrategia_id INTEGER NOT NULL,
    tipo_accion VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    orden INTEGER NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (estrategia_id) REFERENCES estrategia_cobro(id)
);

-- Tabla Notificación
CREATE TABLE notificacion (
    id SERIAL PRIMARY KEY,
    accion_cobro_id INTEGER NOT NULL,
    contribuyente_id INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    contenido VARCHAR(1000) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_envio TIMESTAMP NOT NULL,
    fecha_lectura TIMESTAMP,
    FOREIGN KEY (accion_cobro_id) REFERENCES accion_cobro(id),
    FOREIGN KEY (contribuyente_id) REFERENCES contribuyente(id)
);

-- Crear índices
CREATE INDEX idx_contribuyente_documento ON contribuyente(documento, tipo_documento);
CREATE INDEX idx_deuda_contribuyente ON deuda(contribuyente_id, fecha_vencimiento);
CREATE INDEX idx_pago_contribuyente ON pago(contribuyente_id, fecha_pago);
CREATE INDEX idx_clasificacion_contribuyente ON clasificacion(contribuyente_id, fecha_clasificacion);
CREATE INDEX idx_notificacion_contribuyente ON notificacion(contribuyente_id, fecha_envio); 