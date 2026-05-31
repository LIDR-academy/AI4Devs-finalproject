SET search_path TO catalog;
-- Script de inserción de 500 especies arbóreas frecuentes en España y/o usadas como ornamentales urbanas en Madrid.
-- Generado con inserciones idempotentes mediante comprobación por nombre científico.
-- Asume tablas definidas en V1__baseline.sql (familia, genero, especie, provincia).
-- (Sin BEGIN/COMMIT explícitos: Flyway envuelve cada migración en una transacción en PostgreSQL.)

-- Familias
INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Fagaceae', 'Fagáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Fagaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Pinaceae', 'Pináceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Pinaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Cupressaceae', 'Cupresáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Cupressaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Taxaceae', 'Taxáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Taxaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Betulaceae', 'Betuláceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Betulaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Salicaceae', 'Salicáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Salicaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Ulmaceae', 'Ulmáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Ulmaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Cannabaceae', 'Cannabáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Cannabaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Moraceae', 'Moráceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Moraceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Rosaceae', 'Rosáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Rosaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Ericaceae', 'Ericáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Ericaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Fabaceae', 'Fabáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Fabaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Oleaceae', 'Oleáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Oleaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Sapindaceae', 'Sapindáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Sapindaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Malvaceae', 'Malváceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Malvaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Platanaceae', 'Platanáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Platanaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Juglandaceae', 'Juglandáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Juglandaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Myrtaceae', 'Mirtáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Myrtaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Rutaceae', 'Rutáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Rutaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Meliaceae', 'Meliáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Meliaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Simaroubaceae', 'Simarubáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Simaroubaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Bignoniaceae', 'Bignoniáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Bignoniaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Paulowniaceae', 'Paulowniáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Paulowniaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Anacardiaceae', 'Anacardiáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Anacardiaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Lauraceae', 'Lauráceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Lauraceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Aquifoliaceae', 'Aquifoliáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Aquifoliaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Adoxaceae', 'Adoxáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Adoxaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Cornaceae', 'Cornáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Cornaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Elaeagnaceae', 'Eleagnáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Elaeagnaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Rhamnaceae', 'Ramnáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Rhamnaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Tamaricaceae', 'Tamaricáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Tamaricaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Lythraceae', 'Litráceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Lythraceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Sapotaceae', 'Sapotáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Sapotaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Styracaceae', 'Estiracáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Styracaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Altingiaceae', 'Altingiáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Altingiaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Hamamelidaceae', 'Hamamelidáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Hamamelidaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Magnoliaceae', 'Magnoliáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Magnoliaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Proteaceae', 'Proteáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Proteaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Casuarinaceae', 'Casuarináceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Casuarinaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Nothofagaceae', 'Nothofagáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Nothofagaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Ebenaceae', 'Ebenáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Ebenaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Buxaceae', 'Buxáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Buxaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Celastraceae', 'Celastráceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Celastraceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Apocynaceae', 'Apocináceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Apocynaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Araliaceae', 'Araliáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Araliaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Phytolaccaceae', 'Fitolacáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Phytolaccaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Lardizabalaceae', 'Lardizabaláceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Lardizabalaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Solanaceae', 'Solanáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Solanaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Verbenaceae', 'Verbenáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Verbenaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Lamiaceae', 'Lamiáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Lamiaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Arecaceae', 'Arecáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Arecaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Asparagaceae', 'Asparagáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Asparagaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Araucariaceae', 'Araucariáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Araucariaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Podocarpaceae', 'Podocarpáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Podocarpaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Ginkgoaceae', 'Ginkgoáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Ginkgoaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Cycadaceae', 'Cicadáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Cycadaceae');

-- Géneros
INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Quercus', 'Robles'
FROM familia WHERE nombre_cientifico = 'Fagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Fagus', 'Hayas'
FROM familia WHERE nombre_cientifico = 'Fagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Fagus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Castanea', 'Castaños'
FROM familia WHERE nombre_cientifico = 'Fagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Castanea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pinus', 'Pinos'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Abies', 'Abetos'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Picea', 'Píceas'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Picea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cedrus', 'Cedros'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Cedrus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Larix', 'Alerces'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Larix'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pseudotsuga', 'Pseudotsugas'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pseudotsuga'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cupressus', 'Cupressus'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cupressus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Juniperus', 'Juniperus'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Chamaecyparis', 'Chamaecyparis'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Chamaecyparis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Calocedrus', 'Calocedrus'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Calocedrus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Platycladus', 'Platycladus'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Platycladus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Thuja', 'Thuja'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Thuja'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Tetraclinis', 'Tetraclinis'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Tetraclinis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cryptomeria', 'Cryptomeria'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cryptomeria'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sequoia', 'Sequoia'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Sequoia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sequoiadendron', 'Sequoiadendron'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Sequoiadendron'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Taxodium', 'Taxodium'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Taxodium'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Metasequoia', 'Metasequoia'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Metasequoia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Taxus', 'Tejos'
FROM familia WHERE nombre_cientifico = 'Taxaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Taxaceae' AND g.nombre_cientifico = 'Taxus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Betula', 'Abedules'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Alnus', 'Alisos'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Alnus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Corylus', 'Avellanos'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Corylus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Carpinus', 'Carpes'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Carpinus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ostrya', 'Carpes negros'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Ostrya'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Populus', 'Álamos y chopos'
FROM familia WHERE nombre_cientifico = 'Salicaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Salix', 'Sauces'
FROM familia WHERE nombre_cientifico = 'Salicaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ulmus', 'Olmos'
FROM familia WHERE nombre_cientifico = 'Ulmaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Celtis', 'Almeces'
FROM familia WHERE nombre_cientifico = 'Cannabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Morus', 'Moreras'
FROM familia WHERE nombre_cientifico = 'Moraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Morus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ficus', 'Ficus'
FROM familia WHERE nombre_cientifico = 'Moraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Broussonetia', 'Moreras de papel'
FROM familia WHERE nombre_cientifico = 'Moraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Broussonetia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Prunus', 'Prunos'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Malus', 'Manzanos'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pyrus', 'Perales'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Pyrus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sorbus', 'Serbales'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Crataegus', 'Espinos'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Crataegus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Mespilus', 'Nísperos europeos'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Mespilus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Eriobotrya', 'Nísperos japoneses'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Eriobotrya'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Amelanchier', 'Guillomos'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Amelanchier'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Arbutus', 'Madroños'
FROM familia WHERE nombre_cientifico = 'Ericaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Ericaceae' AND g.nombre_cientifico = 'Arbutus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Robinia', 'Robinias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Robinia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Gleditsia', 'Gleditsias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Gleditsia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Styphnolobium', 'Sóforas'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Styphnolobium'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ceratonia', 'Algarrobos'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Ceratonia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cercis', 'Árboles del amor'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Cercis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Albizia', 'Albizias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Albizia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Acacia', 'Acacias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Tipuana', 'Tipuanas'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Tipuana'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Parkinsonia', 'Parkinsonias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Parkinsonia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Prosopis', 'Mezquites'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Prosopis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Laburnum', 'Laburnos'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Laburnum'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Olea', 'Olivos'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Olea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Fraxinus', 'Fresnos'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ligustrum', 'Aligustres'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Ligustrum'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Syringa', 'Lilos'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Syringa'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Phillyrea', 'Labiérnagos'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Phillyrea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Chionanthus', 'Chionanthus'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Chionanthus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Acer', 'Arces'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Aesculus', 'Castaños de Indias'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Koelreuteria', 'Jaboneros de China'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Koelreuteria'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sapindus', 'Jaboneros'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Sapindus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Dodonaea', 'Dodoneas'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Dodonaea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Tilia', 'Tilos'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Brachychiton', 'Brachichitos'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Brachychiton'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ceiba', 'Ceibas'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Ceiba'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Firmiana', 'Firmianas'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Firmiana'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Lagunaria', 'Lagunarias'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Lagunaria'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Platanus', 'Plátanos'
FROM familia WHERE nombre_cientifico = 'Platanaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Platanaceae' AND g.nombre_cientifico = 'Platanus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Juglans', 'Nogales'
FROM familia WHERE nombre_cientifico = 'Juglandaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Juglandaceae' AND g.nombre_cientifico = 'Juglans'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Carya', 'Pacanos'
FROM familia WHERE nombre_cientifico = 'Juglandaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Juglandaceae' AND g.nombre_cientifico = 'Carya'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pterocarya', 'Nogales alados'
FROM familia WHERE nombre_cientifico = 'Juglandaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Juglandaceae' AND g.nombre_cientifico = 'Pterocarya'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Eucalyptus', 'Eucaliptos'
FROM familia WHERE nombre_cientifico = 'Myrtaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Eucalyptus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Metrosideros', 'Metrosideros'
FROM familia WHERE nombre_cientifico = 'Myrtaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Metrosideros'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Callistemon', 'Limpiatubos'
FROM familia WHERE nombre_cientifico = 'Myrtaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Callistemon'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Melaleuca', 'Melaleucas'
FROM familia WHERE nombre_cientifico = 'Myrtaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Melaleuca'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Citrus', 'Cítricos'
FROM familia WHERE nombre_cientifico = 'Rutaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Poncirus', 'Poncirus'
FROM familia WHERE nombre_cientifico = 'Rutaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Poncirus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Melia', 'Melias'
FROM familia WHERE nombre_cientifico = 'Meliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Melia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ailanthus', 'Ailantos'
FROM familia WHERE nombre_cientifico = 'Simaroubaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Simaroubaceae' AND g.nombre_cientifico = 'Ailanthus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Catalpa', 'Catalpas'
FROM familia WHERE nombre_cientifico = 'Bignoniaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Catalpa'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Jacaranda', 'Jacarandas'
FROM familia WHERE nombre_cientifico = 'Bignoniaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Jacaranda'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Handroanthus', 'Lapachos'
FROM familia WHERE nombre_cientifico = 'Bignoniaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Handroanthus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Tecoma', 'Tecomas'
FROM familia WHERE nombre_cientifico = 'Bignoniaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Tecoma'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Paulownia', 'Paulonias'
FROM familia WHERE nombre_cientifico = 'Paulowniaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Paulowniaceae' AND g.nombre_cientifico = 'Paulownia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pistacia', 'Pistachos'
FROM familia WHERE nombre_cientifico = 'Anacardiaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Pistacia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Schinus', 'Falsos pimenteros'
FROM familia WHERE nombre_cientifico = 'Anacardiaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Schinus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Rhus', 'Zumaques'
FROM familia WHERE nombre_cientifico = 'Anacardiaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Rhus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Laurus', 'Laureles'
FROM familia WHERE nombre_cientifico = 'Lauraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lauraceae' AND g.nombre_cientifico = 'Laurus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Persea', 'Aguacates'
FROM familia WHERE nombre_cientifico = 'Lauraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lauraceae' AND g.nombre_cientifico = 'Persea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cinnamomum', 'Canelos'
FROM familia WHERE nombre_cientifico = 'Lauraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lauraceae' AND g.nombre_cientifico = 'Cinnamomum'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Umbellularia', 'Laureles de California'
FROM familia WHERE nombre_cientifico = 'Lauraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lauraceae' AND g.nombre_cientifico = 'Umbellularia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ilex', 'Acebos'
FROM familia WHERE nombre_cientifico = 'Aquifoliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Aquifoliaceae' AND g.nombre_cientifico = 'Ilex'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sambucus', 'Saúcos'
FROM familia WHERE nombre_cientifico = 'Adoxaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Adoxaceae' AND g.nombre_cientifico = 'Sambucus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cornus', 'Cornus'
FROM familia WHERE nombre_cientifico = 'Cornaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cornaceae' AND g.nombre_cientifico = 'Cornus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Elaeagnus', 'Eleagnos'
FROM familia WHERE nombre_cientifico = 'Elaeagnaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Elaeagnaceae' AND g.nombre_cientifico = 'Elaeagnus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Hippophae', 'Espinos amarillos'
FROM familia WHERE nombre_cientifico = 'Elaeagnaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Elaeagnaceae' AND g.nombre_cientifico = 'Hippophae'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Rhamnus', 'Espinos negros'
FROM familia WHERE nombre_cientifico = 'Rhamnaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rhamnaceae' AND g.nombre_cientifico = 'Rhamnus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Frangula', 'Arraclanes'
FROM familia WHERE nombre_cientifico = 'Rhamnaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rhamnaceae' AND g.nombre_cientifico = 'Frangula'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ziziphus', 'Azufaifos'
FROM familia WHERE nombre_cientifico = 'Rhamnaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rhamnaceae' AND g.nombre_cientifico = 'Ziziphus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Paliurus', 'Espinas de Cristo'
FROM familia WHERE nombre_cientifico = 'Rhamnaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rhamnaceae' AND g.nombre_cientifico = 'Paliurus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Tamarix', 'Tarajes'
FROM familia WHERE nombre_cientifico = 'Tamaricaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Tamaricaceae' AND g.nombre_cientifico = 'Tamarix'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Punica', 'Granados'
FROM familia WHERE nombre_cientifico = 'Lythraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lythraceae' AND g.nombre_cientifico = 'Punica'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Lagerstroemia', 'Árboles de Júpiter'
FROM familia WHERE nombre_cientifico = 'Lythraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lythraceae' AND g.nombre_cientifico = 'Lagerstroemia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sideroxylon', 'Marmulanes'
FROM familia WHERE nombre_cientifico = 'Sapotaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapotaceae' AND g.nombre_cientifico = 'Sideroxylon'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Argania', 'Arganes'
FROM familia WHERE nombre_cientifico = 'Sapotaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapotaceae' AND g.nombre_cientifico = 'Argania'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Styrax', 'Estoraques'
FROM familia WHERE nombre_cientifico = 'Styracaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Styracaceae' AND g.nombre_cientifico = 'Styrax'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Halesia', 'Árboles campana'
FROM familia WHERE nombre_cientifico = 'Styracaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Styracaceae' AND g.nombre_cientifico = 'Halesia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Liquidambar', 'Liquidámbares'
FROM familia WHERE nombre_cientifico = 'Altingiaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Altingiaceae' AND g.nombre_cientifico = 'Liquidambar'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Parrotia', 'Parrotias'
FROM familia WHERE nombre_cientifico = 'Hamamelidaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Hamamelidaceae' AND g.nombre_cientifico = 'Parrotia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Hamamelis', 'Hamamelis'
FROM familia WHERE nombre_cientifico = 'Hamamelidaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Hamamelidaceae' AND g.nombre_cientifico = 'Hamamelis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Magnolia', 'Magnolios'
FROM familia WHERE nombre_cientifico = 'Magnoliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Magnoliaceae' AND g.nombre_cientifico = 'Magnolia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Liriodendron', 'Tuliperos'
FROM familia WHERE nombre_cientifico = 'Magnoliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Magnoliaceae' AND g.nombre_cientifico = 'Liriodendron'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Grevillea', 'Grevilleas'
FROM familia WHERE nombre_cientifico = 'Proteaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Proteaceae' AND g.nombre_cientifico = 'Grevillea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Casuarina', 'Casuarinas'
FROM familia WHERE nombre_cientifico = 'Casuarinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Casuarinaceae' AND g.nombre_cientifico = 'Casuarina'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Nothofagus', 'Falsas hayas'
FROM familia WHERE nombre_cientifico = 'Nothofagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Nothofagaceae' AND g.nombre_cientifico = 'Nothofagus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Diospyros', 'Caquis'
FROM familia WHERE nombre_cientifico = 'Ebenaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Ebenaceae' AND g.nombre_cientifico = 'Diospyros'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Buxus', 'Bojes'
FROM familia WHERE nombre_cientifico = 'Buxaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Buxaceae' AND g.nombre_cientifico = 'Buxus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Euonymus', 'Boneteros'
FROM familia WHERE nombre_cientifico = 'Celastraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Celastraceae' AND g.nombre_cientifico = 'Euonymus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Nerium', 'Adelfas'
FROM familia WHERE nombre_cientifico = 'Apocynaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Apocynaceae' AND g.nombre_cientifico = 'Nerium'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Thevetia', 'Thevetias'
FROM familia WHERE nombre_cientifico = 'Apocynaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Apocynaceae' AND g.nombre_cientifico = 'Thevetia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Plumeria', 'Frangipanis'
FROM familia WHERE nombre_cientifico = 'Apocynaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Apocynaceae' AND g.nombre_cientifico = 'Plumeria'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Tetrapanax', 'Tetrapanax'
FROM familia WHERE nombre_cientifico = 'Araliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Araliaceae' AND g.nombre_cientifico = 'Tetrapanax'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Schefflera', 'Chefleras'
FROM familia WHERE nombre_cientifico = 'Araliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Araliaceae' AND g.nombre_cientifico = 'Schefflera'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Phytolacca', 'Ombúes'
FROM familia WHERE nombre_cientifico = 'Phytolaccaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Phytolaccaceae' AND g.nombre_cientifico = 'Phytolacca'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Decaisnea', 'Decaisneas'
FROM familia WHERE nombre_cientifico = 'Lardizabalaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lardizabalaceae' AND g.nombre_cientifico = 'Decaisnea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Solanum', 'Solanos'
FROM familia WHERE nombre_cientifico = 'Solanaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Solanaceae' AND g.nombre_cientifico = 'Solanum'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Brugmansia', 'Trompeteros'
FROM familia WHERE nombre_cientifico = 'Solanaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Solanaceae' AND g.nombre_cientifico = 'Brugmansia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Vitex', 'Sauzgatillos'
FROM familia WHERE nombre_cientifico = 'Verbenaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Verbenaceae' AND g.nombre_cientifico = 'Vitex'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Phlomis', 'Flomis'
FROM familia WHERE nombre_cientifico = 'Lamiaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lamiaceae' AND g.nombre_cientifico = 'Phlomis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Clerodendrum', 'Clerodendros'
FROM familia WHERE nombre_cientifico = 'Lamiaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Lamiaceae' AND g.nombre_cientifico = 'Clerodendrum'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Phoenix', 'Palmeras datileras'
FROM familia WHERE nombre_cientifico = 'Arecaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Phoenix'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Washingtonia', 'Washingtonias'
FROM familia WHERE nombre_cientifico = 'Arecaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Washingtonia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Trachycarpus', 'Palmitos elevados'
FROM familia WHERE nombre_cientifico = 'Arecaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Trachycarpus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Chamaerops', 'Palmitos'
FROM familia WHERE nombre_cientifico = 'Arecaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Chamaerops'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Butia', 'Butias'
FROM familia WHERE nombre_cientifico = 'Arecaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Butia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Syagrus', 'Syagrus'
FROM familia WHERE nombre_cientifico = 'Arecaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Syagrus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Jubaea', 'Jubeas'
FROM familia WHERE nombre_cientifico = 'Arecaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Jubaea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sabal', 'Sabales'
FROM familia WHERE nombre_cientifico = 'Arecaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Sabal'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Dracaena', 'Dragos'
FROM familia WHERE nombre_cientifico = 'Asparagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Dracaena'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Yucca', 'Yucas'
FROM familia WHERE nombre_cientifico = 'Asparagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Yucca'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cordyline', 'Cordilines'
FROM familia WHERE nombre_cientifico = 'Asparagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Cordyline'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Agave', 'Agaves'
FROM familia WHERE nombre_cientifico = 'Asparagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Agave'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Araucaria', 'Araucarias'
FROM familia WHERE nombre_cientifico = 'Araucariaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Araucariaceae' AND g.nombre_cientifico = 'Araucaria'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Podocarpus', 'Podocarpos'
FROM familia WHERE nombre_cientifico = 'Podocarpaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Podocarpaceae' AND g.nombre_cientifico = 'Podocarpus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ginkgo', 'Ginkgos'
FROM familia WHERE nombre_cientifico = 'Ginkgoaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Ginkgoaceae' AND g.nombre_cientifico = 'Ginkgo'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cycas', 'Cicas'
FROM familia WHERE nombre_cientifico = 'Cycadaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cycadaceae' AND g.nombre_cientifico = 'Cycas'
);

