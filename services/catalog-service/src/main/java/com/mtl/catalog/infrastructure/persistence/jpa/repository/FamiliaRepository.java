package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.Familia;
import com.mtl.catalog.dto.TaxonomyMasterListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.FamiliaListRow;
import com.mtl.catalog.util.SpeciesLabelFormatter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FamiliaRepository extends JpaRepository<Familia, Long> {

  int MAX_UNPAGED = EspecieRepository.MAX_UNPAGED;

  @Query(
      value =
          """
          SELECT f.familia_id AS id, f.nombre_comun AS nombreComun, f.nombre_cientifico AS nombreCientifico
          FROM catalog.familia f
          WHERE (
            CASE WHEN :filter = false THEN true
            ELSE (
              strpos(unaccent(lower(coalesce(f.nombre_comun, ''))), unaccent(lower(:q))) > 0
              OR strpos(unaccent(lower(f.nombre_cientifico)), unaccent(lower(:q))) > 0
            )
            END
          )
          ORDER BY lower(coalesce(nullif(trim(f.nombre_comun), ''), f.nombre_cientifico)) ASC,
                   lower(f.nombre_cientifico) ASC
          """,
      countQuery =
          """
          SELECT count(*) FROM catalog.familia f
          WHERE (
            CASE WHEN :filter = false THEN true
            ELSE (
              strpos(unaccent(lower(coalesce(f.nombre_comun, ''))), unaccent(lower(:q))) > 0
              OR strpos(unaccent(lower(f.nombre_cientifico)), unaccent(lower(:q))) > 0
            )
            END
          )
          """,
      nativeQuery = true)
  Page<FamiliaListRow> searchFamilyRows(
      @Param("filter") boolean filter, @Param("q") String q, Pageable pageable);

  default Page<TaxonomyMasterListItemDto> search(String q, Pageable pageable) {
    boolean filter = q != null && !q.isBlank();
    String qParam = filter ? q.trim() : "";
    return searchFamilyRows(filter, qParam, pageable)
        .map(
            row ->
                new TaxonomyMasterListItemDto(
                    row.getId(),
                    SpeciesLabelFormatter.format(row.getNombreComun(), row.getNombreCientifico())));
  }
}
