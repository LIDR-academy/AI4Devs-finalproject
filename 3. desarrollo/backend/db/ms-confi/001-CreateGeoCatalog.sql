-- ============================================================================
-- Script de creación del Catálogo Geográfico (Provincias, Cantones, Parroquias)
-- MS-CONFI - Módulo Geo
-- ============================================================================
-- Versión: 1.0.0
-- Fecha: 2025-01
-- ============================================================================

-- Habilitar extensión UUID si no existe (para futuras referencias)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensión pg_trgm para búsqueda de texto (si está disponible)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 1. TABLA rrfprovi (Provincia)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rrfprovi (
    provi_cod_provi SERIAL PRIMARY KEY,
    provi_cod_prov CHAR(2) NOT NULL UNIQUE,
    provi_nom_provi VARCHAR(100) NOT NULL,
    provi_flg_acti BOOLEAN NOT NULL DEFAULT true,
    provi_fec_creac TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provi_fec_modif TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provi_fec_elimi TIMESTAMPTZ NULL
);

-- Índices para rrfprovi
CREATE INDEX IF NOT EXISTS idx_provi_cod_prov ON rrfprovi(provi_cod_prov);
CREATE INDEX IF NOT EXISTS idx_provi_flg_acti ON rrfprovi(provi_flg_acti) WHERE provi_fec_elimi IS NULL;
CREATE INDEX IF NOT EXISTS idx_provi_nom_provi ON rrfprovi(provi_nom_provi);

-- Comentarios para rrfprovi
COMMENT ON TABLE rrfprovi IS 'Catálogo de provincias del Ecuador (SEPS Tabla 05)';
COMMENT ON COLUMN rrfprovi.provi_cod_provi IS 'ID único de la provincia (auto-incrementado)';
COMMENT ON COLUMN rrfprovi.provi_cod_prov IS 'Código SEPS/INEC de la provincia (2 caracteres, preserva ceros a la izquierda)';
COMMENT ON COLUMN rrfprovi.provi_nom_provi IS 'Nombre de la provincia';
COMMENT ON COLUMN rrfprovi.provi_flg_acti IS 'Flag que indica si la provincia está activa';
COMMENT ON COLUMN rrfprovi.provi_fec_creac IS 'Fecha de creación del registro';
COMMENT ON COLUMN rrfprovi.provi_fec_modif IS 'Fecha de última modificación';
COMMENT ON COLUMN rrfprovi.provi_fec_elimi IS 'Fecha de eliminación (soft delete)';

-- ============================================================================
-- 2. TABLA rrfcanto (Cantón)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rrfcanto (
    canto_cod_canto SERIAL PRIMARY KEY,
    provi_cod_provi INTEGER NOT NULL REFERENCES rrfprovi(provi_cod_provi) ON DELETE RESTRICT,
    canto_cod_cant CHAR(2) NOT NULL,
    canto_nom_canto VARCHAR(100) NOT NULL,
    canto_flg_acti BOOLEAN NOT NULL DEFAULT true,
    canto_fec_creac TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    canto_fec_modif TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    canto_fec_elimi TIMESTAMPTZ NULL,
    CONSTRAINT uk_canto_provi_cant UNIQUE (provi_cod_provi, canto_cod_cant)
);

-- Índices para rrfcanto
CREATE INDEX IF NOT EXISTS idx_canto_provi ON rrfcanto(provi_cod_provi);
CREATE INDEX IF NOT EXISTS idx_canto_nom ON rrfcanto(canto_nom_canto);
CREATE INDEX IF NOT EXISTS idx_canto_flg_acti ON rrfcanto(canto_flg_acti) WHERE canto_fec_elimi IS NULL;

-- Comentarios para rrfcanto
COMMENT ON TABLE rrfcanto IS 'Catálogo de cantones del Ecuador (SEPS Tabla 06)';
COMMENT ON COLUMN rrfcanto.canto_cod_canto IS 'ID único del cantón (auto-incrementado)';
COMMENT ON COLUMN rrfcanto.provi_cod_provi IS 'ID de la provincia a la que pertenece';
COMMENT ON COLUMN rrfcanto.canto_cod_cant IS 'Código SEPS del cantón (2 caracteres, preserva ceros a la izquierda)';
COMMENT ON COLUMN rrfcanto.canto_nom_canto IS 'Nombre del cantón';
COMMENT ON COLUMN rrfcanto.canto_flg_acti IS 'Flag que indica si el cantón está activo';
COMMENT ON COLUMN rrfcanto.canto_fec_creac IS 'Fecha de creación del registro';
COMMENT ON COLUMN rrfcanto.canto_fec_modif IS 'Fecha de última modificación';
COMMENT ON COLUMN rrfcanto.canto_fec_elimi IS 'Fecha de eliminación (soft delete)';

