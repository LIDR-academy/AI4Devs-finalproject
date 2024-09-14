-- Tabla Portfolios
CREATE TABLE Portfolios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    divisa_principal VARCHAR(10) NOT NULL,
    fecha_creacion DATE NOT NULL,
    valor_actual DECIMAL(18, 2) NOT NULL
);

-- Tabla Activos
CREATE TABLE Activos (
    id SERIAL PRIMARY KEY,
    portfolio_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    ticker VARCHAR(50),
    divisa VARCHAR(10),
    tipo_cambio_divisa_compra DECIMAL(18, 6),
    fecha_compra DATE,
    numero_titulos INT,
    precio_medio_unitario DECIMAL(18, 6),
    coste_comisiones DECIMAL(18, 2),
    precio_total_coste DECIMAL(18, 2),
    precio_actual DECIMAL(18, 2),
    ultima_valorizacion DECIMAL(18, 2),
    fecha_actualizacion DATE,
    tasa_interes_nominal DECIMAL(5, 2),
    plazo_inversion INT,
    precio_unitario_venta DECIMAL(18, 6),
    tipo_cambio_divisa_venta DECIMAL(18, 6),
    FOREIGN KEY (portfolio_id) REFERENCES Portfolios(id)
);

-- Tabla ValorizacionesDiarias
CREATE TABLE ValorizacionesDiarias (
    id SERIAL PRIMARY KEY,
    portfolio_id INT NOT NULL,
    fecha DATE NOT NULL,
    valor DECIMAL(18, 2) NOT NULL,
    FOREIGN KEY (portfolio_id) REFERENCES Portfolios(id)
);

-- Tabla PreciosActivos
CREATE TABLE PreciosActivos (
    id SERIAL PRIMARY KEY,
    activo_id INT NOT NULL,
    fecha DATE NOT NULL,
    precio_cierre DECIMAL(18, 6) NOT NULL,
    precio_apertura DECIMAL(18, 6),
    precio_maximo DECIMAL(18, 6),
    precio_minimo DECIMAL(18, 6),
    volumen INT,
    FOREIGN KEY (activo_id) REFERENCES Activos(id)
);