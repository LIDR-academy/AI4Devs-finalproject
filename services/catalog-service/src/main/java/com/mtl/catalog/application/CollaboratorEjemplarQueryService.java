package com.mtl.catalog.application;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.CollaboratorEjemplarDetailDto;
import com.mtl.catalog.dto.CollaboratorEjemplarListItemDto;
import com.mtl.catalog.dto.CollaboratorEjemplarPageResponse;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.CollaboratorEjemplarReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorEjemplarDetailRow;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorEjemplarListRow;
import com.mtl.catalog.util.JwtRealmRoles;
import com.mtl.catalog.util.OidcUserProfileExtractor;
import com.mtl.catalog.util.ProjectionTimestamps;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CollaboratorEjemplarQueryService {

  private static final String DEFAULT_SORT = "modificado_en,desc";
  private static final Set<String> SORT_FIELDS = Set.of("modificado_en", "creado_en");
  private static final Set<String> SORT_DIRECTIONS = Set.of("asc", "desc");

  private final CollaboratorEjemplarReadRepository collaboratorEjemplarReadRepository;
  private final UsuarioAppMaterializationService usuarioAppMaterializationService;

  public CollaboratorEjemplarQueryService(
      CollaboratorEjemplarReadRepository collaboratorEjemplarReadRepository,
      UsuarioAppMaterializationService usuarioAppMaterializationService) {
    this.collaboratorEjemplarReadRepository = collaboratorEjemplarReadRepository;
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
  }

  @Transactional(readOnly = true)
  public CollaboratorEjemplarPageResponse listCollaboratorEjemplares(
      int page,
      int size,
      String sort,
      CollaboratorEjemplarFilters filters,
      Jwt jwt) {
    validateDateRange(filters.createdFrom(), filters.createdTo());

    UsuarioApp actor = materializeActor(jwt);
    boolean admin = JwtRealmRoles.hasRealmRole(jwt, "ADMIN");
    boolean collaborator = JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR");

    if (!admin && !collaborator) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para listar fichas de árbol.");
    }

    Long ownerUserId = resolveOwnerUserId(admin, collaborator, actor.getId(), filters.createdByUserId());

    Pageable pageable = PageRequest.of(page, size);
    SortCriteria effectiveSort = normalizeSort(sort);

    Page<CollaboratorEjemplarListItemDto> results =
        collaboratorEjemplarReadRepository
            .findCollaboratorEjemplarRows(
                ownerUserId,
                filters.speciesId(),
                filters.createdFrom(),
                filters.createdTo(),
                effectiveSort.field(),
                effectiveSort.direction(),
                pageable)
            .map(this::toListItem);

    return new CollaboratorEjemplarPageResponse(
        results.getContent(),
        results.getTotalElements(),
        page,
        size,
        effectiveSort.field() + "," + effectiveSort.direction());
  }

  @Transactional(readOnly = true)
  public CollaboratorEjemplarDetailDto getCollaboratorEjemplarDetail(long ejemplarId, Jwt jwt) {
    UsuarioApp actor = materializeActor(jwt);
    boolean admin = JwtRealmRoles.hasRealmRole(jwt, "ADMIN");
    boolean collaborator = JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR");

    if (!admin && !collaborator) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para consultar fichas de árbol.");
    }

    CollaboratorEjemplarDetailRow row =
        collaboratorEjemplarReadRepository
            .findCollaboratorEjemplarDetailRow(ejemplarId)
            .orElseThrow(
                () ->
                    new CatalogNotFoundException(
                        "No se encontró un árbol con el identificador indicado."));

    if (!admin && !row.getCreatedByUserId().equals(actor.getId())) {
      throw new CatalogForbiddenException(
          "No tiene permiso para consultar esta ficha de árbol.");
    }

    return CollaboratorEjemplarDetailMapper.toDetailDto(row);
  }

  private static void validateDateRange(LocalDate createdFrom, LocalDate createdTo) {
    if (createdFrom != null && createdTo != null && createdFrom.isAfter(createdTo)) {
      throw new CatalogValidationException(
          "El parámetro createdFrom no puede ser posterior a createdTo.");
    }
  }

  private static Long resolveOwnerUserId(
      boolean admin, boolean collaborator, long actorUserId, Long createdByUserId) {
    if (admin) {
      return createdByUserId;
    }
    if (collaborator) {
      if (createdByUserId != null) {
        throw new CatalogForbiddenException(
            "El filtro createdByUserId solo está permitido para rol ADMIN.");
      }
      return actorUserId;
    }
    return actorUserId;
  }

  private UsuarioApp materializeActor(Jwt jwt) {
    return usuarioAppMaterializationService.materialize(OidcUserProfileExtractor.extract(jwt));
  }

  private CollaboratorEjemplarListItemDto toListItem(CollaboratorEjemplarListRow row) {
    return new CollaboratorEjemplarListItemDto(
        row.getTreeId(),
        row.getSpeciesId(),
        row.getCommonName(),
        row.getScientificName(),
        row.getProvince(),
        row.getMunicipality(),
        row.getPublicationState(),
        row.getPublicMapVisibility(),
        ProjectionTimestamps.toOffsetDateTime(row.getCreatedAt()),
        ProjectionTimestamps.toOffsetDateTime(row.getModifiedAt()),
        row.getCreatedByUserId());
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
    String direction = parts.length == 2 ? parts[1].trim().toLowerCase(Locale.ROOT) : "desc";
    if (!SORT_FIELDS.contains(field) || !SORT_DIRECTIONS.contains(direction)) {
      return parseSort(DEFAULT_SORT);
    }
    return new SortCriteria(field, direction);
  }

  private record SortCriteria(String field, String direction) {}

  public record CollaboratorEjemplarFilters(
      Long speciesId, LocalDate createdFrom, LocalDate createdTo, Long createdByUserId) {}
}