-- ============================================================================
-- 3. TABLA rrfparro (Parroquia)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rrfparro (
    parro_cod_parro SERIAL PRIMARY KEY,
    canto_cod_canto INTEGER NOT NULL REFERENCES rrfcanto(canto_cod_canto) ON DELETE RESTRICT,
    parro_cod_parr CHAR(2) NOT NULL,
    parro_nom_parro VARCHAR(120) NOT NULL,
    parro_tip_area CHAR(1) NULL CHECK (parro_tip_area IN ('R', 'U') OR parro_tip_area IS NULL),
    parro_flg_acti BOOLEAN NOT NULL DEFAULT true,
    parro_fec_creac TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    parro_fec_modif TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    parro_fec_elimi TIMESTAMPTZ NULL,
    CONSTRAINT uk_parro_canto_parr UNIQUE (canto_cod_canto, parro_cod_parr)
);

-- Índices para rrfparro
CREATE INDEX IF NOT EXISTS idx_parro_canto ON rrfparro(canto_cod_canto);
CREATE INDEX IF NOT EXISTS idx_parro_nom ON rrfparro(parro_nom_parro);
CREATE INDEX IF NOT EXISTS idx_parro_flg_acti ON rrfparro(parro_flg_acti) WHERE parro_fec_elimi IS NULL;

-- Índice para búsqueda de texto (usar pg_trgm si está disponible)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        CREATE INDEX IF NOT EXISTS idx_parro_nom_trgm ON rrfparro USING gin(parro_nom_parro gin_trgm_ops);
    ELSE
        CREATE INDEX IF NOT EXISTS idx_parro_nom_lower ON rrfparro(lower(parro_nom_parro));
    END IF;
END $$;

-- Comentarios para rrfparro
COMMENT ON TABLE rrfparro IS 'Catálogo de parroquias del Ecuador (SEPS Tabla 07)';
COMMENT ON COLUMN rrfparro.parro_cod_parro IS 'ID único de la parroquia (auto-incrementado)';
COMMENT ON COLUMN rrfparro.canto_cod_canto IS 'ID del cantón al que pertenece';
COMMENT ON COLUMN rrfparro.parro_cod_parr IS 'Código SEPS de la parroquia (2 caracteres, preserva ceros a la izquierda)';
COMMENT ON COLUMN rrfparro.parro_nom_parro IS 'Nombre de la parroquia';
COMMENT ON COLUMN rrfparro.parro_tip_area IS 'Tipo de área: R=Rural, U=Urbano';
COMMENT ON COLUMN rrfparro.parro_flg_acti IS 'Flag que indica si la parroquia está activa';
COMMENT ON COLUMN rrfparro.parro_fec_creac IS 'Fecha de creación del registro';
COMMENT ON COLUMN rrfparro.parro_fec_modif IS 'Fecha de última modificación';
COMMENT ON COLUMN rrfparro.parro_fec_elimi IS 'Fecha de eliminación (soft delete)';

-- ============================================================================
-- SCRIPT DE ROLLBACK
-- ============================================================================
-- Para revertir este script, ejecutar:
--
-- DROP INDEX IF EXISTS idx_parro_nom_trgm;
-- DROP INDEX IF EXISTS idx_parro_nom_lower;
-- DROP INDEX IF EXISTS idx_parro_flg_acti;
-- DROP INDEX IF EXISTS idx_parro_nom;
-- DROP INDEX IF EXISTS idx_parro_canto;
-- DROP TABLE IF EXISTS rrfparro;
--
-- DROP INDEX IF EXISTS idx_canto_flg_acti;
-- DROP INDEX IF EXISTS idx_canto_nom;
-- DROP INDEX IF EXISTS idx_canto_provi;
-- DROP TABLE IF EXISTS rrfcanto;
--
-- DROP INDEX IF EXISTS idx_provi_nom_provi;
-- DROP INDEX IF EXISTS idx_provi_flg_acti;
-- DROP INDEX IF EXISTS idx_provi_cod_prov;
-- DROP TABLE IF EXISTS rrfprovi;
-- ============================================================================
