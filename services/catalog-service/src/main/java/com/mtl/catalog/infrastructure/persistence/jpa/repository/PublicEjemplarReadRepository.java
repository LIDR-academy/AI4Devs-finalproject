package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.Ejemplar;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.PublicEjemplarDetailRow;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.PublicEjemplarListRow;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PublicEjemplarReadRepository extends JpaRepository<Ejemplar, Long> {

  @SuppressWarnings("java:S107")
  @Query(
      value =
          """
          SELECT
            a.ejemplar_id AS ejemplarId,
            coalesce(e.nombre_comun, '') AS commonName,
            e.nombre_cientifico AS scientificName,
            p.nombre AS province,
            coalesce(a.municipio, '') AS municipality,
            a.estado_publicacion AS publicationState,
            a.visibilidad_mapa_publico AS publicMapVisibility
          FROM catalog.ejemplar a
          JOIN catalog.especie e ON e.especie_id = a.especie_id
          JOIN catalog.provincia p ON p.provincia_id = a.provincia_id
          WHERE
            (:especie IS NULL
              OR unaccent(coalesce(e.nombre_cientifico, '')) ILIKE '%' || unaccent(:especie) || '%' ESCAPE '\\'
              OR unaccent(coalesce(e.nombre_comun, '')) ILIKE '%' || unaccent(:especie) || '%' ESCAPE '\\')
            AND (:provincia IS NULL OR unaccent(coalesce(p.nombre, '')) ILIKE '%' || unaccent(:provincia) || '%' ESCAPE '\\')
            AND (:municipio IS NULL OR unaccent(coalesce(a.municipio, '')) ILIKE '%' || unaccent(:municipio) || '%' ESCAPE '\\')
            AND (:estado IS NULL OR upper(a.estado_publicacion) = upper(:estado))
            AND (:visibilidad IS NULL OR upper(a.visibilidad_mapa_publico) = upper(:visibilidad))
          ORDER BY
            CASE WHEN :sortField = 'especie' AND :sortDir = 'asc' THEN e.nombre_cientifico END ASC,
            CASE WHEN :sortField = 'especie' AND :sortDir = 'desc' THEN e.nombre_cientifico END DESC,
            CASE WHEN :sortField = 'provincia' AND :sortDir = 'asc' THEN p.nombre END ASC,
            CASE WHEN :sortField = 'provincia' AND :sortDir = 'desc' THEN p.nombre END DESC,
            CASE WHEN :sortField = 'municipio' AND :sortDir = 'asc' THEN coalesce(a.municipio, '') END ASC,
            CASE WHEN :sortField = 'municipio' AND :sortDir = 'desc' THEN coalesce(a.municipio, '') END DESC,
            CASE WHEN :sortField = 'estado' AND :sortDir = 'asc' THEN a.estado_publicacion END ASC,
            CASE WHEN :sortField = 'estado' AND :sortDir = 'desc' THEN a.estado_publicacion END DESC,
            CASE WHEN :sortField = 'visibilidad' AND :sortDir = 'asc' THEN a.visibilidad_mapa_publico END ASC,
            CASE WHEN :sortField = 'visibilidad' AND :sortDir = 'desc' THEN a.visibilidad_mapa_publico END DESC,
            CASE WHEN :sortField = 'ejemplarId' AND :sortDir = 'asc' THEN a.ejemplar_id END ASC,
            CASE WHEN :sortField = 'ejemplarId' AND :sortDir = 'desc' THEN a.ejemplar_id END DESC,
            a.ejemplar_id ASC
          """,
      countQuery =
          """
          SELECT count(*)
          FROM catalog.ejemplar a
          JOIN catalog.especie e ON e.especie_id = a.especie_id
          JOIN catalog.provincia p ON p.provincia_id = a.provincia_id
          WHERE
            (:especie IS NULL
              OR unaccent(coalesce(e.nombre_cientifico, '')) ILIKE '%' || unaccent(:especie) || '%' ESCAPE '\\'
              OR unaccent(coalesce(e.nombre_comun, '')) ILIKE '%' || unaccent(:especie) || '%' ESCAPE '\\')
            AND (:provincia IS NULL OR unaccent(coalesce(p.nombre, '')) ILIKE '%' || unaccent(:provincia) || '%' ESCAPE '\\')
            AND (:municipio IS NULL OR unaccent(coalesce(a.municipio, '')) ILIKE '%' || unaccent(:municipio) || '%' ESCAPE '\\')
            AND (:estado IS NULL OR upper(a.estado_publicacion) = upper(:estado))
            AND (:visibilidad IS NULL OR upper(a.visibilidad_mapa_publico) = upper(:visibilidad))
          """,
      nativeQuery = true)
  Page<PublicEjemplarListRow> findPublicEjemplarRows(
      @Param("especie") String especie,
      @Param("provincia") String provincia,
      @Param("municipio") String municipio,
      @Param("estado") String estado,
      @Param("visibilidad") String visibilidad,
      @Param("sortField") String sortField,
      @Param("sortDir") String sortDir,
      Pageable pageable);

  @Query(
      value =
          """
          SELECT
            a.ejemplar_id AS ejemplarId,
            coalesce(e.nombre_comun, '') AS commonName,
            e.nombre_cientifico AS scientificName,
            p.nombre AS province,
            coalesce(a.municipio, '') AS municipality,
            a.estado_publicacion AS publicationState,
            a.visibilidad_mapa_publico AS publicMapVisibility,
            coalesce(a.descripcion, '') AS description,
            a.latitud AS latitude,
            a.longitud AS longitude,
            a.altitud AS altitude
          FROM catalog.ejemplar a
          JOIN catalog.especie e ON e.especie_id = a.especie_id
          JOIN catalog.provincia p ON p.provincia_id = a.provincia_id
          WHERE a.ejemplar_id = :ejemplarId
            AND (:estado IS NULL OR upper(a.estado_publicacion) = upper(:estado))
            AND (:visibilidad IS NULL OR upper(a.visibilidad_mapa_publico) = upper(:visibilidad))
          """,
      nativeQuery = true)
  Optional<PublicEjemplarDetailRow> findPublicEjemplarDetailRow(
      @Param("ejemplarId") long ejemplarId,
      @Param("estado") String estado,
      @Param("visibilidad") String visibilidad);
}
