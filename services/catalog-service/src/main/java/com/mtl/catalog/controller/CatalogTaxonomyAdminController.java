package com.mtl.catalog.controller;

import com.mtl.catalog.application.MasterDataQueryService;
import com.mtl.catalog.application.TaxonomyAdminService;
import com.mtl.catalog.dto.CreateTaxonomyFamilyRequest;
import com.mtl.catalog.dto.CreateTaxonomyGenusRequest;
import com.mtl.catalog.dto.MasterDataPageResponse;
import com.mtl.catalog.dto.TaxonomyFamilyResponse;
import com.mtl.catalog.dto.TaxonomyGenusListItemDto;
import com.mtl.catalog.dto.TaxonomyGenusResponse;
import com.mtl.catalog.dto.TaxonomyMasterListItemDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Mantenimiento taxonómico ADMIN: familias y géneros (UC-07). */
@RestController
@RequestMapping("/api/catalog")
@Validated
public class CatalogTaxonomyAdminController {

  private final MasterDataQueryService masterDataQueryService;
  private final TaxonomyAdminService taxonomyAdminService;

  public CatalogTaxonomyAdminController(
      MasterDataQueryService masterDataQueryService, TaxonomyAdminService taxonomyAdminService) {
    this.masterDataQueryService = masterDataQueryService;
    this.taxonomyAdminService = taxonomyAdminService;
  }

  @GetMapping("/families")
  public MasterDataPageResponse<TaxonomyMasterListItemDto> listFamilies(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
      @RequestParam(required = false) @Size(max = 200) String q,
      @RequestParam(defaultValue = "false") boolean unpaged) {
    return masterDataQueryService.listFamilies(page, size, q, unpaged);
  }

  @PostMapping("/families")
  @ResponseStatus(HttpStatus.CREATED)
  public TaxonomyFamilyResponse createFamily(
      @Valid @RequestBody CreateTaxonomyFamilyRequest request, @AuthenticationPrincipal Jwt jwt) {
    return taxonomyAdminService.createFamily(request, jwt);
  }

  @GetMapping("/genera")
  public MasterDataPageResponse<TaxonomyGenusListItemDto> listGenera(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
      @RequestParam(required = false) Long familyId,
      @RequestParam(required = false) @Size(max = 200) String q,
      @RequestParam(defaultValue = "false") boolean unpaged) {
    return masterDataQueryService.listGenera(page, size, familyId, q, unpaged);
  }

  @PostMapping("/genera")
  @ResponseStatus(HttpStatus.CREATED)
  public TaxonomyGenusResponse createGenus(
      @Valid @RequestBody CreateTaxonomyGenusRequest request, @AuthenticationPrincipal Jwt jwt) {
    return taxonomyAdminService.createGenus(request, jwt);
  }
}