-- Especies
INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus ilex', 'Encina'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus ilex'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus suber', 'Alcornoque'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus suber'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus faginea', 'Quejigo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus faginea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus pyrenaica', 'Melojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus pyrenaica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus robur', 'Roble común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus robur'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus petraea', 'Roble albar'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus petraea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus pubescens', 'Roble pubescente'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus pubescens'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus canariensis', 'Quejigo andaluz'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus canariensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus coccifera', 'Coscoja'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus coccifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus cerris', 'Roble turco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus cerris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus rubra', 'Roble americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus rubra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus palustris', 'Roble de los pantanos'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus palustris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus acutissima', 'Roble de sierra'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus acutissima'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fagus sylvatica', 'Haya'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Fagus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Fagus' AND e.nombre_cientifico = 'Fagus sylvatica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Castanea sativa', 'Castaño'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Castanea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Castanea' AND e.nombre_cientifico = 'Castanea sativa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Castanea crenata', 'Castaño japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Castanea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Castanea' AND e.nombre_cientifico = 'Castanea crenata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus pinea', 'Pino piñonero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus pinea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus pinaster', 'Pino resinero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus pinaster'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus halepensis', 'Pino carrasco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus halepensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus sylvestris', 'Pino silvestre'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus sylvestris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus nigra', 'Pino salgareño'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus nigra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus uncinata', 'Pino negro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus uncinata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus canariensis', 'Pino canario'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus canariensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus radiata', 'Pino de Monterrey'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus radiata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus strobus', 'Pino blanco americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus strobus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus wallichiana', 'Pino del Himalaya'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus wallichiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies alba', 'Abeto blanco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies alba'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies pinsapo', 'Pinsapo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies pinsapo'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies nordmanniana', 'Abeto del Cáucaso'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies nordmanniana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies cephalonica', 'Abeto griego'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies cephalonica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Picea abies', 'Pícea común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Picea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Picea' AND e.nombre_cientifico = 'Picea abies'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Picea pungens', 'Pícea azul'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Picea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Picea' AND e.nombre_cientifico = 'Picea pungens'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cedrus atlantica', 'Cedro del Atlas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Cedrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Cedrus' AND e.nombre_cientifico = 'Cedrus atlantica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cedrus deodara', 'Cedro del Himalaya'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Cedrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Cedrus' AND e.nombre_cientifico = 'Cedrus deodara'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cedrus libani', 'Cedro del Líbano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Cedrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Cedrus' AND e.nombre_cientifico = 'Cedrus libani'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Larix decidua', 'Alerce europeo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Larix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Larix' AND e.nombre_cientifico = 'Larix decidua'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pseudotsuga menziesii', 'Abeto de Douglas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pseudotsuga'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pseudotsuga' AND e.nombre_cientifico = 'Pseudotsuga menziesii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cupressus sempervirens', 'Ciprés común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cupressus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Cupressus' AND e.nombre_cientifico = 'Cupressus sempervirens'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cupressus arizonica', 'Ciprés de Arizona'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cupressus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Cupressus' AND e.nombre_cientifico = 'Cupressus arizonica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cupressus macrocarpa', 'Ciprés de Monterrey'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cupressus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Cupressus' AND e.nombre_cientifico = 'Cupressus macrocarpa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cupressus lusitanica', 'Ciprés de Portugal'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cupressus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Cupressus' AND e.nombre_cientifico = 'Cupressus lusitanica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus thurifera', 'Sabina albar'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus thurifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus phoenicea', 'Sabina negral'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus phoenicea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus oxycedrus', 'Enebro de la miera'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus oxycedrus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus communis', 'Enebro común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus communis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus cedrus', 'Cedro canario'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus cedrus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus sabina', 'Sabina rastrera'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus sabina'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Chamaecyparis lawsoniana', 'Ciprés de Lawson'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Chamaecyparis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Chamaecyparis' AND e.nombre_cientifico = 'Chamaecyparis lawsoniana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Calocedrus decurrens', 'Libocedro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Calocedrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Calocedrus' AND e.nombre_cientifico = 'Calocedrus decurrens'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Platycladus orientalis', 'Tuya oriental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Platycladus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Platycladus' AND e.nombre_cientifico = 'Platycladus orientalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Thuja occidentalis', 'Tuya occidental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Thuja'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Thuja' AND e.nombre_cientifico = 'Thuja occidentalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Thuja plicata', 'Tuya gigante'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Thuja'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Thuja' AND e.nombre_cientifico = 'Thuja plicata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tetraclinis articulata', 'Araar'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Tetraclinis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Tetraclinis' AND e.nombre_cientifico = 'Tetraclinis articulata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cryptomeria japonica', 'Criptomeria japonesa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cryptomeria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Cryptomeria' AND e.nombre_cientifico = 'Cryptomeria japonica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sequoia sempervirens', 'Secuoya roja'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Sequoia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Sequoia' AND e.nombre_cientifico = 'Sequoia sempervirens'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sequoiadendron giganteum', 'Secuoya gigante'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Sequoiadendron'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Sequoiadendron' AND e.nombre_cientifico = 'Sequoiadendron giganteum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Taxodium distichum', 'Ciprés de los pantanos'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Taxodium'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Taxodium' AND e.nombre_cientifico = 'Taxodium distichum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Metasequoia glyptostroboides', 'Metasecuoya'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Metasequoia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Metasequoia' AND e.nombre_cientifico = 'Metasequoia glyptostroboides'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Taxus baccata', 'Tejo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Taxaceae' AND g.nombre_cientifico = 'Taxus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Taxaceae' AND g2.nombre_cientifico = 'Taxus' AND e.nombre_cientifico = 'Taxus baccata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Taxus cuspidata', 'Tejo japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Taxaceae' AND g.nombre_cientifico = 'Taxus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Taxaceae' AND g2.nombre_cientifico = 'Taxus' AND e.nombre_cientifico = 'Taxus cuspidata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula pendula', 'Abedul común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula pendula'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula pubescens', 'Abedul pubescente'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula pubescens'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Alnus glutinosa', 'Aliso común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Alnus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Alnus' AND e.nombre_cientifico = 'Alnus glutinosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Alnus cordata', 'Aliso italiano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Alnus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Alnus' AND e.nombre_cientifico = 'Alnus cordata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Alnus incana', 'Aliso gris'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Alnus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Alnus' AND e.nombre_cientifico = 'Alnus incana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Corylus avellana', 'Avellano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Corylus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Corylus' AND e.nombre_cientifico = 'Corylus avellana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Carpinus betulus', 'Carpe europeo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Carpinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Carpinus' AND e.nombre_cientifico = 'Carpinus betulus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ostrya carpinifolia', 'Carpe negro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Ostrya'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Ostrya' AND e.nombre_cientifico = 'Ostrya carpinifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Corylus colurna', 'Avellano turco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Corylus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Corylus' AND e.nombre_cientifico = 'Corylus colurna'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus alba', 'Álamo blanco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus alba'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus nigra', 'Chopo negro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus nigra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus tremula', 'Álamo temblón'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus tremula'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus x canadensis', 'Chopo canadiense'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus x canadensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus simonii', 'Chopo de Simón'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus simonii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus trichocarpa', 'Chopo balsámico'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus trichocarpa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix alba', 'Sauce blanco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix alba'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix atrocinerea', 'Sauce cenizo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix atrocinerea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix fragilis', 'Sauce frágil'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix fragilis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix babylonica', 'Sauce llorón'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix babylonica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix caprea', 'Sauce cabruno'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix caprea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix purpurea', 'Sauce rojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix purpurea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix eleagnos', 'Sarga'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix eleagnos'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix viminalis', 'Mimbrera'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix viminalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus minor', 'Olmo común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus minor'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus glabra', 'Olmo de montaña'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus glabra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus laevis', 'Olmo blanco europeo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus laevis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus pumila', 'Olmo siberiano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus pumila'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus parvifolia', 'Olmo chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus parvifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Celtis australis', 'Almez'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cannabaceae' AND g2.nombre_cientifico = 'Celtis' AND e.nombre_cientifico = 'Celtis australis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Celtis occidentalis', 'Almez occidental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cannabaceae' AND g2.nombre_cientifico = 'Celtis' AND e.nombre_cientifico = 'Celtis occidentalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Celtis sinensis', 'Almez chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cannabaceae' AND g2.nombre_cientifico = 'Celtis' AND e.nombre_cientifico = 'Celtis sinensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Morus alba', 'Morera blanca'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Morus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Morus' AND e.nombre_cientifico = 'Morus alba'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Morus nigra', 'Morera negra'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Morus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Morus' AND e.nombre_cientifico = 'Morus nigra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Morus rubra', 'Morera roja'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Morus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Morus' AND e.nombre_cientifico = 'Morus rubra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus carica', 'Higuera'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus carica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus macrophylla', 'Ficus de hoja grande'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus macrophylla'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus microcarpa', 'Laurel de Indias'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus microcarpa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus elastica', 'Árbol del caucho'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus elastica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Broussonetia papyrifera', 'Morera de papel'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Broussonetia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Broussonetia' AND e.nombre_cientifico = 'Broussonetia papyrifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus avium', 'Cerezo silvestre'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus avium'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus cerasifera', 'Ciruelo rojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus cerasifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus domestica', 'Ciruelo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus domestica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus dulcis', 'Almendro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus dulcis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus persica', 'Melocotonero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus persica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus armeniaca', 'Albaricoquero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus armeniaca'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus serrulata', 'Cerezo japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus serrulata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus padus', 'Cerezo aliso'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus padus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus mahaleb', 'Cerezo de Santa Lucía'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus mahaleb'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus laurocerasus', 'Laurel cerezo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus laurocerasus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Malus domestica', 'Manzano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Malus' AND e.nombre_cientifico = 'Malus domestica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Malus sylvestris', 'Manzano silvestre'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Malus' AND e.nombre_cientifico = 'Malus sylvestris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Malus floribunda', 'Manzano de flor'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Malus' AND e.nombre_cientifico = 'Malus floribunda'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pyrus communis', 'Peral'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Pyrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Pyrus' AND e.nombre_cientifico = 'Pyrus communis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pyrus bourgaeana', 'Pirúetano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Pyrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Pyrus' AND e.nombre_cientifico = 'Pyrus bourgaeana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pyrus calleryana', 'Peral de Callery'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Pyrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Pyrus' AND e.nombre_cientifico = 'Pyrus calleryana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus aria', 'Mostajo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus aria'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus aucuparia', 'Serbal de cazadores'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus aucuparia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus domestica', 'Serbal común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus domestica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus torminalis', 'Mostajo de perucos'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus torminalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus latifolia', 'Mostajo híbrido'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus latifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Crataegus monogyna', 'Espino albar'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Crataegus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Crataegus' AND e.nombre_cientifico = 'Crataegus monogyna'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Crataegus laevigata', 'Espino navarro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Crataegus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Crataegus' AND e.nombre_cientifico = 'Crataegus laevigata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Mespilus germanica', 'Níspero europeo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Mespilus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Mespilus' AND e.nombre_cientifico = 'Mespilus germanica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Eriobotrya japonica', 'Níspero japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Eriobotrya'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Eriobotrya' AND e.nombre_cientifico = 'Eriobotrya japonica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Amelanchier ovalis', 'Guillomo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Amelanchier'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Amelanchier' AND e.nombre_cientifico = 'Amelanchier ovalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Amelanchier arborea', 'Guillomo arbóreo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Amelanchier'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Amelanchier' AND e.nombre_cientifico = 'Amelanchier arborea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Arbutus unedo', 'Madroño'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ericaceae' AND g.nombre_cientifico = 'Arbutus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ericaceae' AND g2.nombre_cientifico = 'Arbutus' AND e.nombre_cientifico = 'Arbutus unedo'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Robinia pseudoacacia', 'Falsa acacia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Robinia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Robinia' AND e.nombre_cientifico = 'Robinia pseudoacacia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Robinia hispida', 'Robinia rosa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Robinia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Robinia' AND e.nombre_cientifico = 'Robinia hispida'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Gleditsia triacanthos', 'Acacia de tres espinas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Gleditsia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Gleditsia' AND e.nombre_cientifico = 'Gleditsia triacanthos'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Styphnolobium japonicum', 'Sófora'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Styphnolobium'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Styphnolobium' AND e.nombre_cientifico = 'Styphnolobium japonicum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ceratonia siliqua', 'Algarrobo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Ceratonia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Ceratonia' AND e.nombre_cientifico = 'Ceratonia siliqua'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cercis siliquastrum', 'Árbol del amor'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Cercis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Cercis' AND e.nombre_cientifico = 'Cercis siliquastrum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Albizia julibrissin', 'Árbol de la seda'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Albizia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Albizia' AND e.nombre_cientifico = 'Albizia julibrissin'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia dealbata', 'Mimosa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia dealbata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia melanoxylon', 'Acacia negra'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia melanoxylon'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia retinodes', 'Acacia de cuatro estaciones'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia retinodes'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia saligna', 'Acacia azul'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia saligna'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia baileyana', 'Mimosa de Bailey'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia baileyana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tipuana tipu', 'Tipuana'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Tipuana'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Tipuana' AND e.nombre_cientifico = 'Tipuana tipu'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Parkinsonia aculeata', 'Espino de Jerusalén'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Parkinsonia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Parkinsonia' AND e.nombre_cientifico = 'Parkinsonia aculeata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prosopis juliflora', 'Mezquite'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Prosopis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Prosopis' AND e.nombre_cientifico = 'Prosopis juliflora'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prosopis alba', 'Algarrobo blanco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Prosopis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Prosopis' AND e.nombre_cientifico = 'Prosopis alba'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Laburnum anagyroides', 'Lluvia de oro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Laburnum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Laburnum' AND e.nombre_cientifico = 'Laburnum anagyroides'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Olea europaea', 'Olivo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Olea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Olea' AND e.nombre_cientifico = 'Olea europaea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus angustifolia', 'Fresno de hoja estrecha'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus angustifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus excelsior', 'Fresno común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus excelsior'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus ornus', 'Fresno de flor'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus ornus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus pennsylvanica', 'Fresno americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus pennsylvanica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus velutina', 'Fresno de Arizona'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus velutina'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ligustrum lucidum', 'Aligustre arbóreo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Ligustrum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Ligustrum' AND e.nombre_cientifico = 'Ligustrum lucidum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ligustrum japonicum', 'Aligustre japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Ligustrum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Ligustrum' AND e.nombre_cientifico = 'Ligustrum japonicum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Syringa vulgaris', 'Lilo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Syringa'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Syringa' AND e.nombre_cientifico = 'Syringa vulgaris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Phillyrea angustifolia', 'Labiérnago'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Phillyrea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Phillyrea' AND e.nombre_cientifico = 'Phillyrea angustifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Phillyrea latifolia', 'Labiérnago negro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Phillyrea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Phillyrea' AND e.nombre_cientifico = 'Phillyrea latifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Chionanthus virginicus', 'Árbol de nieve'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Chionanthus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Chionanthus' AND e.nombre_cientifico = 'Chionanthus virginicus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer campestre', 'Arce menor'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer campestre'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer monspessulanum', 'Arce de Montpellier'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer monspessulanum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer opalus', 'Arce opalo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer opalus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer pseudoplatanus', 'Arce sicómoro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer pseudoplatanus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer platanoides', 'Arce real'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer platanoides'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer negundo', 'Arce negundo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer negundo'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer saccharinum', 'Arce plateado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer saccharinum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer rubrum', 'Arce rojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer rubrum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer saccharum', 'Arce azucarero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer saccharum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer buergerianum', 'Arce tridente'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer buergerianum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer palmatum', 'Arce japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer palmatum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer x freemanii', 'Arce de Freeman'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer x freemanii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Aesculus hippocastanum', 'Castaño de Indias'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Aesculus' AND e.nombre_cientifico = 'Aesculus hippocastanum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Aesculus x carnea', 'Castaño de Indias rojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Aesculus' AND e.nombre_cientifico = 'Aesculus x carnea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Aesculus glabra', 'Castaño de Ohio'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Aesculus' AND e.nombre_cientifico = 'Aesculus glabra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Koelreuteria paniculata', 'Jabonero de China'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Koelreuteria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Koelreuteria' AND e.nombre_cientifico = 'Koelreuteria paniculata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sapindus saponaria', 'Jabonero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Sapindus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Sapindus' AND e.nombre_cientifico = 'Sapindus saponaria'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Dodonaea viscosa', 'Dodonea'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Dodonaea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Dodonaea' AND e.nombre_cientifico = 'Dodonaea viscosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia cordata', 'Tilo de hoja pequeña'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia cordata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia platyphyllos', 'Tilo de hoja grande'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia platyphyllos'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia tomentosa', 'Tilo plateado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia tomentosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia x europaea', 'Tilo común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia x europaea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia americana', 'Tilo americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia americana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Brachychiton populneus', 'Brachichito'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Brachychiton'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Brachychiton' AND e.nombre_cientifico = 'Brachychiton populneus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Brachychiton acerifolius', 'Árbol de fuego australiano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Brachychiton'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Brachychiton' AND e.nombre_cientifico = 'Brachychiton acerifolius'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Brachychiton discolor', 'Brachichito rosado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Brachychiton'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Brachychiton' AND e.nombre_cientifico = 'Brachychiton discolor'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ceiba speciosa', 'Palo borracho'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Ceiba'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Ceiba' AND e.nombre_cientifico = 'Ceiba speciosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Firmiana simplex', 'Parasol chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Firmiana'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Firmiana' AND e.nombre_cientifico = 'Firmiana simplex'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Lagunaria patersonia', 'Lagunaria'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Lagunaria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Lagunaria' AND e.nombre_cientifico = 'Lagunaria patersonia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Platanus x hispanica', 'Plátano de sombra'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Platanaceae' AND g.nombre_cientifico = 'Platanus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Platanaceae' AND g2.nombre_cientifico = 'Platanus' AND e.nombre_cientifico = 'Platanus x hispanica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Platanus orientalis', 'Plátano oriental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Platanaceae' AND g.nombre_cientifico = 'Platanus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Platanaceae' AND g2.nombre_cientifico = 'Platanus' AND e.nombre_cientifico = 'Platanus orientalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Platanus occidentalis', 'Plátano occidental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Platanaceae' AND g.nombre_cientifico = 'Platanus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Platanaceae' AND g2.nombre_cientifico = 'Platanus' AND e.nombre_cientifico = 'Platanus occidentalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juglans regia', 'Nogal común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Juglandaceae' AND g.nombre_cientifico = 'Juglans'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Juglandaceae' AND g2.nombre_cientifico = 'Juglans' AND e.nombre_cientifico = 'Juglans regia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juglans nigra', 'Nogal negro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Juglandaceae' AND g.nombre_cientifico = 'Juglans'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Juglandaceae' AND g2.nombre_cientifico = 'Juglans' AND e.nombre_cientifico = 'Juglans nigra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Carya illinoinensis', 'Pacano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Juglandaceae' AND g.nombre_cientifico = 'Carya'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Juglandaceae' AND g2.nombre_cientifico = 'Carya' AND e.nombre_cientifico = 'Carya illinoinensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pterocarya fraxinifolia', 'Nogal alado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Juglandaceae' AND g.nombre_cientifico = 'Pterocarya'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Juglandaceae' AND g2.nombre_cientifico = 'Pterocarya' AND e.nombre_cientifico = 'Pterocarya fraxinifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Eucalyptus globulus', 'Eucalipto blanco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Eucalyptus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Myrtaceae' AND g2.nombre_cientifico = 'Eucalyptus' AND e.nombre_cientifico = 'Eucalyptus globulus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Eucalyptus camaldulensis', 'Eucalipto rojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Eucalyptus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Myrtaceae' AND g2.nombre_cientifico = 'Eucalyptus' AND e.nombre_cientifico = 'Eucalyptus camaldulensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Eucalyptus gunnii', 'Eucalipto de Gunn'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Eucalyptus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Myrtaceae' AND g2.nombre_cientifico = 'Eucalyptus' AND e.nombre_cientifico = 'Eucalyptus gunnii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Eucalyptus cladocalyx', 'Eucalipto de azúcar'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Eucalyptus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Myrtaceae' AND g2.nombre_cientifico = 'Eucalyptus' AND e.nombre_cientifico = 'Eucalyptus cladocalyx'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Eucalyptus sideroxylon', 'Eucalipto rojo de hierro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Eucalyptus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Myrtaceae' AND g2.nombre_cientifico = 'Eucalyptus' AND e.nombre_cientifico = 'Eucalyptus sideroxylon'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Metrosideros excelsa', 'Árbol de Navidad de Nueva Zelanda'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Metrosideros'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Myrtaceae' AND g2.nombre_cientifico = 'Metrosideros' AND e.nombre_cientifico = 'Metrosideros excelsa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Callistemon citrinus', 'Limpiatubos'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Callistemon'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Myrtaceae' AND g2.nombre_cientifico = 'Callistemon' AND e.nombre_cientifico = 'Callistemon citrinus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Melaleuca armillaris', 'Melaleuca'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Myrtaceae' AND g.nombre_cientifico = 'Melaleuca'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Myrtaceae' AND g2.nombre_cientifico = 'Melaleuca' AND e.nombre_cientifico = 'Melaleuca armillaris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Citrus aurantium', 'Naranjo amargo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Citrus' AND e.nombre_cientifico = 'Citrus aurantium'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Citrus sinensis', 'Naranjo dulce'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Citrus' AND e.nombre_cientifico = 'Citrus sinensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Citrus limon', 'Limonero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Citrus' AND e.nombre_cientifico = 'Citrus limon'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Citrus reticulata', 'Mandarino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Citrus' AND e.nombre_cientifico = 'Citrus reticulata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Poncirus trifoliata', 'Naranjo trifoliado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Poncirus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Poncirus' AND e.nombre_cientifico = 'Poncirus trifoliata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Melia azedarach', 'Cinamomo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Melia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Meliaceae' AND g2.nombre_cientifico = 'Melia' AND e.nombre_cientifico = 'Melia azedarach'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ailanthus altissima', 'Ailanto'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Simaroubaceae' AND g.nombre_cientifico = 'Ailanthus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Simaroubaceae' AND g2.nombre_cientifico = 'Ailanthus' AND e.nombre_cientifico = 'Ailanthus altissima'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Catalpa bignonioides', 'Catalpa común'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Catalpa'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Bignoniaceae' AND g2.nombre_cientifico = 'Catalpa' AND e.nombre_cientifico = 'Catalpa bignonioides'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Catalpa speciosa', 'Catalpa del norte'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Catalpa'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Bignoniaceae' AND g2.nombre_cientifico = 'Catalpa' AND e.nombre_cientifico = 'Catalpa speciosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Jacaranda mimosifolia', 'Jacarandá'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Jacaranda'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Bignoniaceae' AND g2.nombre_cientifico = 'Jacaranda' AND e.nombre_cientifico = 'Jacaranda mimosifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Handroanthus impetiginosus', 'Lapacho rosado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Handroanthus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Bignoniaceae' AND g2.nombre_cientifico = 'Handroanthus' AND e.nombre_cientifico = 'Handroanthus impetiginosus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tecoma stans', 'Tecoma amarilla'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Bignoniaceae' AND g.nombre_cientifico = 'Tecoma'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Bignoniaceae' AND g2.nombre_cientifico = 'Tecoma' AND e.nombre_cientifico = 'Tecoma stans'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Paulownia tomentosa', 'Paulonia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Paulowniaceae' AND g.nombre_cientifico = 'Paulownia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Paulowniaceae' AND g2.nombre_cientifico = 'Paulownia' AND e.nombre_cientifico = 'Paulownia tomentosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pistacia lentiscus', 'Lentisco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Pistacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Anacardiaceae' AND g2.nombre_cientifico = 'Pistacia' AND e.nombre_cientifico = 'Pistacia lentiscus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pistacia terebinthus', 'Cornicabra'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Pistacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Anacardiaceae' AND g2.nombre_cientifico = 'Pistacia' AND e.nombre_cientifico = 'Pistacia terebinthus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pistacia vera', 'Pistachero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Pistacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Anacardiaceae' AND g2.nombre_cientifico = 'Pistacia' AND e.nombre_cientifico = 'Pistacia vera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Schinus molle', 'Falso pimentero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Schinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Anacardiaceae' AND g2.nombre_cientifico = 'Schinus' AND e.nombre_cientifico = 'Schinus molle'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Schinus terebinthifolia', 'Pimentero brasileño'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Schinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Anacardiaceae' AND g2.nombre_cientifico = 'Schinus' AND e.nombre_cientifico = 'Schinus terebinthifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Rhus typhina', 'Zumaque de Virginia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Anacardiaceae' AND g.nombre_cientifico = 'Rhus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Anacardiaceae' AND g2.nombre_cientifico = 'Rhus' AND e.nombre_cientifico = 'Rhus typhina'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Laurus nobilis', 'Laurel'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lauraceae' AND g.nombre_cientifico = 'Laurus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lauraceae' AND g2.nombre_cientifico = 'Laurus' AND e.nombre_cientifico = 'Laurus nobilis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Persea americana', 'Aguacate'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lauraceae' AND g.nombre_cientifico = 'Persea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lauraceae' AND g2.nombre_cientifico = 'Persea' AND e.nombre_cientifico = 'Persea americana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cinnamomum camphora', 'Árbol del alcanfor'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lauraceae' AND g.nombre_cientifico = 'Cinnamomum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lauraceae' AND g2.nombre_cientifico = 'Cinnamomum' AND e.nombre_cientifico = 'Cinnamomum camphora'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Umbellularia californica', 'Laurel de California'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lauraceae' AND g.nombre_cientifico = 'Umbellularia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lauraceae' AND g2.nombre_cientifico = 'Umbellularia' AND e.nombre_cientifico = 'Umbellularia californica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ilex aquifolium', 'Acebo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Aquifoliaceae' AND g.nombre_cientifico = 'Ilex'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Aquifoliaceae' AND g2.nombre_cientifico = 'Ilex' AND e.nombre_cientifico = 'Ilex aquifolium'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ilex x altaclerensis', 'Acebo híbrido'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Aquifoliaceae' AND g.nombre_cientifico = 'Ilex'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Aquifoliaceae' AND g2.nombre_cientifico = 'Ilex' AND e.nombre_cientifico = 'Ilex x altaclerensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sambucus nigra', 'Saúco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Adoxaceae' AND g.nombre_cientifico = 'Sambucus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Adoxaceae' AND g2.nombre_cientifico = 'Sambucus' AND e.nombre_cientifico = 'Sambucus nigra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cornus sanguinea', 'Cornejo rojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cornaceae' AND g.nombre_cientifico = 'Cornus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cornaceae' AND g2.nombre_cientifico = 'Cornus' AND e.nombre_cientifico = 'Cornus sanguinea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cornus mas', 'Cornejo macho'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cornaceae' AND g.nombre_cientifico = 'Cornus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cornaceae' AND g2.nombre_cientifico = 'Cornus' AND e.nombre_cientifico = 'Cornus mas'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cornus florida', 'Cornejo florido'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cornaceae' AND g.nombre_cientifico = 'Cornus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cornaceae' AND g2.nombre_cientifico = 'Cornus' AND e.nombre_cientifico = 'Cornus florida'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cornus kousa', 'Cornejo japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cornaceae' AND g.nombre_cientifico = 'Cornus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cornaceae' AND g2.nombre_cientifico = 'Cornus' AND e.nombre_cientifico = 'Cornus kousa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Elaeagnus angustifolia', 'Árbol del paraíso'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Elaeagnaceae' AND g.nombre_cientifico = 'Elaeagnus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Elaeagnaceae' AND g2.nombre_cientifico = 'Elaeagnus' AND e.nombre_cientifico = 'Elaeagnus angustifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Hippophae rhamnoides', 'Espino amarillo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Elaeagnaceae' AND g.nombre_cientifico = 'Hippophae'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Elaeagnaceae' AND g2.nombre_cientifico = 'Hippophae' AND e.nombre_cientifico = 'Hippophae rhamnoides'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Rhamnus alaternus', 'Aladierno'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rhamnaceae' AND g.nombre_cientifico = 'Rhamnus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rhamnaceae' AND g2.nombre_cientifico = 'Rhamnus' AND e.nombre_cientifico = 'Rhamnus alaternus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Frangula alnus', 'Arraclán'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rhamnaceae' AND g.nombre_cientifico = 'Frangula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rhamnaceae' AND g2.nombre_cientifico = 'Frangula' AND e.nombre_cientifico = 'Frangula alnus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ziziphus jujuba', 'Azufaifo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rhamnaceae' AND g.nombre_cientifico = 'Ziziphus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rhamnaceae' AND g2.nombre_cientifico = 'Ziziphus' AND e.nombre_cientifico = 'Ziziphus jujuba'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Paliurus spina-christi', 'Espina de Cristo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rhamnaceae' AND g.nombre_cientifico = 'Paliurus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rhamnaceae' AND g2.nombre_cientifico = 'Paliurus' AND e.nombre_cientifico = 'Paliurus spina-christi'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tamarix gallica', 'Taray'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Tamaricaceae' AND g.nombre_cientifico = 'Tamarix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Tamaricaceae' AND g2.nombre_cientifico = 'Tamarix' AND e.nombre_cientifico = 'Tamarix gallica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tamarix africana', 'Taraje africano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Tamaricaceae' AND g.nombre_cientifico = 'Tamarix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Tamaricaceae' AND g2.nombre_cientifico = 'Tamarix' AND e.nombre_cientifico = 'Tamarix africana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tamarix canariensis', 'Taraje canario'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Tamaricaceae' AND g.nombre_cientifico = 'Tamarix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Tamaricaceae' AND g2.nombre_cientifico = 'Tamarix' AND e.nombre_cientifico = 'Tamarix canariensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tamarix ramosissima', 'Taray rosado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Tamaricaceae' AND g.nombre_cientifico = 'Tamarix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Tamaricaceae' AND g2.nombre_cientifico = 'Tamarix' AND e.nombre_cientifico = 'Tamarix ramosissima'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Punica granatum', 'Granado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lythraceae' AND g.nombre_cientifico = 'Punica'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lythraceae' AND g2.nombre_cientifico = 'Punica' AND e.nombre_cientifico = 'Punica granatum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Lagerstroemia indica', 'Árbol de Júpiter'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lythraceae' AND g.nombre_cientifico = 'Lagerstroemia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lythraceae' AND g2.nombre_cientifico = 'Lagerstroemia' AND e.nombre_cientifico = 'Lagerstroemia indica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Lagerstroemia speciosa', 'Lagerstroemia gigante'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lythraceae' AND g.nombre_cientifico = 'Lagerstroemia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lythraceae' AND g2.nombre_cientifico = 'Lagerstroemia' AND e.nombre_cientifico = 'Lagerstroemia speciosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sideroxylon canariense', 'Marmulán'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapotaceae' AND g.nombre_cientifico = 'Sideroxylon'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapotaceae' AND g2.nombre_cientifico = 'Sideroxylon' AND e.nombre_cientifico = 'Sideroxylon canariense'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Argania spinosa', 'Argán'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapotaceae' AND g.nombre_cientifico = 'Argania'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapotaceae' AND g2.nombre_cientifico = 'Argania' AND e.nombre_cientifico = 'Argania spinosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Styrax officinalis', 'Estoraque'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Styracaceae' AND g.nombre_cientifico = 'Styrax'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Styracaceae' AND g2.nombre_cientifico = 'Styrax' AND e.nombre_cientifico = 'Styrax officinalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Halesia carolina', 'Árbol de las campanillas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Styracaceae' AND g.nombre_cientifico = 'Halesia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Styracaceae' AND g2.nombre_cientifico = 'Halesia' AND e.nombre_cientifico = 'Halesia carolina'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Liquidambar styraciflua', 'Liquidámbar americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Altingiaceae' AND g.nombre_cientifico = 'Liquidambar'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Altingiaceae' AND g2.nombre_cientifico = 'Liquidambar' AND e.nombre_cientifico = 'Liquidambar styraciflua'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Parrotia persica', 'Árbol de hierro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Hamamelidaceae' AND g.nombre_cientifico = 'Parrotia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Hamamelidaceae' AND g2.nombre_cientifico = 'Parrotia' AND e.nombre_cientifico = 'Parrotia persica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Hamamelis virginiana', 'Avellano de bruja'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Hamamelidaceae' AND g.nombre_cientifico = 'Hamamelis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Hamamelidaceae' AND g2.nombre_cientifico = 'Hamamelis' AND e.nombre_cientifico = 'Hamamelis virginiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Magnolia grandiflora', 'Magnolio'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Magnoliaceae' AND g.nombre_cientifico = 'Magnolia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Magnoliaceae' AND g2.nombre_cientifico = 'Magnolia' AND e.nombre_cientifico = 'Magnolia grandiflora'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Magnolia kobus', 'Magnolio kobus'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Magnoliaceae' AND g.nombre_cientifico = 'Magnolia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Magnoliaceae' AND g2.nombre_cientifico = 'Magnolia' AND e.nombre_cientifico = 'Magnolia kobus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Magnolia soulangeana', 'Magnolia de Soulange'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Magnoliaceae' AND g.nombre_cientifico = 'Magnolia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Magnoliaceae' AND g2.nombre_cientifico = 'Magnolia' AND e.nombre_cientifico = 'Magnolia soulangeana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Liriodendron tulipifera', 'Tulipero de Virginia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Magnoliaceae' AND g.nombre_cientifico = 'Liriodendron'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Magnoliaceae' AND g2.nombre_cientifico = 'Liriodendron' AND e.nombre_cientifico = 'Liriodendron tulipifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Grevillea robusta', 'Roble australiano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Proteaceae' AND g.nombre_cientifico = 'Grevillea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Proteaceae' AND g2.nombre_cientifico = 'Grevillea' AND e.nombre_cientifico = 'Grevillea robusta'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Casuarina equisetifolia', 'Casuarina'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Casuarinaceae' AND g.nombre_cientifico = 'Casuarina'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Casuarinaceae' AND g2.nombre_cientifico = 'Casuarina' AND e.nombre_cientifico = 'Casuarina equisetifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Casuarina cunninghamiana', 'Casuarina de río'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Casuarinaceae' AND g.nombre_cientifico = 'Casuarina'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Casuarinaceae' AND g2.nombre_cientifico = 'Casuarina' AND e.nombre_cientifico = 'Casuarina cunninghamiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Nothofagus antarctica', 'Ñire'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Nothofagaceae' AND g.nombre_cientifico = 'Nothofagus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Nothofagaceae' AND g2.nombre_cientifico = 'Nothofagus' AND e.nombre_cientifico = 'Nothofagus antarctica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Nothofagus obliqua', 'Roble pellín'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Nothofagaceae' AND g.nombre_cientifico = 'Nothofagus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Nothofagaceae' AND g2.nombre_cientifico = 'Nothofagus' AND e.nombre_cientifico = 'Nothofagus obliqua'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Diospyros kaki', 'Caqui'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ebenaceae' AND g.nombre_cientifico = 'Diospyros'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ebenaceae' AND g2.nombre_cientifico = 'Diospyros' AND e.nombre_cientifico = 'Diospyros kaki'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Diospyros lotus', 'Caqui silvestre'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ebenaceae' AND g.nombre_cientifico = 'Diospyros'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ebenaceae' AND g2.nombre_cientifico = 'Diospyros' AND e.nombre_cientifico = 'Diospyros lotus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Diospyros virginiana', 'Caqui americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ebenaceae' AND g.nombre_cientifico = 'Diospyros'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ebenaceae' AND g2.nombre_cientifico = 'Diospyros' AND e.nombre_cientifico = 'Diospyros virginiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Buxus sempervirens', 'Boj'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Buxaceae' AND g.nombre_cientifico = 'Buxus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Buxaceae' AND g2.nombre_cientifico = 'Buxus' AND e.nombre_cientifico = 'Buxus sempervirens'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Buxus balearica', 'Boj balear'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Buxaceae' AND g.nombre_cientifico = 'Buxus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Buxaceae' AND g2.nombre_cientifico = 'Buxus' AND e.nombre_cientifico = 'Buxus balearica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Euonymus europaeus', 'Bonetero europeo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Celastraceae' AND g.nombre_cientifico = 'Euonymus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Celastraceae' AND g2.nombre_cientifico = 'Euonymus' AND e.nombre_cientifico = 'Euonymus europaeus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Euonymus japonicus', 'Evónimo japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Celastraceae' AND g.nombre_cientifico = 'Euonymus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Celastraceae' AND g2.nombre_cientifico = 'Euonymus' AND e.nombre_cientifico = 'Euonymus japonicus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Euonymus latifolius', 'Bonetero de hoja ancha'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Celastraceae' AND g.nombre_cientifico = 'Euonymus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Celastraceae' AND g2.nombre_cientifico = 'Euonymus' AND e.nombre_cientifico = 'Euonymus latifolius'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Nerium oleander', 'Adelfa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Apocynaceae' AND g.nombre_cientifico = 'Nerium'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Apocynaceae' AND g2.nombre_cientifico = 'Nerium' AND e.nombre_cientifico = 'Nerium oleander'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Thevetia peruviana', 'Adelfa amarilla'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Apocynaceae' AND g.nombre_cientifico = 'Thevetia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Apocynaceae' AND g2.nombre_cientifico = 'Thevetia' AND e.nombre_cientifico = 'Thevetia peruviana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Plumeria rubra', 'Frangipani'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Apocynaceae' AND g.nombre_cientifico = 'Plumeria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Apocynaceae' AND g2.nombre_cientifico = 'Plumeria' AND e.nombre_cientifico = 'Plumeria rubra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tetrapanax papyrifer', 'Árbol del papel de arroz'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Araliaceae' AND g.nombre_cientifico = 'Tetrapanax'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Araliaceae' AND g2.nombre_cientifico = 'Tetrapanax' AND e.nombre_cientifico = 'Tetrapanax papyrifer'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Schefflera actinophylla', 'Árbol paraguas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Araliaceae' AND g.nombre_cientifico = 'Schefflera'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Araliaceae' AND g2.nombre_cientifico = 'Schefflera' AND e.nombre_cientifico = 'Schefflera actinophylla'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Phytolacca dioica', 'Ombú'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Phytolaccaceae' AND g.nombre_cientifico = 'Phytolacca'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Phytolaccaceae' AND g2.nombre_cientifico = 'Phytolacca' AND e.nombre_cientifico = 'Phytolacca dioica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Decaisnea fargesii', 'Dedos azules'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lardizabalaceae' AND g.nombre_cientifico = 'Decaisnea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lardizabalaceae' AND g2.nombre_cientifico = 'Decaisnea' AND e.nombre_cientifico = 'Decaisnea fargesii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Solanum mauritianum', 'Tabaco moruno'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Solanaceae' AND g.nombre_cientifico = 'Solanum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Solanaceae' AND g2.nombre_cientifico = 'Solanum' AND e.nombre_cientifico = 'Solanum mauritianum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Brugmansia arborea', 'Trompeta de ángel'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Solanaceae' AND g.nombre_cientifico = 'Brugmansia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Solanaceae' AND g2.nombre_cientifico = 'Brugmansia' AND e.nombre_cientifico = 'Brugmansia arborea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Vitex agnus-castus', 'Sauzgatillo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Verbenaceae' AND g.nombre_cientifico = 'Vitex'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Verbenaceae' AND g2.nombre_cientifico = 'Vitex' AND e.nombre_cientifico = 'Vitex agnus-castus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Phlomis purpurea', 'Matagallo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lamiaceae' AND g.nombre_cientifico = 'Phlomis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lamiaceae' AND g2.nombre_cientifico = 'Phlomis' AND e.nombre_cientifico = 'Phlomis purpurea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Clerodendrum trichotomum', 'Árbol del destino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Lamiaceae' AND g.nombre_cientifico = 'Clerodendrum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Lamiaceae' AND g2.nombre_cientifico = 'Clerodendrum' AND e.nombre_cientifico = 'Clerodendrum trichotomum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Phoenix dactylifera', 'Palmera datilera'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Phoenix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Phoenix' AND e.nombre_cientifico = 'Phoenix dactylifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Phoenix canariensis', 'Palmera canaria'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Phoenix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Phoenix' AND e.nombre_cientifico = 'Phoenix canariensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Washingtonia robusta', 'Washingtonia robusta'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Washingtonia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Washingtonia' AND e.nombre_cientifico = 'Washingtonia robusta'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Washingtonia filifera', 'Washingtonia filifera'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Washingtonia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Washingtonia' AND e.nombre_cientifico = 'Washingtonia filifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Trachycarpus fortunei', 'Palmito elevado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Trachycarpus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Trachycarpus' AND e.nombre_cientifico = 'Trachycarpus fortunei'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Chamaerops humilis', 'Palmito'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Chamaerops'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Chamaerops' AND e.nombre_cientifico = 'Chamaerops humilis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Butia capitata', 'Butiá'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Butia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Butia' AND e.nombre_cientifico = 'Butia capitata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Syagrus romanzoffiana', 'Palmera pindó'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Syagrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Syagrus' AND e.nombre_cientifico = 'Syagrus romanzoffiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Jubaea chilensis', 'Palmera chilena'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Jubaea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Jubaea' AND e.nombre_cientifico = 'Jubaea chilensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sabal palmetto', 'Palmeto de Carolina'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Arecaceae' AND g.nombre_cientifico = 'Sabal'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Arecaceae' AND g2.nombre_cientifico = 'Sabal' AND e.nombre_cientifico = 'Sabal palmetto'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Dracaena draco', 'Drago'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Dracaena'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Asparagaceae' AND g2.nombre_cientifico = 'Dracaena' AND e.nombre_cientifico = 'Dracaena draco'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Yucca elephantipes', 'Yuca gigante'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Yucca'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Asparagaceae' AND g2.nombre_cientifico = 'Yucca' AND e.nombre_cientifico = 'Yucca elephantipes'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Yucca gloriosa', 'Yuca gloriosa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Yucca'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Asparagaceae' AND g2.nombre_cientifico = 'Yucca' AND e.nombre_cientifico = 'Yucca gloriosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cordyline australis', 'Cordiline'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Cordyline'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Asparagaceae' AND g2.nombre_cientifico = 'Cordyline' AND e.nombre_cientifico = 'Cordyline australis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Agave americana', 'Pitera'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Asparagaceae' AND g.nombre_cientifico = 'Agave'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Asparagaceae' AND g2.nombre_cientifico = 'Agave' AND e.nombre_cientifico = 'Agave americana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Araucaria heterophylla', 'Araucaria de Norfolk'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Araucariaceae' AND g.nombre_cientifico = 'Araucaria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Araucariaceae' AND g2.nombre_cientifico = 'Araucaria' AND e.nombre_cientifico = 'Araucaria heterophylla'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Araucaria araucana', 'Pehuén'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Araucariaceae' AND g.nombre_cientifico = 'Araucaria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Araucariaceae' AND g2.nombre_cientifico = 'Araucaria' AND e.nombre_cientifico = 'Araucaria araucana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Araucaria bidwillii', 'Araucaria bunya'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Araucariaceae' AND g.nombre_cientifico = 'Araucaria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Araucariaceae' AND g2.nombre_cientifico = 'Araucaria' AND e.nombre_cientifico = 'Araucaria bidwillii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Podocarpus macrophyllus', 'Podocarpo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Podocarpaceae' AND g.nombre_cientifico = 'Podocarpus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Podocarpaceae' AND g2.nombre_cientifico = 'Podocarpus' AND e.nombre_cientifico = 'Podocarpus macrophyllus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ginkgo biloba', 'Ginkgo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ginkgoaceae' AND g.nombre_cientifico = 'Ginkgo'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ginkgoaceae' AND g2.nombre_cientifico = 'Ginkgo' AND e.nombre_cientifico = 'Ginkgo biloba'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cycas revoluta', 'Cica'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cycadaceae' AND g.nombre_cientifico = 'Cycas'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cycadaceae' AND g2.nombre_cientifico = 'Cycas' AND e.nombre_cientifico = 'Cycas revoluta'
);

