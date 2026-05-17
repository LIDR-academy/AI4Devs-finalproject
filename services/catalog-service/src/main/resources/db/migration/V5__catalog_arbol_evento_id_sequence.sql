-- Identificador único de mensaje Kafka (ARBOL_CREADO); sin tabla EVENTO_CATALOGO en catálogo.
CREATE SEQUENCE IF NOT EXISTS catalog.seq_arbol_evento_id
    INCREMENT BY 1
    MINVALUE 1
    NO MAXVALUE
    START WITH 1
    CACHE 1;
