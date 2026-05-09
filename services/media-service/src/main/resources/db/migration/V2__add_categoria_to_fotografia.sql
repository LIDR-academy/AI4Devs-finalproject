SET search_path TO media;

ALTER TABLE fotografia
    ADD COLUMN categoria VARCHAR(16) NOT NULL DEFAULT 'PUBLIC';

ALTER TABLE fotografia
    ADD CONSTRAINT ck_fotografia_categoria
    CHECK (categoria IN ('PUBLIC', 'PRIVATE'));

CREATE INDEX idx_fotografia_arbol_categoria_orden
    ON fotografia (arbol_id, categoria, orden)
    WHERE eliminado_en IS NULL;
