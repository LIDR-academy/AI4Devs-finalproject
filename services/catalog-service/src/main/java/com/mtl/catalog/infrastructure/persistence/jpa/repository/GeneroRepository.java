package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.Genero;
import com.mtl.catalog.dto.TaxonomyGenusListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.GeneroListRow;
import com.mtl.catalog.util.SpeciesLabelFormatter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GeneroRepository extends JpaRepository<Genero, Long> {

  int MAX_UNPAGED = EspecieRepository.MAX_UNPAGED;

  @Query(
      value =
          """
          SELECT g.genero_id AS id, g.familia_id AS familiaId,
                 g.nombre_comun AS nombreComun, g.nombre_cientifico AS nombreCientifico
          FROM catalog.genero g
          WHERE (
            CASE WHEN :familyFilter = false THEN true ELSE g.familia_id = :familyId END
          )
          AND (
            CASE WHEN :filter = false THEN true
            ELSE (
              strpos(unaccent(lower(coalesce(g.nombre_comun, ''))), unaccent(lower(:q))) > 0
              OR strpos(unaccent(lower(g.nombre_cientifico)), unaccent(lower(:q))) > 0
            )
            END
          )
          ORDER BY g.nombre_cientifico ASC
          """,
      countQuery =
          """
          SELECT count(*) FROM catalog.genero g
          WHERE (
            CASE WHEN :familyFilter = false THEN true ELSE g.familia_id = :familyId END
          )
          AND (
            CASE WHEN :filter = false THEN true
            ELSE (
              strpos(unaccent(lower(coalesce(g.nombre_comun, ''))), unaccent(lower(:q))) > 0
              OR strpos(unaccent(lower(g.nombre_cientifico)), unaccent(lower(:q))) > 0
            )
            END
          )
          """,
      nativeQuery = true)
  Page<GeneroListRow> searchGenusRows(
      @Param("familyFilter") boolean familyFilter,
      @Param("familyId") long familyId,
      @Param("filter") boolean filter,
      @Param("q") String q,
      Pageable pageable);

  default Page<TaxonomyGenusListItemDto> search(Long familyId, String q, Pageable pageable) {
    boolean familyFilter = familyId != null;
    long familyIdParam = familyId != null ? familyId : 0L;
    boolean filter = q != null && !q.isBlank();
    String qParam = filter ? q.trim() : "";
    return searchGenusRows(familyFilter, familyIdParam, filter, qParam, pageable)
        .map(
            row ->
                new TaxonomyGenusListItemDto(
                    row.getId(),
                    SpeciesLabelFormatter.format(row.getNombreComun(), row.getNombreCientifico()),
                    row.getFamiliaId()));
  }
}
