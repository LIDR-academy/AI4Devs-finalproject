package com.mtl.catalog.application;

import com.mtl.catalog.dto.PublicEjemplarDetailDto;
import com.mtl.catalog.dto.PublicEjemplarListItemDto;
import com.mtl.catalog.dto.PublicEjemplarPageResponse;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.PublicEjemplarReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.PublicEjemplarDetailRow;
import com.mtl.catalog.util.LikePatternEscape;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PublicEjemplarQueryService {

  private static final String DEFAULT_SORT = "especie,asc";
  private static final Set<String> PRIVILEGED_ROLES = Set.of("COLABORADOR", "ADMIN");
  private static final String PUBLICADO = "PUBLICADO";
  private static final String PUBLICO = "PUBLICO";
  private static final Set<String> SORT_FIELDS =
      Set.of("especie", "provincia", "municipio", "estado", "visibilidad", "ejemplarId");
  private static final Set<String> SORT_DIRECTIONS = Set.of("asc", "desc");

  private final PublicEjemplarReadRepository publicEjemplarReadRepository;

  public PublicEjemplarQueryService(PublicEjemplarReadRepository publicEjemplarReadRepository) {
    this.publicEjemplarReadRepository = publicEjemplarReadRepository;
  }

  @Transactional(readOnly = true)
  public PublicEjemplarPageResponse listPublishedEjemplares(
      int page,
      int size,
      String sort,
      PublicEjemplarFilters filters,
      Jwt jwt) {
    Pageable pageable = PageRequest.of(page, size);
    SortCriteria effectiveSort = normalizeSort(sort);
    AccessScope scope = resolveScope(jwt, filters.estado(), filters.visibilidad());

    Page<PublicEjemplarListItemDto> results =
        publicEjemplarReadRepository
            .findPublicEjemplarRows(
                normalizeContainsFilter(filters.especie()),
                normalizeContainsFilter(filters.provincia()),
                normalizeContainsFilter(filters.municipio()),
                scope.estado(),
                scope.visibilidad(),
                effectiveSort.field(),
                effectiveSort.direction(),
                pageable)
            .map(
                row ->
                    new PublicEjemplarListItemDto(
                        row.getEjemplarId(),
                        row.getNombreComun(),
                        row.getNombreCientifico(),
                        row.getProvincia(),
                        row.getMunicipio(),
                        row.getEstado(),
                        row.getVisibilidad()));

    return new PublicEjemplarPageResponse(
        results.getContent(),
        results.getTotalElements(),
        page,
        size,
        effectiveSort.field() + "," + effectiveSort.direction());
  }

  @Transactional(readOnly = true)
  public PublicEjemplarDetailDto getPublishedEjemplarDetail(long ejemplarId, Jwt jwt) {
    AccessScope scope = resolveScope(jwt, null, null);
    PublicEjemplarDetailRow row =
        publicEjemplarReadRepository
            .findPublicEjemplarDetailRow(ejemplarId, scope.estado(), scope.visibilidad())
            .orElseThrow(
                () ->
                    new CatalogNotFoundException(
                        "No se encontró el árbol público solicitado con id " + ejemplarId));

    return new PublicEjemplarDetailDto(
        row.getEjemplarId(),
        row.getNombreComun(),
        row.getNombreCientifico(),
        row.getProvincia(),
        row.getMunicipio(),
        row.getEstado(),
        row.getVisibilidad(),
        row.getDescripcion(),
        row.getLatitud(),
        row.getLongitud(),
        row.getAltura());
  }

  private static SortCriteria normalizeSort(String sort) {
    if (sort == null || sort.isBlank()) {
      return parseSort(DEFAULT_SORT);
    }
    return parseSort(sort.trim());
  }

  private static SortCriteria parseSort(String sort) {
    String[] parts = sort.split(",", 2);
    String field = parts[0].trim();
    String direction = parts.length == 2 ? parts[1].trim().toLowerCase(Locale.ROOT) : "asc";
    if (!SORT_FIELDS.contains(field) || !SORT_DIRECTIONS.contains(direction)) {
      return parseSort(DEFAULT_SORT);
    }
    return new SortCriteria(field, direction);
  }

  private static AccessScope resolveScope(Jwt jwt, String requestedEstado, String requestedVisibilidad) {
    if (!hasPrivilegedRole(jwt)) {
      return new AccessScope(PUBLICADO, PUBLICO);
    }
    return new AccessScope(normalizeFilter(requestedEstado), normalizeFilter(requestedVisibilidad));
  }

  private static boolean hasPrivilegedRole(Jwt jwt) {
    if (jwt == null) {
      return false;
    }
    Object realmAccess = jwt.getClaims().get("realm_access");
    if (!(realmAccess instanceof java.util.Map<?, ?> accessMap)) {
      return false;
    }
    Object rolesObj = accessMap.get("roles");
    if (!(rolesObj instanceof java.util.List<?> roles)) {
      return false;
    }
    return roles.stream()
        .filter(String.class::isInstance)
        .map(String.class::cast)
        .map(String::toUpperCase)
        .anyMatch(PRIVILEGED_ROLES::contains);
  }

  private static String normalizeFilter(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }

  /**
   * Filtro tipo “contiene” para {@code ILIKE} + {@code unaccent} en SQL: trim, nulo si vacío y escape de
   * metacaracteres de LIKE.
   */
  private static String normalizeContainsFilter(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return LikePatternEscape.escapeForSqlLike(value.trim());
  }

  private record AccessScope(String estado, String visibilidad) {}
  private record SortCriteria(String field, String direction) {}

  public record PublicEjemplarFilters(
      String especie, String provincia, String municipio, String estado, String visibilidad) {}
}
