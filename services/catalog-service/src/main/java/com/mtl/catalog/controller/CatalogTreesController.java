package com.mtl.catalog.controller;

import com.mtl.catalog.application.CreatedTreeResult;
import com.mtl.catalog.application.PublicTreeQueryService;
import com.mtl.catalog.application.PublicTreeQueryService.PublicTreeFilters;
import com.mtl.catalog.application.TreeMediaSubmissionPermissionService;
import com.mtl.catalog.application.TreeRegistrationService;
import com.mtl.catalog.dto.CreateTreeRequest;
import com.mtl.catalog.dto.CreatedTreeResponse;
import com.mtl.catalog.dto.MediaSubmissionPermissionResponse;
import com.mtl.catalog.dto.PublicTreeDetailDto;
import com.mtl.catalog.dto.PublicTreePageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/catalog")
@Validated
public class CatalogTreesController {

  private final TreeRegistrationService treeRegistrationService;
  private final PublicTreeQueryService publicTreeQueryService;
  private final TreeMediaSubmissionPermissionService treeMediaSubmissionPermissionService;

  public CatalogTreesController(
      TreeRegistrationService treeRegistrationService,
      PublicTreeQueryService publicTreeQueryService,
      TreeMediaSubmissionPermissionService treeMediaSubmissionPermissionService) {
    this.treeRegistrationService = treeRegistrationService;
    this.publicTreeQueryService = publicTreeQueryService;
    this.treeMediaSubmissionPermissionService = treeMediaSubmissionPermissionService;
  }

  @PostMapping("/trees")
  public ResponseEntity<CreatedTreeResponse> createTree(
      @Valid @RequestBody CreateTreeRequest request, @AuthenticationPrincipal Jwt jwt) {
    CreatedTreeResult result = treeRegistrationService.register(request, jwt);
    URI location =
        ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/catalog/trees/{id}")
            .buildAndExpand(result.arbolId())
            .toUri();
    return ResponseEntity.created(location)
        .body(new CreatedTreeResponse(result.arbolId()));
  }

  @GetMapping("/trees/{treeId}/media-submission-permission")
  public MediaSubmissionPermissionResponse mediaSubmissionPermission(
      @PathVariable long treeId, @AuthenticationPrincipal Jwt jwt) {
    return treeMediaSubmissionPermissionService.resolve(treeId, jwt);
  }

  @GetMapping("/public/trees")
  public PublicTreePageResponse listPublicTrees(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
      @RequestParam(defaultValue = "especie,asc") String sort,
      @RequestParam(required = false) @Size(max = 200) String especie,
      @RequestParam(required = false) @Size(max = 200) String provincia,
      @RequestParam(required = false) @Size(max = 200) String municipio,
      @RequestParam(required = false) @Size(max = 32) String estado,
      @RequestParam(required = false) @Size(max = 32) String visibilidad,
      @AuthenticationPrincipal Jwt jwt) {
    return publicTreeQueryService.listPublishedTrees(
        page,
        size,
        sort,
        new PublicTreeFilters(especie, provincia, municipio, estado, visibilidad),
        jwt);
  }

  @GetMapping("/public/trees/{treeId}")
  public PublicTreeDetailDto getPublicTreeDetail(
      @PathVariable long treeId, @AuthenticationPrincipal Jwt jwt) {
    return publicTreeQueryService.getPublishedTreeDetail(treeId, jwt);
  }
}
