package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.Provincia;
import com.mtl.catalog.dto.ProvinceListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.ProvinciaListRow;
import com.mtl.catalog.util.ProvinceLabelFormatter;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProvinciaReadRepository extends JpaRepository<Provincia, Long> {

  int MAX_UNPAGED = EspecieRepository.MAX_UNPAGED;

  @Query(
      value = "SELECT p.nombre FROM catalog.provincia p ORDER BY p.nombre ASC",
      nativeQuery = true)
  List<String> findAllProvinceNamesOrdered();

  @Query(
      value =
          """
          SELECT p.provincia_id AS id, p.nombre AS nombre, p.codigo AS codigo
          FROM catalog.provincia p
          WHERE (
            CASE WHEN :filter = false THEN true
            ELSE (
              strpos(unaccent(lower(p.nombre)), unaccent(lower(:q))) > 0
              OR strpos(unaccent(lower(p.codigo)), unaccent(lower(:q))) > 0
            )
            END
          )
          ORDER BY p.nombre ASC
          """,
      countQuery =
          """
          SELECT count(*) FROM catalog.provincia p
          WHERE (
            CASE WHEN :filter = false THEN true
            ELSE (
              strpos(unaccent(lower(p.nombre)), unaccent(lower(:q))) > 0
              OR strpos(unaccent(lower(p.codigo)), unaccent(lower(:q))) > 0
            )
            END
          )
          """,
      nativeQuery = true)
  Page<ProvinciaListRow> searchProvinciaRows(
      @Param("filter") boolean filter, @Param("q") String q, Pageable pageable);

  default Page<ProvinceListItemDto> search(String q, Pageable pageable) {
    boolean filter = q != null && !q.isBlank();
    String qParam = filter ? q.trim() : "";
    Page<ProvinciaListRow> page = searchProvinciaRows(filter, qParam, pageable);
    return page.map(
        row ->
            new ProvinceListItemDto(
                row.getId(), ProvinceLabelFormatter.format(row.getNombre(), row.getCodigo())));
  }
}