COMMIT;

-- Ampliación: 200 especies adicionales para completar un listado de 500 especies.
BEGIN;

-- Familias adicionales o ya existentes
INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Pinaceae', 'Pináceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Pinaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Cupressaceae', 'Cupresáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Cupressaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Taxaceae', 'Taxáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Taxaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Podocarpaceae', 'Podocarpáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Podocarpaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Fagaceae', 'Fagáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Fagaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Betulaceae', 'Betuláceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Betulaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Salicaceae', 'Salicáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Salicaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Ulmaceae', 'Ulmáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Ulmaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Cannabaceae', 'Cannabáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Cannabaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Rosaceae', 'Rosáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Rosaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Fabaceae', 'Fabáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Fabaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Rutaceae', 'Rutáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Rutaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Meliaceae', 'Meliáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Meliaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Sapindaceae', 'Sapindáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Sapindaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Malvaceae', 'Malváceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Malvaceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Moraceae', 'Moráceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Moraceae');

INSERT INTO familia (nombre_cientifico, nombre_comun)
SELECT 'Oleaceae', 'Oleáceas'
WHERE NOT EXISTS (SELECT 1 FROM familia WHERE nombre_cientifico = 'Oleaceae');

-- Géneros adicionales o ya existentes
INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Abies', 'Abetos'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cedrus', 'Cedros'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Cedrus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pinus', 'Pinos'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Picea', 'Píceas'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Picea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Tsuga', 'Tsugas'
FROM familia WHERE nombre_cientifico = 'Pinaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Tsuga'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Callitris', 'Cipreses australianos'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Callitris'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Chamaecyparis', 'Chamaecyparis'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Chamaecyparis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cupressus', 'Cupressus'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cupressus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Juniperus', 'Juniperus'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Taxodium', 'Taxodium'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Taxodium'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Thuja', 'Thuja'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Thuja'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Thujopsis', 'Hiba'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Thujopsis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Widdringtonia', 'Cedros africanos'
FROM familia WHERE nombre_cientifico = 'Cupressaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Widdringtonia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Taxus', 'Tejos'
FROM familia WHERE nombre_cientifico = 'Taxaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Taxaceae' AND g.nombre_cientifico = 'Taxus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Afrocarpus', 'Podocarpos africanos'
FROM familia WHERE nombre_cientifico = 'Podocarpaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Podocarpaceae' AND g.nombre_cientifico = 'Afrocarpus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Podocarpus', 'Podocarpos'
FROM familia WHERE nombre_cientifico = 'Podocarpaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Podocarpaceae' AND g.nombre_cientifico = 'Podocarpus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Quercus', 'Robles'
FROM familia WHERE nombre_cientifico = 'Fagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Fagus', 'Hayas'
FROM familia WHERE nombre_cientifico = 'Fagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Fagus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Castanea', 'Castaños'
FROM familia WHERE nombre_cientifico = 'Fagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Castanea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Castanopsis', 'Castanopsis'
FROM familia WHERE nombre_cientifico = 'Fagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Castanopsis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Lithocarpus', 'Robles de piedra'
FROM familia WHERE nombre_cientifico = 'Fagaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Lithocarpus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Alnus', 'Alisos'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Alnus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Betula', 'Abedules'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Carpinus', 'Carpes'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Carpinus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ostrya', 'Carpes negros'
FROM familia WHERE nombre_cientifico = 'Betulaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Ostrya'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Populus', 'Álamos y chopos'
FROM familia WHERE nombre_cientifico = 'Salicaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Salix', 'Sauces'
FROM familia WHERE nombre_cientifico = 'Salicaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ulmus', 'Olmos'
FROM familia WHERE nombre_cientifico = 'Ulmaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Zelkova', 'Zelkovas'
FROM familia WHERE nombre_cientifico = 'Ulmaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Zelkova'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Celtis', 'Almeces'
FROM familia WHERE nombre_cientifico = 'Cannabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Trema', 'Trema'
FROM familia WHERE nombre_cientifico = 'Cannabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Trema'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Malus', 'Manzanos'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pyrus', 'Perales'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Pyrus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Prunus', 'Prunos'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sorbus', 'Serbales'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Crataegus', 'Espinos'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Crataegus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Eriobotrya', 'Nísperos japoneses'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Eriobotrya'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Photinia', 'Fotinias'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Photinia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Aronia', 'Aronias'
FROM familia WHERE nombre_cientifico = 'Rosaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Aronia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Acacia', 'Acacias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Albizia', 'Albizias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Albizia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Bauhinia', 'Bauhinias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Bauhinia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ceratonia', 'Algarrobos'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Ceratonia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cercis', 'Árboles del amor'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Cercis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cladrastis', 'Cladrastis'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Cladrastis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Delonix', 'Flamboyanes'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Delonix'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Erythrina', 'Ceibos'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Erythrina'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Gleditsia', 'Gleditsias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Gleditsia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Gymnocladus', 'Cafeteros de Kentucky'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Gymnocladus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Inga', 'Ingas'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Inga'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Leucaena', 'Leucaenas'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Leucaena'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Peltophorum', 'Peltóforos'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Peltophorum'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pithecellobium', 'Pithecellobios'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Pithecellobium'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Prosopis', 'Mezquites'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Prosopis'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Robinia', 'Robinias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Robinia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Senna', 'Sennas arbóreas'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Senna'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sophora', 'Sóforas'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Sophora'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Virgilia', 'Virgilias'
FROM familia WHERE nombre_cientifico = 'Fabaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Virgilia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Citrus', 'Cítricos'
FROM familia WHERE nombre_cientifico = 'Rutaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Zanthoxylum', 'Pimenteros japoneses'
FROM familia WHERE nombre_cientifico = 'Rutaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Zanthoxylum'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Azadirachta', 'Nims'
FROM familia WHERE nombre_cientifico = 'Meliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Azadirachta'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Cedrela', 'Cedrelas'
FROM familia WHERE nombre_cientifico = 'Meliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Cedrela'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Khaya', 'Caobas africanas'
FROM familia WHERE nombre_cientifico = 'Meliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Khaya'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Toona', 'Toonas'
FROM familia WHERE nombre_cientifico = 'Meliaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Toona'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Acer', 'Arces'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Aesculus', 'Castaños de Indias'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Dodonaea', 'Dodoneas'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Dodonaea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Harpullia', 'Harpullias'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Harpullia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Koelreuteria', 'Jaboneros de China'
FROM familia WHERE nombre_cientifico = 'Sapindaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Koelreuteria'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Brachychiton', 'Brachichitos'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Brachychiton'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Dombeya', 'Dombeyas'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Dombeya'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Hibiscus', 'Hibiscos'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Hibiscus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Pseudobombax', 'Pseudobombax'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Pseudobombax'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Sterculia', 'Esterculias'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Sterculia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Tilia', 'Tilos'
FROM familia WHERE nombre_cientifico = 'Malvaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Artocarpus', 'Árboles del pan'
FROM familia WHERE nombre_cientifico = 'Moraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Artocarpus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ficus', 'Ficus'
FROM familia WHERE nombre_cientifico = 'Moraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Morus', 'Moreras'
FROM familia WHERE nombre_cientifico = 'Moraceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Morus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Fraxinus', 'Fresnos'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Ligustrum', 'Aligustres'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Ligustrum'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Olea', 'Olivos'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Olea'
);

