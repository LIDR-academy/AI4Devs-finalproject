package com.mtl.catalog.application;

import com.mtl.catalog.dto.PublicEjemplarListQuery;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Traduce contrato HTTP (inglés) → criterios de persistencia (dominio en español). */
final class PublicEjemplarQueryMapper {

  private static final String DEFAULT_SORT_API = "species,asc";
  private static final String DEFAULT_SORT_PERSISTENCE = "especie";

  private static final Set<String> SORT_DIRECTIONS = Set.of("asc", "desc");

  private static final Map<String, String> SORT_API_TO_PERSISTENCE =
      Map.of(
          "species", "especie",
          "province", "provincia",
          "municipality", "municipio",
          "publicationState", "estado",
          "publicMapVisibility", "visibilidad",
          "treeId", "treeId");

  private PublicEjemplarQueryMapper() {}

  static PublicEjemplarQueryCriteria toCriteria(PublicEjemplarListQuery query) {
    ResolvedSort sort = resolveSort(query.sort());
    return new PublicEjemplarQueryCriteria(
        query.species(),
        query.province(),
        query.municipality(),
        query.publicationState(),
        query.publicMapVisibility(),
        sort.persistenceField(),
        sort.direction(),
        sort.apiField());
  }

  private static ResolvedSort resolveSort(String sort) {
    if (sort == null || sort.isBlank()) {
      return resolveSort(DEFAULT_SORT_API);
    }
    String[] parts = sort.trim().split(",", 2);
    String apiField = parts[0].trim();
    String direction = parts.length == 2 ? parts[1].trim().toLowerCase(Locale.ROOT) : "asc";
    String persistenceField = SORT_API_TO_PERSISTENCE.get(apiField);
    if (persistenceField == null || !SORT_DIRECTIONS.contains(direction)) {
      return resolveSort(DEFAULT_SORT_API);
    }
    return new ResolvedSort(apiField, persistenceField, direction);
  }

  private record ResolvedSort(String apiField, String persistenceField, String direction) {}
}
