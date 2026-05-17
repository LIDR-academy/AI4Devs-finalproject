-- Dependencia explícita del servicio para búsquedas insensibles a acentos en maestros.
-- Evita depender únicamente del init global de infraestructura.
CREATE EXTENSION IF NOT EXISTS unaccent;
