package com.mtl.catalog.application;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.CollaboratorTreeDetailDto;
import com.mtl.catalog.dto.CollaboratorTreeListItemDto;
import com.mtl.catalog.dto.CollaboratorTreePageResponse;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.CollaboratorTreeReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorTreeDetailRow;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorTreeListRow;
import com.mtl.catalog.util.JwtRealmRoles;
import com.mtl.catalog.util.OidcUserProfileExtractor;
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
public class CollaboratorTreeQueryService {

  private static final String DEFAULT_SORT = "modificado_en,desc";
  private static final Set<String> SORT_FIELDS = Set.of("modificado_en", "creado_en");
  private static final Set<String> SORT_DIRECTIONS = Set.of("asc", "desc");

  private final CollaboratorTreeReadRepository collaboratorTreeReadRepository;
  private final UsuarioAppMaterializationService usuarioAppMaterializationService;

  public CollaboratorTreeQueryService(
      CollaboratorTreeReadRepository collaboratorTreeReadRepository,
      UsuarioAppMaterializationService usuarioAppMaterializationService) {
    this.collaboratorTreeReadRepository = collaboratorTreeReadRepository;
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
  }

  @Transactional(readOnly = true)
  public CollaboratorTreePageResponse listCollaboratorTrees(
      int page,
      int size,
      String sort,
      CollaboratorTreeFilters filters,
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

    Page<CollaboratorTreeListItemDto> results =
        collaboratorTreeReadRepository
            .findCollaboratorTreeRows(
                ownerUserId,
                filters.speciesId(),
                filters.createdFrom(),
                filters.createdTo(),
                effectiveSort.field(),
                effectiveSort.direction(),
                pageable)
            .map(this::toListItem);

    return new CollaboratorTreePageResponse(
        results.getContent(),
        results.getTotalElements(),
        page,
        size,
        effectiveSort.field() + "," + effectiveSort.direction());
  }

  @Transactional(readOnly = true)
  public CollaboratorTreeDetailDto getCollaboratorTreeDetail(long treeId, Jwt jwt) {
    UsuarioApp actor = materializeActor(jwt);
    boolean admin = JwtRealmRoles.hasRealmRole(jwt, "ADMIN");
    boolean collaborator = JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR");

    if (!admin && !collaborator) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para consultar fichas de árbol.");
    }

    CollaboratorTreeDetailRow row =
        collaboratorTreeReadRepository
            .findCollaboratorTreeDetailRow(treeId)
            .orElseThrow(
                () ->
                    new CatalogNotFoundException(
                        "No se encontró un árbol con el identificador indicado."));

    if (!admin && !row.getCreatedByUserId().equals(actor.getId())) {
      throw new CatalogForbiddenException(
          "No tiene permiso para consultar esta ficha de árbol.");
    }

    return CollaboratorTreeDetailMapper.toDetailDto(row);
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

  private CollaboratorTreeListItemDto toListItem(CollaboratorTreeListRow row) {
    return new CollaboratorTreeListItemDto(
        row.getTreeId(),
        row.getSpeciesId(),
        row.getNombreComun(),
        row.getNombreCientifico(),
        row.getProvincia(),
        row.getMunicipio(),
        row.getPublicationState(),
        row.getPublicMapVisibility(),
        row.getCreatedAt(),
        row.getModifiedAt(),
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

  public record CollaboratorTreeFilters(
      Long speciesId, LocalDate createdFrom, LocalDate createdTo, Long createdByUserId) {}
}
