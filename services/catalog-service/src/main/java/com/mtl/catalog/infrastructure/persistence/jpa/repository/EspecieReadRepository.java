package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.dto.SpeciesListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.EspecieListRow;
import com.mtl.catalog.util.SpeciesLabelFormatter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Consultas de listado de especies (SQL nativo con {@code unaccent} y {@code strpos}).
 *
 * <p>Operaciones CRUD por id: {@link EspecieRepository}.
 */
public interface EspecieReadRepository extends EspecieRepository {

  @Query(
      value =
          """
          SELECT e.especie_id AS id, e.nombre_comun AS nombreComun, e.nombre_cientifico AS nombreCientifico,
                 e.genero_id AS generoId,
                 g.nombre_comun AS generoNombreComun, g.nombre_cientifico AS generoNombreCientifico
          FROM catalog.especie e
          INNER JOIN catalog.genero g ON g.genero_id = e.genero_id
          WHERE (
            CASE WHEN :filter = false THEN true
            ELSE (
              strpos(unaccent(lower(coalesce(e.nombre_comun, ''))), unaccent(lower(:q))) > 0
              OR strpos(unaccent(lower(e.nombre_cientifico)), unaccent(lower(:q))) > 0
            )
            END
          )
          ORDER BY lower(coalesce(nullif(trim(e.nombre_comun), ''), e.nombre_cientifico)) ASC,
                   lower(e.nombre_cientifico) ASC
          """,
      countQuery =
          """
          SELECT count(*) FROM catalog.especie e
          WHERE (
            CASE WHEN :filter = false THEN true
            ELSE (
              strpos(unaccent(lower(coalesce(e.nombre_comun, ''))), unaccent(lower(:q))) > 0
              OR strpos(unaccent(lower(e.nombre_cientifico)), unaccent(lower(:q))) > 0
            )
            END
          )
          """,
      nativeQuery = true)
  Page<EspecieListRow> searchSpeciesRows(
      @Param("filter") boolean filter, @Param("q") String q, Pageable pageable);

  default Page<SpeciesListItemDto> search(String q, Pageable pageable) {
    boolean filter = q != null && !q.isBlank();
    String qParam = filter ? q.trim() : "";
    Page<EspecieListRow> page = searchSpeciesRows(filter, qParam, pageable);
    return page.map(
        row ->
            new SpeciesListItemDto(
                row.getId(),
                SpeciesLabelFormatter.format(row.getNombreComun(), row.getNombreCientifico()),
                row.getGeneroId(),
                SpeciesLabelFormatter.format(
                    row.getGeneroNombreComun(), row.getGeneroNombreCientifico())));
  }
}