INSERT INTO genero (familia_id, nombre_cientifico, nombre_comun)
SELECT familia_id, 'Osmanthus', 'Osmanthus'
FROM familia WHERE nombre_cientifico = 'Oleaceae'
AND NOT EXISTS (
  SELECT 1 FROM genero g
  JOIN familia f ON f.familia_id = g.familia_id
  WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Osmanthus'
);

-- Especies adicionales
INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies concolor', 'Abeto del Colorado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies concolor'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies grandis', 'Abeto gigante'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies grandis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies procera', 'Abeto noble'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies procera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies koreana', 'Abeto de Corea'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies koreana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Abies cilicica', 'Abeto de Cilicia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Abies'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Abies' AND e.nombre_cientifico = 'Abies cilicica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cedrus brevifolia', 'Cedro de Chipre'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Cedrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Cedrus' AND e.nombre_cientifico = 'Cedrus brevifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus banksiana', 'Pino banksiano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus banksiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus contorta', 'Pino contorta'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus contorta'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus coulteri', 'Pino de Coulter'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus coulteri'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus densiflora', 'Pino rojo japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus densiflora'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus jeffreyi', 'Pino de Jeffrey'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus jeffreyi'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus koraiensis', 'Pino de Corea'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus koraiensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus lambertiana', 'Pino azucarero'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus lambertiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus muricata', 'Pino de Bishop'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus muricata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus nigra subsp. salzmannii', 'Pino laricio ibérico'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus nigra subsp. salzmannii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus ponderosa', 'Pino ponderosa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus ponderosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus rigida', 'Pino rígido'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus rigida'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus serotina', 'Pino de estanque'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus serotina'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pinus sylvestris var. nevadensis', 'Pino silvestre nevadense'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Pinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Pinus' AND e.nombre_cientifico = 'Pinus sylvestris var. nevadensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Picea orientalis', 'Pícea oriental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Picea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Picea' AND e.nombre_cientifico = 'Picea orientalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Picea sitchensis', 'Pícea de Sitka'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Picea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Picea' AND e.nombre_cientifico = 'Picea sitchensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tsuga canadensis', 'Tsuga del Canadá'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Tsuga'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Tsuga' AND e.nombre_cientifico = 'Tsuga canadensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tsuga heterophylla', 'Tsuga occidental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Pinaceae' AND g.nombre_cientifico = 'Tsuga'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Pinaceae' AND g2.nombre_cientifico = 'Tsuga' AND e.nombre_cientifico = 'Tsuga heterophylla'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Callitris columellaris', 'Ciprés australiano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Callitris'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Callitris' AND e.nombre_cientifico = 'Callitris columellaris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Chamaecyparis obtusa', 'Ciprés hinoki'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Chamaecyparis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Chamaecyparis' AND e.nombre_cientifico = 'Chamaecyparis obtusa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Chamaecyparis pisifera', 'Falso ciprés sawara'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Chamaecyparis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Chamaecyparis' AND e.nombre_cientifico = 'Chamaecyparis pisifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cupressus arizonica var. glabra', 'Ciprés azul de Arizona'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Cupressus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Cupressus' AND e.nombre_cientifico = 'Cupressus arizonica var. glabra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus communis subsp. hemisphaerica', 'Enebro rastrero de montaña'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus communis subsp. hemisphaerica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus communis subsp. nana', 'Enebro enano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus communis subsp. nana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus drupacea', 'Enebro sirio'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus drupacea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus horizontalis', 'Enebro horizontal'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus horizontalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus phoenicea subsp. turbinata', 'Sabina marítima'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus phoenicea subsp. turbinata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Juniperus squamata', 'Enebro escamoso'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Juniperus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Juniperus' AND e.nombre_cientifico = 'Juniperus squamata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Taxodium ascendens', 'Ciprés de estanque'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Taxodium'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Taxodium' AND e.nombre_cientifico = 'Taxodium ascendens'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Taxodium mucronatum', 'Ahuehuete'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Taxodium'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Taxodium' AND e.nombre_cientifico = 'Taxodium mucronatum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Thuja standishii', 'Tuya japonesa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Thuja'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Thuja' AND e.nombre_cientifico = 'Thuja standishii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Thujopsis dolabrata', 'Hiba japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Thujopsis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Thujopsis' AND e.nombre_cientifico = 'Thujopsis dolabrata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Widdringtonia nodiflora', 'Ciprés africano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cupressaceae' AND g.nombre_cientifico = 'Widdringtonia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cupressaceae' AND g2.nombre_cientifico = 'Widdringtonia' AND e.nombre_cientifico = 'Widdringtonia nodiflora'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Taxus canadensis', 'Tejo canadiense'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Taxaceae' AND g.nombre_cientifico = 'Taxus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Taxaceae' AND g2.nombre_cientifico = 'Taxus' AND e.nombre_cientifico = 'Taxus canadensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Afrocarpus falcatus', 'Podocarpo africano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Podocarpaceae' AND g.nombre_cientifico = 'Afrocarpus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Podocarpaceae' AND g2.nombre_cientifico = 'Afrocarpus' AND e.nombre_cientifico = 'Afrocarpus falcatus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Podocarpus henkelii', 'Podocarpo de Henkel'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Podocarpaceae' AND g.nombre_cientifico = 'Podocarpus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Podocarpaceae' AND g2.nombre_cientifico = 'Podocarpus' AND e.nombre_cientifico = 'Podocarpus henkelii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus alpestris', 'Roble alpestre'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus alpestris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus cerrioides', 'Roble cerrioide'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus cerrioides'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus humilis', 'Roble pubescente'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus humilis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus ithaburensis', 'Roble del Tabor'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus ithaburensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus lusitanica', 'Roble enano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus lusitanica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus macrocarpa', 'Roble de grandes bellotas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus macrocarpa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus phellos', 'Roble sauce'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus phellos'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus pontica', 'Roble póntico'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus pontica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus pyrenaica x petraea', 'Híbrido de melojo y roble albar'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus pyrenaica x petraea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Quercus robur x petraea', 'Híbrido de robles europeos'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Quercus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Quercus' AND e.nombre_cientifico = 'Quercus robur x petraea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fagus sylvatica ''Atropunicea''', 'Haya purpúrea'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Fagus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Fagus' AND e.nombre_cientifico = 'Fagus sylvatica ''Atropunicea'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Castanea mollissima', 'Castaño chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Castanea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Castanea' AND e.nombre_cientifico = 'Castanea mollissima'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Castanopsis cuspidata', 'Castanopsis japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Castanopsis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Castanopsis' AND e.nombre_cientifico = 'Castanopsis cuspidata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Lithocarpus edulis', 'Roble de piedra japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fagaceae' AND g.nombre_cientifico = 'Lithocarpus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fagaceae' AND g2.nombre_cientifico = 'Lithocarpus' AND e.nombre_cientifico = 'Lithocarpus edulis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Alnus alnobetula', 'Aliso verde'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Alnus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Alnus' AND e.nombre_cientifico = 'Alnus alnobetula'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula albosinensis', 'Abedul chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula albosinensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula ermanii', 'Abedul de Erman'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula ermanii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula grossa', 'Abedul cerezo japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula grossa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula lenta', 'Abedul dulce'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula lenta'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula maximowicziana', 'Abedul monarca'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula maximowicziana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula nigra', 'Abedul de río'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula nigra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Betula papyrifera', 'Abedul de papel'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Betula'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Betula' AND e.nombre_cientifico = 'Betula papyrifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Carpinus japonica', 'Carpe japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Carpinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Carpinus' AND e.nombre_cientifico = 'Carpinus japonica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ostrya virginiana', 'Carpe-lúpulo americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Betulaceae' AND g.nombre_cientifico = 'Ostrya'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Betulaceae' AND g2.nombre_cientifico = 'Ostrya' AND e.nombre_cientifico = 'Ostrya virginiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus alba var. bolleana', 'Álamo blanco piramidal'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus alba var. bolleana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus balsamifera', 'Álamo balsámico'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus balsamifera'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus deltoides', 'Chopo deltoides'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus deltoides'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Populus lasiocarpa', 'Álamo chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Populus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Populus' AND e.nombre_cientifico = 'Populus lasiocarpa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix alba var. vitellina', 'Mimbrera amarilla'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix alba var. vitellina'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix babylonica x alba', 'Sauce llorón híbrido'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix babylonica x alba'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix eriocephala', 'Sauce diamante'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix eriocephala'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix exigua', 'Sauce estrecho'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix exigua'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Salix triandra', 'Mimbrera almendrada'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Salicaceae' AND g.nombre_cientifico = 'Salix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Salicaceae' AND g2.nombre_cientifico = 'Salix' AND e.nombre_cientifico = 'Salix triandra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus americana', 'Olmo americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus americana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus crassifolia', 'Olmo cedro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus crassifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus davidiana', 'Olmo de David'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus davidiana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ulmus hollandica', 'Olmo holandés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Ulmus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Ulmus' AND e.nombre_cientifico = 'Ulmus hollandica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Zelkova carpinifolia', 'Zelkova caucásica'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Zelkova'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Zelkova' AND e.nombre_cientifico = 'Zelkova carpinifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Zelkova serrata', 'Zelkova japonesa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Ulmaceae' AND g.nombre_cientifico = 'Zelkova'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Ulmaceae' AND g2.nombre_cientifico = 'Zelkova' AND e.nombre_cientifico = 'Zelkova serrata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Celtis bungeana', 'Almez de Bunge'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cannabaceae' AND g2.nombre_cientifico = 'Celtis' AND e.nombre_cientifico = 'Celtis bungeana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Celtis julianae', 'Almez de Julia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cannabaceae' AND g2.nombre_cientifico = 'Celtis' AND e.nombre_cientifico = 'Celtis julianae'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Celtis laevigata', 'Almez americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cannabaceae' AND g2.nombre_cientifico = 'Celtis' AND e.nombre_cientifico = 'Celtis laevigata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Celtis reticulata', 'Almez reticulado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Celtis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cannabaceae' AND g2.nombre_cientifico = 'Celtis' AND e.nombre_cientifico = 'Celtis reticulata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Trema micrantha', 'Trema americana'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Cannabaceae' AND g.nombre_cientifico = 'Trema'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Cannabaceae' AND g2.nombre_cientifico = 'Trema' AND e.nombre_cientifico = 'Trema micrantha'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Malus baccata', 'Manzano siberiano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Malus' AND e.nombre_cientifico = 'Malus baccata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Malus hupehensis', 'Manzano de Hupeh'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Malus' AND e.nombre_cientifico = 'Malus hupehensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Malus ioensis', 'Manzano de Iowa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Malus' AND e.nombre_cientifico = 'Malus ioensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Malus sieversii', 'Manzano silvestre asiático'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Malus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Malus' AND e.nombre_cientifico = 'Malus sieversii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pyrus amygdaliformis', 'Peral almendro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Pyrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Pyrus' AND e.nombre_cientifico = 'Pyrus amygdaliformis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pyrus elaeagnifolia', 'Peral de hoja plateada'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Pyrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Pyrus' AND e.nombre_cientifico = 'Pyrus elaeagnifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pyrus nivalis', 'Peral de nieve'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Pyrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Pyrus' AND e.nombre_cientifico = 'Pyrus nivalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus americana', 'Ciruelo americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus americana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus avium ''Plena''', 'Cerezo de flor doble'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus avium ''Plena'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus cerasifera ''Pissardii''', 'Ciruelo rojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus cerasifera ''Pissardii'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus cerasus', 'Cerezo ácido'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus cerasus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus incisa', 'Cerezo de Fuji'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus incisa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus lusitanica', 'Loro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus lusitanica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus maackii', 'Cerezo de Amur'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus maackii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus sargentii', 'Cerezo de Sargent'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus sargentii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prunus serrula', 'Cerezo tibetano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Prunus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Prunus' AND e.nombre_cientifico = 'Prunus serrula'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus aria x torminalis', 'Serbal híbrido'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus aria x torminalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus aucuparia x aria', 'Serbal híbrido de los cazadores'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus aucuparia x aria'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus chamaemespilus', 'Serbal enano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus chamaemespilus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sorbus mougeotii', 'Mostajo de los Vosgos'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Sorbus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Sorbus' AND e.nombre_cientifico = 'Sorbus mougeotii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Crataegus azarolus', 'Acerolo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Crataegus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Crataegus' AND e.nombre_cientifico = 'Crataegus azarolus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Crataegus orientalis', 'Espino oriental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Crataegus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Crataegus' AND e.nombre_cientifico = 'Crataegus orientalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Crataegus tanacetifolia', 'Espino de hoja de tanaceto'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Crataegus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Crataegus' AND e.nombre_cientifico = 'Crataegus tanacetifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Eriobotrya deflexa', 'Níspero de bronce'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Eriobotrya'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Eriobotrya' AND e.nombre_cientifico = 'Eriobotrya deflexa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Photinia serratifolia', 'Fotinia china'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Photinia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Photinia' AND e.nombre_cientifico = 'Photinia serratifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Aronia arbutifolia', 'Aronia roja'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rosaceae' AND g.nombre_cientifico = 'Aronia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rosaceae' AND g2.nombre_cientifico = 'Aronia' AND e.nombre_cientifico = 'Aronia arbutifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia cyclops', 'Acacia ciclops'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia cyclops'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia karroo', 'Espino dulce'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia karroo'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia longifolia', 'Acacia trinervis'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia longifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia pycnantha', 'Mimosa dorada'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia pycnantha'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia salicina', 'Acacia sauce'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia salicina'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia seyal', 'Acacia seyal'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia seyal'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acacia tortilis', 'Acacia paraguas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Acacia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Acacia' AND e.nombre_cientifico = 'Acacia tortilis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Albizia julibrissin ''Rosea''', 'Acacia de Constantinopla rosa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Albizia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Albizia' AND e.nombre_cientifico = 'Albizia julibrissin ''Rosea'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Bauhinia blakeana', 'Árbol orquídea de Hong Kong'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Bauhinia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Bauhinia' AND e.nombre_cientifico = 'Bauhinia blakeana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Bauhinia forficata', 'Pata de vaca'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Bauhinia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Bauhinia' AND e.nombre_cientifico = 'Bauhinia forficata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Bauhinia purpurea', 'Árbol orquídea púrpura'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Bauhinia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Bauhinia' AND e.nombre_cientifico = 'Bauhinia purpurea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Bauhinia variegata', 'Árbol orquídea'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Bauhinia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Bauhinia' AND e.nombre_cientifico = 'Bauhinia variegata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ceratonia siliqua ''Inermis''', 'Algarrobo sin espinas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Ceratonia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Ceratonia' AND e.nombre_cientifico = 'Ceratonia siliqua ''Inermis'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cercis chinensis', 'Árbol del amor chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Cercis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Cercis' AND e.nombre_cientifico = 'Cercis chinensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cercis occidentalis', 'Árbol de Judas occidental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Cercis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Cercis' AND e.nombre_cientifico = 'Cercis occidentalis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cercis siliquastrum ''Alba''', 'Árbol del amor blanco'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Cercis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Cercis' AND e.nombre_cientifico = 'Cercis siliquastrum ''Alba'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cladrastis kentukea', 'Leño amarillo americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Cladrastis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Cladrastis' AND e.nombre_cientifico = 'Cladrastis kentukea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Delonix regia', 'Flamboyán'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Delonix'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Delonix' AND e.nombre_cientifico = 'Delonix regia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Erythrina caffra', 'Ceibo coral sudafricano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Erythrina'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Erythrina' AND e.nombre_cientifico = 'Erythrina caffra'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Erythrina crista-galli', 'Ceibo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Erythrina'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Erythrina' AND e.nombre_cientifico = 'Erythrina crista-galli'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Gleditsia aquatica', 'Acacia de agua'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Gleditsia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Gleditsia' AND e.nombre_cientifico = 'Gleditsia aquatica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Gymnocladus dioicus', 'Cafetero de Kentucky'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Gymnocladus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Gymnocladus' AND e.nombre_cientifico = 'Gymnocladus dioicus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Inga edulis', 'Guaba'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Inga'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Inga' AND e.nombre_cientifico = 'Inga edulis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Leucaena leucocephala', 'Leucaena'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Leucaena'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Leucaena' AND e.nombre_cientifico = 'Leucaena leucocephala'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Peltophorum dubium', 'Ibirá-pitá'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Peltophorum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Peltophorum' AND e.nombre_cientifico = 'Peltophorum dubium'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pithecellobium dulce', 'Guamúchil'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Pithecellobium'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Pithecellobium' AND e.nombre_cientifico = 'Pithecellobium dulce'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Prosopis chilensis', 'Algarrobo chileno'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Prosopis'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Prosopis' AND e.nombre_cientifico = 'Prosopis chilensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Robinia viscosa', 'Robinia pegajosa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Robinia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Robinia' AND e.nombre_cientifico = 'Robinia viscosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Senna multiglandulosa', 'Senna arbórea'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Senna'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Senna' AND e.nombre_cientifico = 'Senna multiglandulosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sophora cassioides', 'Pelú'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Sophora'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Sophora' AND e.nombre_cientifico = 'Sophora cassioides'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Virgilia divaricata', 'Virgilia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Fabaceae' AND g.nombre_cientifico = 'Virgilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Fabaceae' AND g2.nombre_cientifico = 'Virgilia' AND e.nombre_cientifico = 'Virgilia divaricata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Citrus aurantium var. myrtifolia', 'Naranjo moruno'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Citrus' AND e.nombre_cientifico = 'Citrus aurantium var. myrtifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Citrus bergamia', 'Bergamota'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Citrus' AND e.nombre_cientifico = 'Citrus bergamia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Citrus medica', 'Cidro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Citrus' AND e.nombre_cientifico = 'Citrus medica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Citrus paradisi', 'Pomelo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Citrus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Citrus' AND e.nombre_cientifico = 'Citrus paradisi'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Zanthoxylum piperitum', 'Pimienta japonesa'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Rutaceae' AND g.nombre_cientifico = 'Zanthoxylum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Rutaceae' AND g2.nombre_cientifico = 'Zanthoxylum' AND e.nombre_cientifico = 'Zanthoxylum piperitum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Azadirachta indica', 'Nim'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Azadirachta'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Meliaceae' AND g2.nombre_cientifico = 'Azadirachta' AND e.nombre_cientifico = 'Azadirachta indica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Cedrela odorata', 'Cedro americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Cedrela'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Meliaceae' AND g2.nombre_cientifico = 'Cedrela' AND e.nombre_cientifico = 'Cedrela odorata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Khaya senegalensis', 'Caoba africana'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Khaya'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Meliaceae' AND g2.nombre_cientifico = 'Khaya' AND e.nombre_cientifico = 'Khaya senegalensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Toona sinensis', 'Cedro chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Meliaceae' AND g.nombre_cientifico = 'Toona'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Meliaceae' AND g2.nombre_cientifico = 'Toona' AND e.nombre_cientifico = 'Toona sinensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer cappadocicum', 'Arce de Capadocia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer cappadocicum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer circinatum', 'Arce de vid'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer circinatum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer davidii', 'Arce de David'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer davidii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer ginnala', 'Arce de Amur'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer ginnala'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer griseum', 'Arce de corteza de papel'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer griseum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer heldreichii', 'Arce de los Balcanes'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer heldreichii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer macrophyllum', 'Arce de hoja grande'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer macrophyllum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer miyabei', 'Arce de Miyabe'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer miyabei'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer pentaphyllum', 'Arce de cinco hojas'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer pentaphyllum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer rufinerve', 'Arce de corteza veteada'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer rufinerve'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer tataricum', 'Arce tártaro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer tataricum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Acer truncatum', 'Arce de Shantung'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Acer'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Acer' AND e.nombre_cientifico = 'Acer truncatum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Aesculus californica', 'Castaño de Indias de California'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Aesculus' AND e.nombre_cientifico = 'Aesculus californica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Aesculus flava', 'Castaño de Indias amarillo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Aesculus' AND e.nombre_cientifico = 'Aesculus flava'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Aesculus parviflora', 'Castaño de Indias arbustivo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Aesculus' AND e.nombre_cientifico = 'Aesculus parviflora'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Aesculus pavia', 'Castaño rojo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Aesculus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Aesculus' AND e.nombre_cientifico = 'Aesculus pavia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Dodonaea viscosa ''Purpurea''', 'Dodonea púrpura'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Dodonaea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Dodonaea' AND e.nombre_cientifico = 'Dodonaea viscosa ''Purpurea'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Harpullia pendula', 'Tulipán australiano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Harpullia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Harpullia' AND e.nombre_cientifico = 'Harpullia pendula'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Koelreuteria bipinnata', 'Jabonero bipinnado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Koelreuteria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Koelreuteria' AND e.nombre_cientifico = 'Koelreuteria bipinnata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Koelreuteria elegans', 'Jabonero elegante'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Sapindaceae' AND g.nombre_cientifico = 'Koelreuteria'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Sapindaceae' AND g2.nombre_cientifico = 'Koelreuteria' AND e.nombre_cientifico = 'Koelreuteria elegans'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Brachychiton bidwillii', 'Brachichito de Bidwill'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Brachychiton'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Brachychiton' AND e.nombre_cientifico = 'Brachychiton bidwillii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Brachychiton gregorii', 'Kurrajong del desierto'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Brachychiton'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Brachychiton' AND e.nombre_cientifico = 'Brachychiton gregorii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Brachychiton populneus x acerifolius', 'Brachichito híbrido'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Brachychiton'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Brachychiton' AND e.nombre_cientifico = 'Brachychiton populneus x acerifolius'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Dombeya wallichii', 'Árbol hortensia'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Dombeya'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Dombeya' AND e.nombre_cientifico = 'Dombeya wallichii'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Hibiscus tiliaceus', 'Hibisco marítimo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Hibiscus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Hibiscus' AND e.nombre_cientifico = 'Hibiscus tiliaceus'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Pseudobombax ellipticum', 'Árbol de brocha'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Pseudobombax'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Pseudobombax' AND e.nombre_cientifico = 'Pseudobombax ellipticum'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Sterculia apetala', 'Castaño de Panamá'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Sterculia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Sterculia' AND e.nombre_cientifico = 'Sterculia apetala'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia amurensis', 'Tilo de Amur'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia amurensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia henryana', 'Tilo de Henry'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia henryana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia japonica', 'Tilo japonés'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia japonica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Tilia mongolica', 'Tilo mongol'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Malvaceae' AND g.nombre_cientifico = 'Tilia'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Malvaceae' AND g2.nombre_cientifico = 'Tilia' AND e.nombre_cientifico = 'Tilia mongolica'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Artocarpus altilis', 'Árbol del pan'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Artocarpus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Artocarpus' AND e.nombre_cientifico = 'Artocarpus altilis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus auriculata', 'Higuera oreja de elefante'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus auriculata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus carica ''San Pedro''', 'Higuera San Pedro'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus carica ''San Pedro'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus drupacea', 'Ficus drupáceo'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus drupacea'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus lyrata', 'Ficus lira'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus lyrata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ficus racemosa', 'Higuera de racimos'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Ficus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Ficus' AND e.nombre_cientifico = 'Ficus racemosa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Morus kagayamae', 'Morera de hoja de plátano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Morus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Morus' AND e.nombre_cientifico = 'Morus kagayamae'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Morus macroura', 'Morera del Himalaya'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Moraceae' AND g.nombre_cientifico = 'Morus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Moraceae' AND g2.nombre_cientifico = 'Morus' AND e.nombre_cientifico = 'Morus macroura'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus americana', 'Fresno blanco americano'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus americana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus angustifolia subsp. oxycarpa', 'Fresno de hoja estrecha oriental'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus angustifolia subsp. oxycarpa'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus bungeana', 'Fresno de Bunge'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus bungeana'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus chinensis', 'Fresno chino'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus chinensis'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus latifolia', 'Fresno de Oregón'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus latifolia'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus ornus ''Mecsek''', 'Fresno de flor compacto'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus ornus ''Mecsek'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Fraxinus quadrangulata', 'Fresno azul'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Fraxinus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Fraxinus' AND e.nombre_cientifico = 'Fraxinus quadrangulata'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Ligustrum lucidum ''Excelsum Superbum''', 'Aligustre variegado'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Ligustrum'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Ligustrum' AND e.nombre_cientifico = 'Ligustrum lucidum ''Excelsum Superbum'''
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Olea europaea var. sylvestris', 'Acebuche'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Olea'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Olea' AND e.nombre_cientifico = 'Olea europaea var. sylvestris'
);

