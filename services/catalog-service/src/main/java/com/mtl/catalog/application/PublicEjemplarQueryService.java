package com.mtl.catalog.application;

import com.mtl.catalog.dto.PublicEjemplarDetailDto;
import com.mtl.catalog.dto.PublicEjemplarListItemDto;
import com.mtl.catalog.dto.PublicEjemplarListQuery;
import com.mtl.catalog.dto.PublicEjemplarPageResponse;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.PublicEjemplarReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.PublicEjemplarDetailRow;
import com.mtl.catalog.util.LikePatternEscape;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PublicEjemplarQueryService {

  private static final Set<String> PRIVILEGED_ROLES = Set.of("COLABORADOR", "ADMIN");
  private static final String PUBLICADO = "PUBLICADO";
  private static final String PUBLICO = "PUBLICO";

  private final PublicEjemplarReadRepository publicEjemplarReadRepository;

  public PublicEjemplarQueryService(PublicEjemplarReadRepository publicEjemplarReadRepository) {
    this.publicEjemplarReadRepository = publicEjemplarReadRepository;
  }

  @Transactional(readOnly = true)
  public PublicEjemplarPageResponse listPublishedEjemplares(
      int page, int size, PublicEjemplarListQuery query, Jwt jwt) {
    PublicEjemplarQueryCriteria criteria = PublicEjemplarQueryMapper.toCriteria(query);
    Pageable pageable = PageRequest.of(page, size);
    AccessScope scope = resolveScope(jwt, criteria.estadoPublicacion(), criteria.visibilidadMapa());

    Page<PublicEjemplarListItemDto> results =
        publicEjemplarReadRepository
            .findPublicEjemplarRows(
                normalizeContainsFilter(criteria.especieContains()),
                normalizeContainsFilter(criteria.provinciaContains()),
                normalizeContainsFilter(criteria.municipioContains()),
                scope.estado(),
                scope.visibilidad(),
                criteria.sortFieldPersistence(),
                criteria.sortDirection(),
                pageable)
            .map(
                row ->
                    new PublicEjemplarListItemDto(
                        row.getTreeId(),
                        row.getCommonName(),
                        row.getScientificName(),
                        row.getProvince(),
                        row.getMunicipality(),
                        row.getPublicationState(),
                        row.getPublicMapVisibility()));

    String sortEcho = criteria.sortFieldApi() + "," + criteria.sortDirection();
    return new PublicEjemplarPageResponse(
        results.getContent(), results.getTotalElements(), page, size, sortEcho);
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
        row.getTreeId(),
        row.getCommonName(),
        row.getScientificName(),
        row.getProvince(),
        row.getMunicipality(),
        row.getPublicationState(),
        row.getPublicMapVisibility(),
        row.getDescription(),
        row.getLatitude(),
        row.getLongitude(),
        row.getAltitude());
  }

  private static AccessScope resolveScope(
      Jwt jwt, String requestedEstado, String requestedVisibilidad) {
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
}
