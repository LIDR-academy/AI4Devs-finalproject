package com.mtl.catalog.controller;

import com.mtl.catalog.application.MasterDataQueryService;
import com.mtl.catalog.application.TaxonomyAdminService;
import com.mtl.catalog.dto.CreateTaxonomySpeciesRequest;
import com.mtl.catalog.dto.MasterDataPageResponse;
import com.mtl.catalog.dto.SpeciesListItemDto;
import com.mtl.catalog.dto.TaxonomySpeciesResponse;
import com.mtl.catalog.dto.UpdateTaxonomySpeciesRequest;
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

/** Recurso REST {@code /api/catalog/species}: listado (COLABORADOR/ADMIN) y mantenimiento (ADMIN). */
@RestController
@RequestMapping("/api/catalog/species")
@Validated
public class CatalogSpeciesController {

  private final MasterDataQueryService masterDataQueryService;
  private final TaxonomyAdminService taxonomyAdminService;

  public CatalogSpeciesController(
      MasterDataQueryService masterDataQueryService, TaxonomyAdminService taxonomyAdminService) {
    this.masterDataQueryService = masterDataQueryService;
    this.taxonomyAdminService = taxonomyAdminService;
  }

  @GetMapping
  public MasterDataPageResponse<SpeciesListItemDto> listSpecies(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
      @RequestParam(required = false) @Size(max = 200) String q,
      @RequestParam(required = false) @Min(1) Long genusId,
      @RequestParam(required = false) @Min(1) Long speciesId,
      @RequestParam(defaultValue = "false") boolean unpaged) {
    return masterDataQueryService.listSpecies(page, size, q, genusId, speciesId, unpaged);
  }

  @PostMapping
  public ResponseEntity<TaxonomySpeciesResponse> createSpecies(
      @Valid @RequestBody CreateTaxonomySpeciesRequest request, @AuthenticationPrincipal Jwt jwt) {
    TaxonomySpeciesResponse created = taxonomyAdminService.createSpecies(request, jwt);
    URI location =
        ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/catalog/species/{speciesId}")
            .buildAndExpand(created.speciesId())
            .toUri();
    return ResponseEntity.created(location).body(created);
  }

  @GetMapping("/{speciesId}")
  public TaxonomySpeciesResponse getSpecies(@PathVariable long speciesId) {
    return taxonomyAdminService.getSpecies(speciesId);
  }

  @PutMapping("/{speciesId}")
  public TaxonomySpeciesResponse updateSpecies(
      @PathVariable long speciesId,
      @Valid @RequestBody UpdateTaxonomySpeciesRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return taxonomyAdminService.updateSpecies(speciesId, request, jwt);
  }

  @DeleteMapping("/{speciesId}")
  public ResponseEntity<Void> deleteSpecies(
      @PathVariable long speciesId, @AuthenticationPrincipal Jwt jwt) {
    taxonomyAdminService.deleteSpecies(speciesId, jwt);
    return ResponseEntity.noContent().build();
  }
}