INSERT INTO especie (genero_id, nombre_cientifico, nombre_comun)
SELECT g.genero_id, 'Osmanthus fragrans', 'Olivo oloroso'
FROM genero g
JOIN familia f ON f.familia_id = g.familia_id
WHERE f.nombre_cientifico = 'Oleaceae' AND g.nombre_cientifico = 'Osmanthus'
AND NOT EXISTS (
  SELECT 1 FROM especie e
  JOIN genero g2 ON g2.genero_id = e.genero_id
  JOIN familia f2 ON f2.familia_id = g2.familia_id
  WHERE f2.nombre_cientifico = 'Oleaceae' AND g2.nombre_cientifico = 'Osmanthus' AND e.nombre_cientifico = 'Osmanthus fragrans'
);

COMMIT;

INSERT INTO provincia (codigo, nombre) VALUES ('01', 'Álava');
INSERT INTO provincia (codigo, nombre) VALUES ('02', 'Albacete');
INSERT INTO provincia (codigo, nombre) VALUES ('03', 'Alicante');
INSERT INTO provincia (codigo, nombre) VALUES ('04', 'Almería');
INSERT INTO provincia (codigo, nombre) VALUES ('05', 'Ávila');
INSERT INTO provincia (codigo, nombre) VALUES ('06', 'Badajoz');
INSERT INTO provincia (codigo, nombre) VALUES ('07', 'Illes Balears');
INSERT INTO provincia (codigo, nombre) VALUES ('08', 'Barcelona');
INSERT INTO provincia (codigo, nombre) VALUES ('09', 'Burgos');
INSERT INTO provincia (codigo, nombre) VALUES ('10', 'Cáceres');
INSERT INTO provincia (codigo, nombre) VALUES ('11', 'Cádiz');
INSERT INTO provincia (codigo, nombre) VALUES ('12', 'Castellón');
INSERT INTO provincia (codigo, nombre) VALUES ('13', 'Ciudad Real');
INSERT INTO provincia (codigo, nombre) VALUES ('14', 'Córdoba');
INSERT INTO provincia (codigo, nombre) VALUES ('15', 'A Coruña');
INSERT INTO provincia (codigo, nombre) VALUES ('16', 'Cuenca');
INSERT INTO provincia (codigo, nombre) VALUES ('17', 'Girona');
INSERT INTO provincia (codigo, nombre) VALUES ('18', 'Granada');
INSERT INTO provincia (codigo, nombre) VALUES ('19', 'Guadalajara');
INSERT INTO provincia (codigo, nombre) VALUES ('20', 'Gipuzkoa');
INSERT INTO provincia (codigo, nombre) VALUES ('21', 'Huelva');
INSERT INTO provincia (codigo, nombre) VALUES ('22', 'Huesca');
INSERT INTO provincia (codigo, nombre) VALUES ('23', 'Jaén');
INSERT INTO provincia (codigo, nombre) VALUES ('24', 'León');
INSERT INTO provincia (codigo, nombre) VALUES ('25', 'Lleida');
INSERT INTO provincia (codigo, nombre) VALUES ('26', 'La Rioja');
INSERT INTO provincia (codigo, nombre) VALUES ('27', 'Lugo');
INSERT INTO provincia (codigo, nombre) VALUES ('28', 'Madrid');
INSERT INTO provincia (codigo, nombre) VALUES ('29', 'Málaga');
INSERT INTO provincia (codigo, nombre) VALUES ('30', 'Murcia');
INSERT INTO provincia (codigo, nombre) VALUES ('31', 'Navarra');
INSERT INTO provincia (codigo, nombre) VALUES ('32', 'Ourense');
INSERT INTO provincia (codigo, nombre) VALUES ('33', 'Asturias');
INSERT INTO provincia (codigo, nombre) VALUES ('34', 'Palencia');
INSERT INTO provincia (codigo, nombre) VALUES ('35', 'Las Palmas');
INSERT INTO provincia (codigo, nombre) VALUES ('36', 'Pontevedra');
INSERT INTO provincia (codigo, nombre) VALUES ('37', 'Salamanca');
INSERT INTO provincia (codigo, nombre) VALUES ('38', 'Santa Cruz de Tenerife');
INSERT INTO provincia (codigo, nombre) VALUES ('39', 'Cantabria');
INSERT INTO provincia (codigo, nombre) VALUES ('40', 'Segovia');
INSERT INTO provincia (codigo, nombre) VALUES ('41', 'Sevilla');
INSERT INTO provincia (codigo, nombre) VALUES ('42', 'Soria');
INSERT INTO provincia (codigo, nombre) VALUES ('43', 'Tarragona');
INSERT INTO provincia (codigo, nombre) VALUES ('44', 'Teruel');
INSERT INTO provincia (codigo, nombre) VALUES ('45', 'Toledo');
INSERT INTO provincia (codigo, nombre) VALUES ('46', 'Valencia');
INSERT INTO provincia (codigo, nombre) VALUES ('47', 'Valladolid');
INSERT INTO provincia (codigo, nombre) VALUES ('48', 'Bizkaia');
INSERT INTO provincia (codigo, nombre) VALUES ('49', 'Zamora');
INSERT INTO provincia (codigo, nombre) VALUES ('50', 'Zaragoza');
INSERT INTO provincia (codigo, nombre) VALUES ('51', 'Ceuta');
INSERT INTO provincia (codigo, nombre) VALUES ('52', 'Melilla');