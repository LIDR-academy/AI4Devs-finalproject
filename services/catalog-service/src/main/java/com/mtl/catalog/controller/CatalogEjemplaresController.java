package com.mtl.catalog.controller;

import com.mtl.catalog.application.CollaboratorEjemplarQueryService;
import com.mtl.catalog.application.CollaboratorEjemplarQueryService.CollaboratorEjemplarFilters;
import com.mtl.catalog.application.CreatedEjemplarResult;
import com.mtl.catalog.application.PublicEjemplarQueryService;
import com.mtl.catalog.application.EjemplarMediaSubmissionPermissionService;
import com.mtl.catalog.application.EjemplarDeletionService;
import com.mtl.catalog.application.EjemplarModificationService;
import com.mtl.catalog.application.EjemplarRegistrationService;
import com.mtl.catalog.dto.CollaboratorEjemplarDetailDto;
import com.mtl.catalog.dto.CollaboratorEjemplarPageResponse;
import com.mtl.catalog.dto.CreateEjemplarRequest;
import com.mtl.catalog.dto.CreatedEjemplarResponse;
import com.mtl.catalog.dto.MediaSubmissionPermissionResponse;
import com.mtl.catalog.dto.PublicEjemplarDetailDto;
import com.mtl.catalog.dto.PublicEjemplarListQuery;
import com.mtl.catalog.dto.PublicEjemplarPageResponse;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/catalog")
@Validated
public class CatalogEjemplaresController {

  private final EjemplarRegistrationService ejemplarRegistrationService;
  private final EjemplarModificationService ejemplarModificationService;
  private final EjemplarDeletionService ejemplarDeletionService;
  private final CollaboratorEjemplarQueryService collaboratorEjemplarQueryService;
  private final PublicEjemplarQueryService publicEjemplarQueryService;
  private final EjemplarMediaSubmissionPermissionService ejemplarMediaSubmissionPermissionService;

  public CatalogEjemplaresController(
      EjemplarRegistrationService ejemplarRegistrationService,
      EjemplarModificationService ejemplarModificationService,
      EjemplarDeletionService ejemplarDeletionService,
      CollaboratorEjemplarQueryService collaboratorEjemplarQueryService,
      PublicEjemplarQueryService publicEjemplarQueryService,
      EjemplarMediaSubmissionPermissionService ejemplarMediaSubmissionPermissionService) {
    this.ejemplarRegistrationService = ejemplarRegistrationService;
    this.ejemplarModificationService = ejemplarModificationService;
    this.ejemplarDeletionService = ejemplarDeletionService;
    this.collaboratorEjemplarQueryService = collaboratorEjemplarQueryService;
    this.publicEjemplarQueryService = publicEjemplarQueryService;
    this.ejemplarMediaSubmissionPermissionService = ejemplarMediaSubmissionPermissionService;
  }

  @GetMapping("/trees")
  public CollaboratorEjemplarPageResponse listCollaboratorEjemplares(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
      @RequestParam(defaultValue = "modificado_en,desc") String sort,
      @RequestParam(required = false) Long speciesId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate createdFrom,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate createdTo,
      @RequestParam(required = false) Long createdByUserId,
      @AuthenticationPrincipal Jwt jwt) {
    return collaboratorEjemplarQueryService.listCollaboratorEjemplares(
        page,
        size,
        sort,
        new CollaboratorEjemplarFilters(speciesId, createdFrom, createdTo, createdByUserId),
        jwt);
  }

  @GetMapping("/trees/{treeId}")
  public CollaboratorEjemplarDetailDto getCollaboratorEjemplarDetail(
      @PathVariable long treeId, @AuthenticationPrincipal Jwt jwt) {
    return collaboratorEjemplarQueryService.getCollaboratorEjemplarDetail(treeId, jwt);
  }

  @PutMapping("/trees/{treeId}")
  public CollaboratorEjemplarDetailDto updateCollaboratorEjemplar(
      @PathVariable long treeId,
      @Valid @RequestBody CreateEjemplarRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ejemplarModificationService.updateEjemplar(treeId, request, jwt);
  }

  @DeleteMapping("/trees/{treeId}")
  public ResponseEntity<Void> deleteCollaboratorEjemplar(
      @PathVariable long treeId, @AuthenticationPrincipal Jwt jwt) {
    ejemplarDeletionService.deleteEjemplar(treeId, jwt);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/trees")
  public ResponseEntity<CreatedEjemplarResponse> createEjemplar(
      @Valid @RequestBody CreateEjemplarRequest request, @AuthenticationPrincipal Jwt jwt) {
    CreatedEjemplarResult result = ejemplarRegistrationService.register(request, jwt);
    URI location =
        ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/catalog/trees/{id}")
            .buildAndExpand(result.treeId())
            .toUri();
    return ResponseEntity.created(location)
        .body(new CreatedEjemplarResponse(result.treeId()));
  }

  @GetMapping("/trees/{treeId}/media-submission-permission")
  public MediaSubmissionPermissionResponse mediaSubmissionPermission(
      @PathVariable long treeId, @AuthenticationPrincipal Jwt jwt) {
    return ejemplarMediaSubmissionPermissionService.resolve(treeId, jwt);
  }

  @GetMapping("/public/trees")
  public PublicEjemplarPageResponse listPublicEjemplares(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
      @RequestParam(defaultValue = "species,asc") String sort,
      @RequestParam(required = false) @Size(max = 200) String species,
      @RequestParam(required = false) @Size(max = 200) String province,
      @RequestParam(required = false) @Size(max = 200) String municipality,
      @RequestParam(required = false) @Size(max = 32) String publicationState,
      @RequestParam(required = false) @Size(max = 32) String publicMapVisibility,
      @AuthenticationPrincipal Jwt jwt) {
    return publicEjemplarQueryService.listPublishedEjemplares(
        page,
        size,
        new PublicEjemplarListQuery(
            species, province, municipality, publicationState, publicMapVisibility, sort),
        jwt);
  }

  @GetMapping("/public/trees/{treeId}")
  public PublicEjemplarDetailDto getPublicEjemplarDetail(
      @PathVariable long treeId, @AuthenticationPrincipal Jwt jwt) {
    return publicEjemplarQueryService.getPublishedEjemplarDetail(treeId, jwt);
  }
}
