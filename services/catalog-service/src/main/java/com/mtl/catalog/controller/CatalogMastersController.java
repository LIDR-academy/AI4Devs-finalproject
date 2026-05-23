package com.mtl.catalog.controller;

import com.mtl.catalog.application.MasterDataQueryService;
import com.mtl.catalog.dto.MasterDataPageResponse;
import com.mtl.catalog.dto.ProvinceListItemDto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Listados de maestros de referencia no taxonómicos (provincias). */
@RestController
@RequestMapping("/api/catalog")
@Validated
public class CatalogMastersController {

  private final MasterDataQueryService masterDataQueryService;

  public CatalogMastersController(MasterDataQueryService masterDataQueryService) {
    this.masterDataQueryService = masterDataQueryService;
  }

  @GetMapping("/provinces")
  public MasterDataPageResponse<ProvinceListItemDto> listProvinces(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
      @RequestParam(required = false) @Size(max = 200) String q,
      @RequestParam(defaultValue = "false") boolean unpaged) {
    return masterDataQueryService.listProvinces(page, size, q, unpaged);
  }
}
