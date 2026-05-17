package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorTreeDetailRow;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorTreeListRow;
import java.util.Optional;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CollaboratorTreeReadRepository extends JpaRepository<Arbol, Long> {

  @SuppressWarnings("java:S107")
  @Query(
      value =
          """
          SELECT
            a.arbol_id AS treeId,
            a.especie_id AS speciesId,
            coalesce(e.nombre_comun, '') AS nombreComun,
            e.nombre_cientifico AS nombreCientifico,
            p.nombre AS provincia,
            coalesce(a.municipio, '') AS municipio,
            a.estado_publicacion AS publicationState,
            a.visibilidad_mapa_publico AS publicMapVisibility,
            a.creado_en AS createdAt,
            a.modificado_en AS modifiedAt,
            a.usuario_app_id AS createdByUserId
          FROM catalog.arbol a
          JOIN catalog.especie e ON e.especie_id = a.especie_id
          JOIN catalog.provincia p ON p.provincia_id = a.provincia_id
          WHERE
            (:ownerUserId IS NULL OR a.usuario_app_id = :ownerUserId)
            AND (:speciesId IS NULL OR a.especie_id = :speciesId)
            AND (
              CAST(:createdFrom AS date) IS NULL
              OR (a.creado_en AT TIME ZONE 'UTC')::date >= CAST(:createdFrom AS date))
            AND (
              CAST(:createdTo AS date) IS NULL
              OR (a.creado_en AT TIME ZONE 'UTC')::date <= CAST(:createdTo AS date))
          ORDER BY
            CASE WHEN :sortField = 'modificado_en' AND :sortDir = 'asc' THEN a.modificado_en END ASC,
            CASE WHEN :sortField = 'modificado_en' AND :sortDir = 'desc' THEN a.modificado_en END DESC,
            CASE WHEN :sortField = 'creado_en' AND :sortDir = 'asc' THEN a.creado_en END ASC,
            CASE WHEN :sortField = 'creado_en' AND :sortDir = 'desc' THEN a.creado_en END DESC,
            a.modificado_en DESC
          """,
      countQuery =
          """
          SELECT count(*)
          FROM catalog.arbol a
          WHERE
            (:ownerUserId IS NULL OR a.usuario_app_id = :ownerUserId)
            AND (:speciesId IS NULL OR a.especie_id = :speciesId)
            AND (
              CAST(:createdFrom AS date) IS NULL
              OR (a.creado_en AT TIME ZONE 'UTC')::date >= CAST(:createdFrom AS date))
            AND (
              CAST(:createdTo AS date) IS NULL
              OR (a.creado_en AT TIME ZONE 'UTC')::date <= CAST(:createdTo AS date))
          """,
      nativeQuery = true)
  Page<CollaboratorTreeListRow> findCollaboratorTreeRows(
      @Param("ownerUserId") Long ownerUserId,
      @Param("speciesId") Long speciesId,
      @Param("createdFrom") LocalDate createdFrom,
      @Param("createdTo") LocalDate createdTo,
      @Param("sortField") String sortField,
      @Param("sortDir") String sortDir,
      Pageable pageable);

  @Query(
      value =
          """
          SELECT
            a.arbol_id AS treeId,
            a.especie_id AS speciesId,
            a.provincia_id AS provinceId,
            a.latitud AS latitude,
            a.longitud AS longitude,
            coalesce(a.municipio, '') AS municipality,
            a.descripcion AS description,
            a.altitud AS altitude,
            a.estado_publicacion AS publicationState,
            a.visibilidad_mapa_publico AS publicMapVisibility,
            a.usuario_app_id AS createdByUserId,
            coalesce(e.nombre_comun, '') AS nombreComun,
            e.nombre_cientifico AS nombreCientifico,
            p.nombre AS provinciaNombre,
            p.codigo AS provinciaCodigo,
            a.creado_en AS createdAt,
            a.modificado_en AS modifiedAt
          FROM catalog.arbol a
          JOIN catalog.especie e ON e.especie_id = a.especie_id
          JOIN catalog.provincia p ON p.provincia_id = a.provincia_id
          WHERE a.arbol_id = :treeId
          """,
      nativeQuery = true)
  Optional<CollaboratorTreeDetailRow> findCollaboratorTreeDetailRow(@Param("treeId") long treeId);
}
